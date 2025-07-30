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

// POST /api/transactions/[id]/confirm-payment - Comprador confirma que realizou o pagamento
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
        buyerId: session.user.id,
        status: 'AWAITING_PAYMENT'
      },
      include: {
        seller: true,
        listing: true
      }
    });

    if (!transaction) {
      return apiResponse.error(
        'TRANSACTION_NOT_FOUND',
        'Transação não encontrada ou não está aguardando pagamento',
        404
      );
    }

    // Atualizar status da transação
    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status: 'PAYMENT_PENDING_CONFIRMATION',
        paymentConfirmedByBuyerAt: new Date()
      }
    });

    // Atualizar PIX se existir
    await prisma.pixTransaction.updateMany({
      where: {
        p2pTradeId: params.id,
        status: 'PENDING'
      },
      data: {
        status: 'AWAITING_CONFIRMATION'
      }
    });

    // Criar notificação para o vendedor
    await prisma.notification.create({
      data: {
        userId: transaction.sellerId,
        type: 'PAYMENT_CLAIMED',
        title: 'Pagamento informado',
        message: `O comprador informou que realizou o pagamento de R$ ${transaction.totalPrice.toFixed(2)}`,
        metadata: {
          transactionId: params.id,
          buyerName: session.user.name || 'Comprador'
        }
      }
    });

    // Enviar notificação em tempo real
    if (process.env.PUSHER_APP_ID) {
      await PusherService.trigger(
        `user-${transaction.sellerId}`,
        'payment-claimed',
        {
          transactionId: params.id,
          buyerName: session.user.name || 'Comprador',
          amount: transaction.totalPrice
        }
      );
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PAYMENT_CLAIMED',
        entityType: 'TRANSACTION',
        entityId: params.id,
        metadata: {
          amount: transaction.totalPrice,
          cryptocurrency: transaction.listing.cryptocurrency
        }
      }
    });

    return apiResponse.success({
      transaction: updatedTransaction,
      message: 'Pagamento informado com sucesso. Aguardando confirmação do vendedor.'
    });

  } catch (error) {
    return handleApiError(error);
  }
}