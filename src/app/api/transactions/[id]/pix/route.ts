import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';
import { MercadoPagoService } from '@/services/payments/mercadopago.service';
import { z } from 'zod';

interface Params {
  params: {
    id: string;
  };
}

// POST /api/transactions/[id]/pix - Gerar pagamento PIX para uma transação
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
        listing: true,
        seller: {
          include: {
            pixKeys: {
              where: {
                isActive: true,
                isDefault: true
              },
              take: 1
            }
          }
        }
      }
    });

    if (!transaction) {
      return apiResponse.error(
        'TRANSACTION_NOT_FOUND',
        'Transação não encontrada ou não está aguardando pagamento',
        404
      );
    }

    // Verificar se já existe PIX pendente
    const existingPix = await prisma.pixTransaction.findFirst({
      where: {
        p2pTradeId: params.id,
        status: 'PENDING'
      }
    });

    if (existingPix) {
      return apiResponse.success({
        pixTransaction: existingPix,
        message: 'PIX já gerado para esta transação'
      });
    }

    // Verificar se vendedor tem chave PIX
    if (!transaction.seller.pixKeys.length) {
      return apiResponse.error(
        'SELLER_NO_PIX',
        'Vendedor não possui chave PIX cadastrada',
        400
      );
    }

    const sellerPixKey = transaction.seller.pixKeys[0];

    // Gerar PIX com Mercado Pago
    const pixData = await MercadoPagoService.createPixPayment({
      transactionAmount: parseFloat(transaction.totalPrice.toString()),
      description: `Compra ${transaction.listing.cryptocurrency} - Rio Porto P2P`,
      payerEmail: session.user.email || '',
      payerFirstName: session.user.name?.split(' ')[0] || '',
      payerLastName: session.user.name?.split(' ')[1] || '',
      pixKey: sellerPixKey.pixKey,
      pixKeyType: sellerPixKey.keyType
    });

    // Criar registro de PIX
    const pixTransaction = await prisma.pixTransaction.create({
      data: {
        userId: session.user.id,
        p2pTradeId: params.id,
        transactionType: 'P2P_PAYMENT',
        direction: 'OUT',
        amount: transaction.totalPrice,
        pixId: pixData.id.toString(),
        qrCode: pixData.pointOfInteraction?.transactionData?.qrCode || '',
        qrCodeImage: pixData.pointOfInteraction?.transactionData?.qrCodeBase64 || '',
        payerName: session.user.name || '',
        receiverName: transaction.seller.firstName + ' ' + transaction.seller.lastName,
        status: 'PENDING',
        mpPaymentId: pixData.id.toString(),
        mpStatus: pixData.status,
        mpStatusDetail: pixData.statusDetail
      }
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PIX_PAYMENT_CREATED',
        entityType: 'PIX_TRANSACTION',
        entityId: pixTransaction.id,
        metadata: {
          transactionId: params.id,
          amount: transaction.totalPrice,
          sellerPixKey: sellerPixKey.pixKey.substring(0, 4) + '****'
        }
      }
    });

    return apiResponse.success({
      pixTransaction: {
        id: pixTransaction.id,
        qrCode: pixTransaction.qrCode,
        qrCodeImage: pixTransaction.qrCodeImage,
        amount: pixTransaction.amount,
        status: pixTransaction.status,
        pixKey: sellerPixKey.pixKey
      },
      message: 'QR Code PIX gerado com sucesso'
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/transactions/[id]/pix - Buscar PIX de uma transação
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const pixTransaction = await prisma.pixTransaction.findFirst({
      where: {
        p2pTradeId: params.id,
        OR: [
          { userId: session.user.id },
          {
            p2pTrade: {
              OR: [
                { buyerId: session.user.id },
                { sellerId: session.user.id }
              ]
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!pixTransaction) {
      return apiResponse.error(
        'PIX_NOT_FOUND',
        'PIX não encontrado para esta transação',
        404
      );
    }

    return apiResponse.success(pixTransaction);

  } catch (error) {
    return handleApiError(error);
  }
}