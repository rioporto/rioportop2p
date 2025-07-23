import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { z } from 'zod';

// Schema de validação para criar transação
const createTransactionSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethodId: z.string().uuid('Invalid payment method ID'),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session) {
      return ApiResponse.unauthorized();
    }

    // 2. Validar dados de entrada
    const body = await req.json();
    const validation = createTransactionSchema.safeParse(body);
    
    if (!validation.success) {
      return ApiResponse.badRequest(
        'Invalid request data',
        'VALIDATION_ERROR',
        validation.error.errors
      );
    }

    const { listingId, amount, paymentMethodId } = validation.data;

    // 3. Buscar listing e verificar se está ativo
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: true,
        paymentMethods: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });

    if (!listing) {
      return ApiResponse.notFound('Listing not found');
    }

    if (!listing.isActive) {
      return ApiResponse.badRequest('Listing is not active', 'LISTING_INACTIVE');
    }

    // Verificar se o usuário não está tentando transacionar com seu próprio anúncio
    if (listing.userId === session.user.id) {
      return ApiResponse.badRequest(
        'Cannot create transaction with your own listing',
        'SELF_TRANSACTION'
      );
    }

    // 4. Verificar se amount está entre min e max do listing
    if (amount < Number(listing.minAmount) || amount > Number(listing.maxAmount)) {
      return ApiResponse.badRequest(
        `Amount must be between ${listing.minAmount} and ${listing.maxAmount}`,
        'AMOUNT_OUT_OF_RANGE'
      );
    }

    // Verificar se o método de pagamento é aceito pelo listing
    const acceptedPaymentMethodIds = listing.paymentMethods.map(pm => pm.paymentMethodId);
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: {
        user: true,
      },
    });

    if (!paymentMethod) {
      return ApiResponse.notFound('Payment method not found');
    }

    // Verificar se o método de pagamento pertence ao usuário correto
    const isBuyer = listing.type === 'SELL';
    const expectedUserId = isBuyer ? session.user.id : listing.userId;
    
    if (paymentMethod.userId !== expectedUserId) {
      return ApiResponse.badRequest(
        'Invalid payment method for this transaction',
        'INVALID_PAYMENT_METHOD'
      );
    }

    // 5. Determinar buyer/seller baseado no tipo do listing
    const buyerId = listing.type === 'SELL' ? session.user.id : listing.userId;
    const sellerId = listing.type === 'BUY' ? session.user.id : listing.userId;

    // 6. Calcular totalPrice = amount * pricePerUnit
    const totalPrice = amount * Number(listing.pricePerUnit);

    // 7. Criar transaction e escrow em transação atomic
    const transaction = await prisma.$transaction(async (tx) => {
      // Criar a transação
      const newTransaction = await tx.transaction.create({
        data: {
          listingId,
          buyerId,
          sellerId,
          amount,
          pricePerUnit: listing.pricePerUnit,
          totalPrice,
          paymentMethodId,
          status: 'PENDING',
        },
        include: {
          listing: {
            include: {
              user: true,
            },
          },
          buyer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          paymentMethod: {
            select: {
              id: true,
              paymentType: true,
              displayName: true,
            },
          },
        },
      });

      // Criar o escrow
      await tx.escrow.create({
        data: {
          transactionId: newTransaction.id,
          cryptoAmount: amount,
          status: 'LOCKED',
        },
      });

      return newTransaction;
    });

    // 8. Retornar transação criada
    return ApiResponse.created(transaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    return ApiResponse.fromError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session) {
      return ApiResponse.unauthorized();
    }

    // Parâmetros de paginação
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as string | null;
    
    const skip = (page - 1) * limit;

    // 2. Buscar transações onde user é buyer OU seller
    const whereCondition: any = {
      OR: [
        { buyerId: session.user.id },
        { sellerId: session.user.id },
      ],
    };

    // Filtrar por status se fornecido
    if (status) {
      whereCondition.status = status;
    }

    // Buscar total de registros
    const total = await prisma.transaction.count({
      where: whereCondition,
    });

    // 3. Buscar transações com dados relacionados
    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      include: {
        listing: {
          select: {
            id: true,
            type: true,
            cryptocurrency: true,
            fiatCurrency: true,
            pricePerUnit: true,
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        paymentMethod: {
          select: {
            id: true,
            paymentType: true,
            displayName: true,
          },
        },
        escrow: {
          select: {
            id: true,
            status: true,
            cryptoAmount: true,
            releasedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Formatar resposta com metadados de paginação
    const response = {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return ApiResponse.success(response);
  } catch (error) {
    console.error('Transaction list error:', error);
    return ApiResponse.fromError(error);
  }
}