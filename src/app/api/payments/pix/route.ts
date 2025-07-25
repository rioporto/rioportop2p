import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { checkAuth } from '@/lib/auth/utils';
import { z } from 'zod';
import { TransactionStatus } from '@prisma/client';
import { pixService } from '@/services/payments/pix.service';

// Schema de validação para criar pagamento PIX
const createPixSchema = z.object({
  transactionId: z.string().uuid('ID da transação inválido'),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().optional()
});

export async function POST(req: NextRequest) {
  // Verificar autenticação
  const authResult = await checkAuth(req);
  if ('status' in authResult) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const body = await req.json();
    
    // Validar dados
    const validation = createPixSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.badRequest(
        'Dados inválidos',
        'VALIDATION_ERROR',
        validation.error.errors
      );
    }

    const { transactionId, amount, description } = validation.data;

    // Verificar se transação existe e usuário é o comprador
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        seller: true
      }
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    if (transaction.buyerId !== userId) {
      return ApiResponse.forbidden('Apenas o comprador pode gerar pagamento');
    }

    if (transaction.status !== TransactionStatus.AWAITING_PAYMENT) {
      return ApiResponse.badRequest('Transação não está aguardando pagamento');
    }

    // Gerar pagamento PIX
    const pixPayment = await pixService.createPayment({
      amount,
      description: description || `Pagamento para transação ${transactionId}`,
      buyerId: userId,
      sellerId: transaction.sellerId
    });

    // Atualizar transação com ID do pagamento
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentId: pixPayment.id
      }
    });

    return ApiResponse.success(pixPayment);
  } catch (error) {
    console.error('Error creating PIX payment:', error);
    return ApiResponse.internalError('Erro ao gerar pagamento PIX');
  }
}

export async function GET(req: NextRequest) {
  // Verificar autenticação
  const authResult = await checkAuth(req);
  if ('status' in authResult) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return ApiResponse.badRequest('ID da transação é obrigatório');
    }

    // Verificar se transação existe e usuário faz parte dela
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        seller: true
      }
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return ApiResponse.forbidden('Você não faz parte desta transação');
    }

    if (!transaction.paymentId) {
      return ApiResponse.badRequest('Pagamento não iniciado');
    }

    // Verificar status do pagamento
    const paymentStatus = await pixService.checkPaymentStatus(transaction.paymentId);

    // Se pago, atualizar status da transação
    if (paymentStatus.isPaid && transaction.status === TransactionStatus.AWAITING_PAYMENT) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.PAYMENT_CONFIRMED,
          paymentConfirmedAt: new Date()
        }
      });
    }

    return ApiResponse.success(paymentStatus);
  } catch (error) {
    console.error('Error checking PIX payment:', error);
    return ApiResponse.internalError('Erro ao verificar pagamento PIX');
  }
}