import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';
import { PusherService } from '@/services/chat/pusher.service';

interface Params {
  params: {
    id: string;
  };
}

// POST /api/transactions/[id]/release - Vendedor libera criptomoedas
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    // Buscar transação
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: params.id,
        sellerId: session.user.id,
        status: {
          in: ['PAYMENT_CONFIRMED', 'PAYMENT_PENDING_CONFIRMATION']
        }
      },
      include: {
        buyer: true,
        listing: true,
        escrow: true
      }
    });

    if (!transaction) {
      return apiResponse.error(
        'TRANSACTION_NOT_FOUND',
        'Transação não encontrada ou não pode ser liberada',
        404
      );
    }

    // Iniciar transação do banco
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar status da transação
      const updatedTransaction = await tx.transaction.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Liberar escrow se existir
      if (transaction.escrow) {
        await tx.escrow.update({
          where: { id: transaction.escrow.id },
          data: {
            status: 'RELEASED',
            releasedAt: new Date()
          }
        });
      }

      // Atualizar PIX como concluído
      await tx.pixTransaction.updateMany({
        where: {
          p2pTradeId: params.id,
          status: {
            in: ['PAID', 'AWAITING_CONFIRMATION']
          }
        },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date()
        }
      });

      // Criar notificação para o comprador
      await tx.notification.create({
        data: {
          userId: transaction.buyerId,
          type: 'CRYPTO_RELEASED',
          title: 'Criptomoedas liberadas!',
          message: `O vendedor liberou ${transaction.amount} ${transaction.listing.cryptocurrency}`,
          metadata: {
            transactionId: params.id,
            amount: transaction.amount,
            cryptocurrency: transaction.listing.cryptocurrency
          }
        }
      });

      // Atualizar reputação do vendedor
      await tx.userReputation.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          totalRatings: 0,
          averageScore: 0,
          successfulTrades: 1,
          totalVolume: transaction.totalPrice
        },
        update: {
          successfulTrades: { increment: 1 },
          totalVolume: { increment: transaction.totalPrice }
        }
      });

      // Atualizar reputação do comprador
      await tx.userReputation.upsert({
        where: { userId: transaction.buyerId },
        create: {
          userId: transaction.buyerId,
          totalRatings: 0,
          averageScore: 0,
          successfulTrades: 1,
          totalVolume: transaction.totalPrice
        },
        update: {
          successfulTrades: { increment: 1 },
          totalVolume: { increment: transaction.totalPrice }
        }
      });

      return updatedTransaction;
    });

    // Enviar notificação em tempo real
    if (process.env.PUSHER_APP_ID) {
      await PusherService.trigger(
        `user-${transaction.buyerId}`,
        'crypto-released',
        {
          transactionId: params.id,
          amount: transaction.amount,
          cryptocurrency: transaction.listing.cryptocurrency
        }
      );
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CRYPTO_RELEASED',
        entityType: 'TRANSACTION',
        entityId: params.id,
        metadata: {
          amount: transaction.amount,
          cryptocurrency: transaction.listing.cryptocurrency,
          buyerId: transaction.buyerId
        }
      }
    });

    return apiResponse.success({
      transaction: result,
      message: 'Criptomoedas liberadas com sucesso'
    });

  } catch (error) {
    return handleApiError(error);
  }
}