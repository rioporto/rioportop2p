import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';
import { MercadoPagoService } from '@/services/payments/mercadopago.service';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/transactions/[id]/status - Verificar status de pagamento
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    // Buscar transação
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id }
        ]
      },
      include: {
        pixTransactions: {
          where: {
            status: {
              in: ['PENDING', 'AWAITING_CONFIRMATION']
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!transaction) {
      return apiResponse.error(
        'TRANSACTION_NOT_FOUND',
        'Transação não encontrada',
        404
      );
    }

    // Se tem PIX pendente, verificar status com Mercado Pago
    if (transaction.pixTransactions.length > 0) {
      const pixTransaction = transaction.pixTransactions[0];
      
      if (pixTransaction.mpPaymentId) {
        try {
          const paymentStatus = await MercadoPagoService.getPaymentStatus(
            pixTransaction.mpPaymentId
          );

          // Atualizar status se mudou
          if (paymentStatus.status === 'approved' && pixTransaction.status === 'PENDING') {
            // Atualizar PIX
            await prisma.pixTransaction.update({
              where: { id: pixTransaction.id },
              data: {
                status: 'PAID',
                paidAt: new Date(),
                mpStatus: paymentStatus.status,
                mpStatusDetail: paymentStatus.statusDetail
              }
            });

            // Atualizar transação
            await prisma.transaction.update({
              where: { id: params.id },
              data: {
                status: 'PAYMENT_CONFIRMED',
                paymentConfirmedAt: new Date()
              }
            });

            // Criar notificação
            await prisma.notification.create({
              data: {
                userId: transaction.sellerId,
                type: 'PAYMENT_RECEIVED',
                title: 'Pagamento recebido',
                message: `Pagamento de R$ ${transaction.totalPrice.toFixed(2)} confirmado`,
                metadata: {
                  transactionId: params.id
                }
              }
            });

            return apiResponse.success({
              status: 'PAYMENT_CONFIRMED',
              message: 'Pagamento confirmado com sucesso'
            });
          }
        } catch (error) {
          console.error('Erro ao verificar status no Mercado Pago:', error);
        }
      }
    }

    return apiResponse.success({
      status: transaction.status,
      pixStatus: transaction.pixTransactions[0]?.status || null
    });

  } catch (error) {
    return handleApiError(error);
  }
}