import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { ListingType } from '@prisma/client';
import { z } from 'zod';

// Schema de validação para criação de listing
const createListingSchema = z.object({
  type: z.enum(['BUY', 'SELL']),
  cryptocurrency: z.string().min(1, 'Criptomoeda é obrigatória'),
  fiatCurrency: z.string().min(1, 'Moeda fiduciária é obrigatória'),
  pricePerUnit: z.number().positive('Preço deve ser maior que zero'),
  minAmount: z.number().positive('Valor mínimo deve ser maior que zero'),
  maxAmount: z.number().positive('Valor máximo deve ser maior que zero'),
  paymentMethods: z.array(z.string()).min(1, 'Pelo menos um método de pagamento é obrigatório'),
  terms: z.string().optional(),
});

// Schema de validação para query params da listagem
const listQuerySchema = z.object({
  type: z.enum(['BUY', 'SELL']).optional(),
  cryptocurrency: z.string().optional(),
  fiatCurrency: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  paymentMethod: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session || !session.user) {
      return ApiResponse.unauthorized();
    }

    // Parse e validar dados de entrada
    const body = await req.json();
    const validation = createListingSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest(
        'Dados inválidos',
        'VALIDATION_ERROR',
        validation.error.errors
      );
    }

    const data = validation.data;

    // Verificar se minAmount < maxAmount
    if (data.minAmount >= data.maxAmount) {
      return ApiResponse.badRequest(
        'O valor mínimo deve ser menor que o valor máximo',
        'VALIDATION_ERROR'
      );
    }

    // Verificar se os métodos de pagamento existem
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

    // Criar listing no banco de dados
    const listing = await prisma.listing.create({
      data: {
        userId: session.user.id,
        type: data.type as ListingType,
        cryptocurrency: data.cryptocurrency,
        fiatCurrency: data.fiatCurrency,
        pricePerUnit: data.pricePerUnit,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        terms: data.terms,
        paymentMethods: {
          create: data.paymentMethods.map((paymentMethodId) => ({
            paymentMethodId,
          })),
        },
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

    // Formatar resposta
    const formattedListing = {
      id: listing.id,
      type: listing.type,
      cryptocurrency: listing.cryptocurrency,
      fiatCurrency: listing.fiatCurrency,
      pricePerUnit: listing.pricePerUnit.toNumber(),
      minAmount: listing.minAmount.toNumber(),
      maxAmount: listing.maxAmount.toNumber(),
      terms: listing.terms,
      isActive: listing.isActive,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      user: listing.user,
      paymentMethods: listing.paymentMethods.map((pm) => ({
        id: pm.paymentMethod.id,
        name: pm.paymentMethod.name,
        slug: pm.paymentMethod.slug,
      })),
    };

    return ApiResponse.created(formattedListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    return ApiResponse.fromError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Não requer autenticação - anúncios são públicos
    
    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      type: searchParams.get('type'),
      cryptocurrency: searchParams.get('cryptocurrency'),
      fiatCurrency: searchParams.get('fiatCurrency'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      paymentMethod: searchParams.get('paymentMethod'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    };

    // Validar query params
    const validation = listQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return ApiResponse.badRequest(
        'Parâmetros de busca inválidos',
        'VALIDATION_ERROR',
        validation.error.errors
      );
    }

    const { type, cryptocurrency, fiatCurrency, minPrice, maxPrice, paymentMethod, limit, offset } = validation.data;

    // Construir filtros
    const where: any = {
      isActive: true,
    };

    if (type) {
      where.type = type as ListingType;
    }

    if (cryptocurrency) {
      where.cryptocurrency = cryptocurrency;
    }

    if (fiatCurrency) {
      where.fiatCurrency = fiatCurrency;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerUnit = {};
      if (minPrice !== undefined) {
        where.pricePerUnit.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.pricePerUnit.lte = maxPrice;
      }
    }

    if (paymentMethod) {
      where.paymentMethods = {
        some: {
          paymentMethodId: paymentMethod,
        },
      };
    }

    // Buscar listings com contagem total
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              kycLevel: true,
            },
          },
          paymentMethods: {
            include: {
              paymentMethod: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    // Formatar resposta
    const formattedListings = listings.map((listing) => ({
      id: listing.id,
      type: listing.type,
      cryptocurrency: listing.cryptocurrency,
      fiatCurrency: listing.fiatCurrency,
      pricePerUnit: listing.pricePerUnit.toNumber(),
      minAmount: listing.minAmount.toNumber(),
      maxAmount: listing.maxAmount.toNumber(),
      terms: listing.terms,
      isActive: listing.isActive,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      user: {
        id: listing.user.id,
        name: `${listing.user.firstName} ${listing.user.lastName}`,
        kycLevel: listing.user.kycLevel,
      },
      paymentMethods: listing.paymentMethods.map((pm) => ({
        id: pm.paymentMethod.id,
        name: pm.paymentMethod.name,
        slug: pm.paymentMethod.slug,
      })),
    }));

    // Resposta com paginação
    const response = {
      listings: formattedListings,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };

    return ApiResponse.success(response);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return ApiResponse.fromError(error);
  }
}