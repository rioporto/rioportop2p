import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';
import { pixService } from '@/services/payments/pix.service';

interface IRouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/payments/pix/[id]
export async function GET(req: NextRequest, props: IRouteParams) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session) {
      return ApiResponse.unauthorized();
    }

    // Buscar transação pelo ID
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        buyer: true,
        seller: true,
      },
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    // Verificar se o usuário faz parte da transação
    if (
      transaction.buyerId !== session.user.id &&
      transaction.sellerId !== session.user.id
    ) {
      return ApiResponse.forbidden('Acesso negado');
    }

    // Se não tem paymentId, não há pagamento PIX
    if (!transaction.paymentId) {
      return ApiResponse.notFound('Pagamento PIX não encontrado para esta transação');
    }

    // Verificar status do pagamento
    const paymentStatus = await pixService.checkPaymentStatus(
      transaction.paymentId
    );

    // Se pago e transação ainda está aguardando, atualizar
    if (paymentStatus.isPaid && transaction.status === 'AWAITING_PAYMENT') {
      await prisma.transaction.update({
        where: { id: params.id },
        data: {
          status: 'PAYMENT_CONFIRMED',
          paymentConfirmedAt: new Date(),
        },
      });
    }

    return ApiResponse.success({
      transactionId: transaction.id,
      paymentId: transaction.paymentId,
      amount: transaction.amount.toNumber(),
      status: paymentStatus.status,
      isPaid: paymentStatus.isPaid,
      paidAt: paymentStatus.paidAt,
      transactionStatus: paymentStatus.isPaid ? 'PAYMENT_CONFIRMED' : transaction.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}