import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { AppError, handleApiError } from '@/lib/errors';
import { ReputationService } from '@/services/reputation/reputation.service';
import { z } from 'zod';

// Schema de validação para criar avaliação
const createRatingSchema = z.object({
  transactionId: z.string().uuid('ID da transação inválido'),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return ApiResponse.unauthorized();
    }

    // 2. Validar dados da requisição
    const body = await req.json();
    const validationResult = createRatingSchema.safeParse(body);
    
    if (!validationResult.success) {
      return ApiResponse.badRequest(
        'Dados inválidos',
        'VALIDATION_ERROR',
        validationResult.error.errors
      );
    }

    const { transactionId, score, comment } = validationResult.data;

    // 3. Verificar se transação existe e está COMPLETED
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        seller: true,
        ratings: {
          where: {
            ratedById: session.user.id,
          },
        },
      },
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    if (transaction.status !== 'COMPLETED') {
      return ApiResponse.badRequest(
        'Apenas transações concluídas podem ser avaliadas',
        'INVALID_TRANSACTION_STATUS'
      );
    }

    // 4. Verificar se user faz parte da transação
    const isBuyer = transaction.buyerId === session.user.id;
    const isSeller = transaction.sellerId === session.user.id;

    if (!isBuyer && !isSeller) {
      return ApiResponse.forbidden(
        'Você não faz parte desta transação',
        'UNAUTHORIZED_TRANSACTION'
      );
    }

    // 5. Verificar se ainda não avaliou
    if (transaction.ratings.length > 0) {
      return ApiResponse.conflict(
        'Você já avaliou esta transação',
        'RATING_ALREADY_EXISTS'
      );
    }

    // 6. Determinar quem está sendo avaliado (contraparte)
    const ratedUserId = isBuyer ? transaction.sellerId : transaction.buyerId;

    // 7. Criar rating
    const rating = await prisma.rating.create({
      data: {
        transactionId,
        ratedById: session.user.id,
        ratedUserId,
        score,
        comment,
      },
      include: {
        ratedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        ratedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        transaction: {
          select: {
            id: true,
            cryptocurrency: true,
            amount: true,
            price: true,
            completedAt: true,
          },
        },
      },
    });

    // 8. Chamar serviço de reputação para recalcular
    await ReputationService.recalculateUserReputation(ratedUserId);

    // 9. Retornar rating criado
    return ApiResponse.created({
      rating,
      message: 'Avaliação criada com sucesso',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Aceitar userId como query param
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validar paginação
    if (page < 1 || limit < 1 || limit > 100) {
      return ApiResponse.badRequest('Parâmetros de paginação inválidos');
    }

    // Calcular offset
    const offset = (page - 1) * limit;

    // 2. Construir query base
    const where = userId ? { ratedUserId: userId } : {};

    // 3. Buscar total de registros
    const total = await prisma.rating.count({ where });

    // 4. Buscar ratings do usuário
    const ratings = await prisma.rating.findMany({
      where,
      include: {
        ratedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        ratedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        transaction: {
          select: {
            id: true,
            cryptocurrency: true,
            amount: true,
            price: true,
            type: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // 5. Se userId foi fornecido, buscar também a reputação atual
    let reputation = null;
    if (userId) {
      reputation = await ReputationService.getUserReputation(userId);
    }

    // 6. Retornar dados com paginação
    return ApiResponse.success({
      ratings,
      reputation,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}