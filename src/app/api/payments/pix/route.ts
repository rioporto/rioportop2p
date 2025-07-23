import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { pixService } from '@/services/payments/pix.service';
import { AppError, handleApiError } from '@/lib/errors';
import { TransactionStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError('Não autenticado', 401);
    }

    // 2. Validar dados da requisição
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      throw new AppError('ID da transação é obrigatório', 400);
    }

    // 3. Buscar transação e verificar se user é o buyer
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        seller: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    if (transaction.buyerId !== session.user.id) {
      throw new AppError('Apenas o comprador pode criar o pagamento', 403);
    }

    // 4. Verificar se status é AWAITING_PAYMENT
    if (transaction.status !== TransactionStatus.AWAITING_PAYMENT) {
      throw new AppError('Transação não está aguardando pagamento', 400);
    }

    // 5. Chamar pixService.createPixPayment
    const pixPayment = await pixService.createPixPayment(
      transaction.id,
      transaction.amount.toNumber(),
      transaction.buyer.email!
    );

    // 6. Salvar paymentId na transação
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentId: pixPayment.paymentId,
        paymentMethod: 'PIX',
      },
    });

    // 7. Retornar QR code e dados do PIX
    return NextResponse.json({
      success: true,
      data: {
        paymentId: pixPayment.paymentId,
        qrCode: pixPayment.qrCode,
        qrCodeBase64: pixPayment.qrCodeBase64,
        pixKey: pixPayment.pixKey,
        expiresAt: pixPayment.expiresAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError('Não autenticado', 401);
    }

    // 2. Receber transactionId como query param
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      throw new AppError('ID da transação é obrigatório', 400);
    }

    // 3. Buscar transação e verificar se user faz parte dela
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        seller: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    if (
      transaction.buyerId !== session.user.id &&
      transaction.sellerId !== session.user.id
    ) {
      throw new AppError('Acesso negado', 403);
    }

    // 4. Buscar paymentId da transação
    if (!transaction.paymentId) {
      throw new AppError('Pagamento não iniciado', 400);
    }

    // 5. Chamar pixService.checkPaymentStatus
    const paymentStatus = await pixService.checkPaymentStatus(
      transaction.paymentId
    );

    // 6. Se pago, atualizar status para PAYMENT_CONFIRMED
    if (paymentStatus.isPaid && transaction.status === TransactionStatus.AWAITING_PAYMENT) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.PAYMENT_CONFIRMED,
          paymentConfirmedAt: new Date(),
        },
      });

      // Notificar o vendedor sobre o pagamento confirmado
      // TODO: Implementar sistema de notificações
    }

    // 7. Retornar status
    return NextResponse.json({
      success: true,
      data: {
        paymentId: transaction.paymentId,
        isPaid: paymentStatus.isPaid,
        status: paymentStatus.status,
        paidAt: paymentStatus.paidAt,
        transactionStatus: paymentStatus.isPaid 
          ? TransactionStatus.PAYMENT_CONFIRMED 
          : transaction.status,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}