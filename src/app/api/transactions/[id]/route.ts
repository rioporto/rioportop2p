import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';
import { TransactionStatus } from '@prisma/client';

interface IRouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/transactions/[id]
export async function GET(req: NextRequest, props: IRouteParams) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session) {
      return ApiResponse.unauthorized();
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        listing: {
          include: {
            paymentMethods: {
              include: {
                paymentMethod: true,
              },
            },
          },
        },
        escrow: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        ratings: {
          include: {
            rater: {
              select: {
                id: true,
                name: true,
              },
            },
            ratedUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    // Verificar se o usuário faz parte da transação
    if (transaction.buyerId !== session.user.id && transaction.sellerId !== session.user.id) {
      return ApiResponse.forbidden('Acesso negado');
    }

    return ApiResponse.success(transaction);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/transactions/[id]
export async function PATCH(req: NextRequest, props: IRouteParams) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session) {
      return ApiResponse.unauthorized();
    }

    const body = await req.json();
    const { action } = body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        escrow: true,
      },
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    // Verificar se o usuário faz parte da transação
    if (transaction.buyerId !== session.user.id && transaction.sellerId !== session.user.id) {
      return ApiResponse.forbidden('Acesso negado');
    }

    // Ações disponíveis baseadas no status e papel do usuário
    switch (action) {
      case 'confirm_payment':
        // Apenas o vendedor pode confirmar o pagamento
        if (session.user.id !== transaction.sellerId) {
          return ApiResponse.forbidden('Apenas o vendedor pode confirmar o pagamento');
        }
        if (transaction.status !== TransactionStatus.AWAITING_PAYMENT) {
          return ApiResponse.badRequest('Status inválido para esta ação');
        }
        
        await prisma.transaction.update({
          where: { id: params.id },
          data: {
            status: TransactionStatus.PAYMENT_CONFIRMED,
            paymentConfirmedAt: new Date(),
          },
        });
        break;

      case 'release_funds':
        // Apenas o vendedor pode liberar os fundos
        if (session.user.id !== transaction.sellerId) {
          return ApiResponse.forbidden('Apenas o vendedor pode liberar os fundos');
        }
        if (transaction.status !== TransactionStatus.PAYMENT_CONFIRMED) {
          return ApiResponse.badRequest('Status inválido para esta ação');
        }
        
        // Atualizar transação e escrow
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: params.id },
            data: {
              status: TransactionStatus.COMPLETED,
              completedAt: new Date(),
            },
          }),
          prisma.escrow.update({
            where: { id: transaction.escrow!.id },
            data: {
              status: 'RELEASED',
              releasedAt: new Date(),
            },
          }),
        ]);
        break;

      case 'cancel':
        // Ambas as partes podem cancelar sob certas condições
        if (transaction.status === TransactionStatus.COMPLETED) {
          return ApiResponse.badRequest('Não é possível cancelar uma transação concluída');
        }
        
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: params.id },
            data: {
              status: TransactionStatus.CANCELLED,
              cancelledAt: new Date(),
              cancelReason: body.reason || 'Cancelado pelo usuário',
            },
          }),
          ...(transaction.escrow ? [
            prisma.escrow.update({
              where: { id: transaction.escrow.id },
              data: {
                status: 'REFUNDED',
                refundedAt: new Date(),
              },
            }),
          ] : []),
        ]);
        break;

      case 'dispute':
        // Ambas as partes podem abrir disputa
        if (transaction.status === TransactionStatus.COMPLETED || 
            transaction.status === TransactionStatus.CANCELLED) {
          return ApiResponse.badRequest('Status inválido para abrir disputa');
        }
        
        await prisma.transaction.update({
          where: { id: params.id },
          data: {
            status: TransactionStatus.DISPUTED,
            disputedAt: new Date(),
            disputeReason: body.reason || 'Disputa aberta pelo usuário',
          },
        });
        break;

      default:
        return ApiResponse.badRequest('Ação inválida');
    }

    // Buscar transação atualizada
    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        escrow: true,
      },
    });

    return ApiResponse.success(updatedTransaction);
  } catch (error) {
    return handleApiError(error);
  }
}