import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { z } from 'zod';

// Schema de validação para atualização de listing
const updateListingSchema = z.object({
  pricePerUnit: z.number().positive('Preço deve ser maior que zero').optional(),
  minAmount: z.number().positive('Valor mínimo deve ser maior que zero').optional(),
  maxAmount: z.number().positive('Valor máximo deve ser maior que zero').optional(),
  terms: z.string().optional(),
  paymentMethods: z.array(z.string()).min(1, 'Pelo menos um método de pagamento é obrigatório').optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session || !session.user) {
      return ApiResponse.unauthorized();
    }

    const { id: listingId } = await params;

    // Verificar se o listing existe e pertence ao usuário
    const existingListing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: session.user.id,
      },
    });

    if (!existingListing) {
      return ApiResponse.notFound('Anúncio não encontrado ou não pertence ao usuário');
    }

    // Parse e validar dados de entrada
    const body = await req.json();
    const validation = updateListingSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest(
        'Dados inválidos',
        'VALIDATION_ERROR',
        validation.error.errors
      );
    }

    const data = validation.data;

    // Verificar se minAmount < maxAmount
    const minAmount = data.minAmount ?? existingListing.minAmount.toNumber();
    const maxAmount = data.maxAmount ?? existingListing.maxAmount.toNumber();

    if (minAmount >= maxAmount) {
      return ApiResponse.badRequest(
        'O valor mínimo deve ser menor que o valor máximo',
        'VALIDATION_ERROR'
      );
    }

    // Se paymentMethods foi fornecido, validar
    if (data.paymentMethods) {
      const paymentMethods = await prisma.paymentMethodType.findMany({
        where: {
          id: {
            in: data.paymentMethods,
          },
          isActive: true,
        },
      });

      if (paymentMethods.length !== data.paymentMethods.length) {
        return ApiResponse.badRequest(
          'Um ou mais métodos de pagamento são inválidos',
          'INVALID_PAYMENT_METHODS'
        );
      }
    }

    // Atualizar listing usando transaction
    const updatedListing = await prisma.$transaction(async (tx) => {
      // Se paymentMethods foi fornecido, remover antigas e adicionar novas
      if (data.paymentMethods) {
        // Remover métodos de pagamento antigos
        await tx.listingPaymentMethod.deleteMany({
          where: {
            listingId: listingId,
          },
        });

        // Adicionar novos métodos de pagamento
        await tx.listingPaymentMethod.createMany({
          data: data.paymentMethods.map((paymentMethodId) => ({
            listingId: listingId,
            paymentMethodId,
          })),
        });
      }

      // Atualizar o listing
      return await tx.listing.update({
        where: {
          id: listingId,
        },
        data: {
          pricePerUnit: data.pricePerUnit,
          minAmount: data.minAmount,
          maxAmount: data.maxAmount,
          terms: data.terms,
          isActive: data.isActive,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          paymentMethods: {
            include: {
              paymentMethod: true,
            },
          },
        },
      });
    });

    // Formatar resposta
    const formattedListing = {
      id: updatedListing.id,
      type: updatedListing.type,
      cryptocurrency: updatedListing.cryptocurrency,
      fiatCurrency: updatedListing.fiatCurrency,
      pricePerUnit: updatedListing.pricePerUnit.toNumber(),
      minAmount: updatedListing.minAmount.toNumber(),
      maxAmount: updatedListing.maxAmount.toNumber(),
      terms: updatedListing.terms,
      isActive: updatedListing.isActive,
      createdAt: updatedListing.createdAt,
      updatedAt: updatedListing.updatedAt,
      user: updatedListing.user,
      paymentMethods: updatedListing.paymentMethods.map((pm) => ({
        id: pm.paymentMethod.id,
        name: pm.paymentMethod.name,
        slug: pm.paymentMethod.slug,
      })),
    };

    return ApiResponse.success(formattedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return ApiResponse.fromError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session || !session.user) {
      return ApiResponse.unauthorized();
    }

    const { id: listingId } = await params;

    // Verificar se o listing existe e pertence ao usuário
    const existingListing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: session.user.id,
      },
    });

    if (!existingListing) {
      return ApiResponse.notFound('Anúncio não encontrado ou não pertence ao usuário');
    }

    // Soft delete: apenas marcar isActive = false
    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        isActive: false,
      },
    });

    return ApiResponse.success({
      id: updatedListing.id,
      message: 'Anúncio desativado com sucesso',
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return ApiResponse.fromError(error);
  }
}