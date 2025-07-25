import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { z } from 'zod';
import { checkAuth } from '@/lib/auth/utils';

// Schema de validação para criar transação
const createTransactionSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethodId: z.string().uuid('Invalid payment method ID'),
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
    
    // TODO: Validar body com Zod
    
    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        ...body,
        buyerId: userId
      }
    });

    return ApiResponse.success(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return ApiResponse.internalError('Erro ao criar transação');
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
    // Buscar transações do usuário
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        listing: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return ApiResponse.success(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return ApiResponse.internalError('Erro ao buscar transações');
  }
}