import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { apiResponse } from '@/lib/api/response';
import { getMercadoPagoService } from '@/services/payments/mercadopago.service';

interface MercadoPagoWebhook {
  id: string;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: string;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Headers do Mercado Pago
    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');
    
    const body: MercadoPagoWebhook = await req.json();
    
    console.log('Webhook Mercado Pago recebido:', {
      type: body.type,
      action: body.action,
      dataId: body.data.id,
      signature: signature ? 'presente' : 'ausente'
    });

    // Validar assinatura (básica por enquanto)
    const mpService = getMercadoPagoService();
    if (!mpService.validateWebhookSignature(signature, requestId, body.data.id)) {
      console.error('Assinatura do webhook inválida');
      return apiResponse.error('Assinatura inválida', 401);
    }

    // Processar apenas notificações de pagamento
    if (body.type === 'payment' && body.action === 'payment.updated') {
      const paymentId = body.data.id;
      
      // Buscar o status atual no Mercado Pago
      const paymentStatus = await mpService.getPaymentStatus(parseInt(paymentId));
      
      console.log(`Status do pagamento ${paymentId}: ${paymentStatus}`);
      
      // Buscar a transação PIX pelo ID externo
      const pixTransaction = await prisma.pixTransaction.findFirst({
        where: { externalId: paymentId }
      });

      if (!pixTransaction) {
        console.error(`PIX transaction não encontrada para payment ID: ${paymentId}`);
        return apiResponse.success({ received: true });
      }

      // Atualizar status baseado na resposta do MP
      if (paymentStatus === 'approved' && pixTransaction.status !== 'APPROVED') {
        await prisma.$transaction(async (tx) => {
          // Atualizar PIX
          await tx.pixTransaction.update({
            where: { id: pixTransaction.id },
            data: { 
              status: 'APPROVED',
              updatedAt: new Date()
            }
          });

          // Atualizar Trade
          await tx.trade.update({
            where: { id: pixTransaction.tradeId },
            data: { 
              status: 'PAYMENT_CONFIRMED',
              updatedAt: new Date()
            }
          });

          // Criar notificação para o vendedor
          const trade = await tx.trade.findUnique({
            where: { id: pixTransaction.tradeId },
            include: { listing: true }
          });

          if (trade) {
            await tx.notification.create({
              data: {
                userId: trade.sellerId,
                type: 'PAYMENT_RECEIVED',
                title: 'Pagamento PIX Confirmado',
                message: `Pagamento de R$ ${trade.totalAmount.toFixed(2)} confirmado. Libere ${trade.cryptoAmount} ${trade.listing.cryptoSymbol}.`,
                data: {
                  tradeId: trade.id,
                  amount: trade.totalAmount,
                  cryptoAmount: trade.cryptoAmount,
                  cryptoSymbol: trade.listing.cryptoSymbol
                }
              }
            });
          }
        });

        console.log(`PIX aprovado e trade atualizada: ${pixTransaction.tradeId}`);
      
      } else if (paymentStatus === 'rejected' && pixTransaction.status !== 'FAILED') {
        await prisma.$transaction([
          prisma.pixTransaction.update({
            where: { id: pixTransaction.id },
            data: { status: 'FAILED' }
          }),
          prisma.trade.update({
            where: { id: pixTransaction.tradeId },
            data: { status: 'PAYMENT_FAILED' }
          })
        ]);
        
        console.log(`PIX rejeitado: ${pixTransaction.id}`);
      }
    }

    return apiResponse.success({ received: true });

  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);
    // Retornar 200 mesmo com erro para evitar retry do MP
    return apiResponse.success({ received: true, error: true });
  }
}

// Endpoint para teste manual do webhook
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return apiResponse.error('Endpoint disponível apenas em desenvolvimento');
  }

  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('paymentId');
  
  if (!paymentId) {
    return apiResponse.error('Payment ID é obrigatório');
  }

  // Simular webhook
  const mockWebhook = {
    id: Date.now().toString(),
    live_mode: false,
    type: 'payment',
    date_created: new Date().toISOString(),
    user_id: '123456',
    api_version: 'v1',
    action: 'payment.updated',
    data: { id: paymentId }
  };

  // Criar request fake
  const fakeReq = new Request('http://localhost/api/webhooks/mercadopago', {
    method: 'POST',
    headers: {
      'x-signature': 'test-signature',
      'x-request-id': 'test-request-id'
    },
    body: JSON.stringify(mockWebhook)
  });

  return POST(fakeReq as NextRequest);
}