import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getMercadoPagoService } from '@/services/mercadopago';
import { ApiResponse } from '@/lib/api/response';
import { TransactionStatus } from '@prisma/client';
import crypto from 'crypto';

// Webhook secret do Mercado Pago (deve estar no .env)
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';

/**
 * Interface para o payload do webhook do Mercado Pago
 */
interface MercadoPagoWebhookPayload {
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

/**
 * Interface para dados do pagamento
 */
interface PaymentData {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  date_approved?: string;
  payer: {
    email: string;
  };
}

/**
 * Valida a assinatura do webhook
 */
function validateWebhookSignature(
  signature: string | null,
  dataId: string,
  requestId: string | null
): boolean {
  if (!signature || !WEBHOOK_SECRET) {
    console.error('Assinatura ou secret ausente');
    return false;
  }

  try {
    // Formato esperado: ts=timestamp,v1=hash
    const parts = signature.split(',');
    const timestamp = parts[0]?.split('=')[1];
    const hash = parts[1]?.split('=')[1];

    if (!timestamp || !hash) {
      console.error('Formato de assinatura inválido');
      return false;
    }

    // Criar a string para hash: id;request-id;timestamp
    const signatureString = `${dataId};${requestId || ''};${timestamp}`;
    
    // Gerar hash HMAC SHA256
    const expectedHash = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signatureString)
      .digest('hex');

    // Comparar hashes de forma segura (timing-safe)
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    console.error('Erro ao validar assinatura:', error);
    return false;
  }
}

/**
 * Processa o evento de pagamento
 */
async function processPaymentEvent(
  paymentId: string,
  action: string
): Promise<void> {
  try {
    // 1. Buscar dados do pagamento no Mercado Pago
    const mercadoPagoService = getMercadoPagoService();
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar pagamento: ${response.statusText}`);
    }

    const paymentData: PaymentData = await response.json();

    // 2. Buscar transação pelo paymentId
    const transaction = await db.transaction.findFirst({
      where: { paymentId: paymentId },
      include: {
        buyer: true,
        seller: true,
      },
    });

    if (!transaction) {
      console.error(`Transação não encontrada para pagamento ${paymentId}`);
      return;
    }

    // 3. Processar baseado no status do pagamento
    if (paymentData.status === 'approved' && transaction.status === TransactionStatus.AWAITING_PAYMENT) {
      // Atualizar status da transação
      await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.PAYMENT_CONFIRMED,
          paymentConfirmedAt: new Date(paymentData.date_approved || Date.now()),
        },
      });

      // TODO: Implementar sistema de notificações
      // Criar notificação para o vendedor quando o modelo estiver disponível

      // Notificar via WebSocket
      try {
        // Enviar notificação via Pusher
        const pusherPayload = {
          transactionId: transaction.id,
          status: TransactionStatus.PAYMENT_CONFIRMED,
          buyerId: transaction.buyerId,
          sellerId: transaction.sellerId,
          amount: transaction.amount.toString(),
          timestamp: new Date().toISOString(),
        };

        // Chamada para API interna que envia via Pusher
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/pusher`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-key': process.env.INTERNAL_API_KEY || '',
          },
          body: JSON.stringify({
            channel: `private-transaction-${transaction.id}`,
            event: 'payment-confirmed',
            data: pusherPayload,
          }),
        });

        console.log(`Notificação WebSocket enviada para transação ${transaction.id}`);
      } catch (wsError) {
        console.error('Erro ao enviar notificação WebSocket:', wsError);
        // Não falhar o webhook por causa de erro no WebSocket
      }

      console.log(`Pagamento ${paymentId} aprovado para transação ${transaction.id}`);
    } else if (
      ['rejected', 'cancelled', 'refunded'].includes(paymentData.status) &&
      transaction.status === TransactionStatus.AWAITING_PAYMENT
    ) {
      // Pagamento falhou
      await db.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: `Pagamento ${paymentData.status}: ${paymentData.status_detail}`,
        },
      });

      // TODO: Implementar sistema de notificações
      // Criar notificação para o comprador quando o modelo estiver disponível

      console.log(`Pagamento ${paymentId} falhou para transação ${transaction.id}`);
    }
  } catch (error) {
    console.error('Erro ao processar evento de pagamento:', error);
    throw error;
  }
}

/**
 * POST /api/payments/webhook
 * Recebe notificações do Mercado Pago
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Receber headers e body
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');
    
    let body: MercadoPagoWebhookPayload;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Erro ao parsear body do webhook:', error);
      return ApiResponse.badRequest('Invalid request body');
    }

    // Log para debug (remover em produção)
    console.log('Webhook recebido:', {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
      requestId,
    });

    // 2. Validar assinatura (se configurado)
    if (WEBHOOK_SECRET) {
      const isValid = validateWebhookSignature(
        signature,
        body.data?.id || '',
        requestId
      );

      if (!isValid) {
        console.error('Assinatura do webhook inválida');
        return ApiResponse.unauthorized('Invalid webhook signature');
      }
    }

    // 3. Processar apenas eventos de pagamento relevantes
    if (body.type === 'payment' && ['payment.created', 'payment.updated'].includes(body.action)) {
      // Processar em background para responder rapidamente
      processPaymentEvent(body.data.id, body.action).catch((error) => {
        console.error('Erro no processamento em background:', error);
      });
    }

    // 4. Sempre retornar 200 OK rapidamente
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Erro no webhook:', error);
    // Mesmo em caso de erro, retornar 200 para evitar retry do MP
    return NextResponse.json({ received: true, error: true }, { status: 200 });
  }
}

/**
 * GET /api/payments/webhook
 * Endpoint de teste para verificar se o webhook está funcionando
 */
export async function GET(request: NextRequest) {
  return ApiResponse.success({
    status: 'OK',
    message: 'Webhook endpoint is running',
    timestamp: new Date().toISOString(),
  });
}