import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getMercadoPagoService } from '@/services/payments/mercadopago.service';
import { z } from 'zod';

const createPixSchema = z.object({
  tradeId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const body = await req.json();
    const { tradeId } = createPixSchema.parse(body);

    // Buscar a trade
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        listing: {
          include: {
            user: true
          }
        },
        buyer: true,
        seller: true
      }
    });

    if (!trade) {
      return apiResponse.error('Trade não encontrada');
    }

    // Verificar se o usuário é o comprador
    if (trade.buyerId !== session.user.id) {
      return apiResponse.error('Apenas o comprador pode gerar o PIX');
    }

    // Verificar status da trade
    if (trade.status !== 'PENDING') {
      return apiResponse.error('PIX já foi gerado ou trade não está pendente');
    }

    // Verificar se já existe um PIX para esta trade
    const existingPix = await prisma.pixTransaction.findFirst({
      where: {
        tradeId: tradeId,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (existingPix) {
      return apiResponse.error('PIX já existe para esta trade');
    }

    // Criar pagamento no Mercado Pago
    const mpService = getMercadoPagoService();
    const pixData = await mpService.createPixPayment({
      tradeId: trade.id,
      amount: trade.totalAmount,
      buyerEmail: trade.buyer.email,
      buyerName: `${trade.buyer.firstName} ${trade.buyer.lastName}`,
      description: `Rio Porto P2P - ${trade.cryptoAmount} ${trade.listing.cryptoSymbol}`
    });

    // Salvar no banco
    const pixTransaction = await prisma.pixTransaction.create({
      data: {
        tradeId: trade.id,
        payerId: session.user.id,
        recipientId: trade.sellerId,
        amount: trade.totalAmount,
        status: 'PENDING',
        pixKey: pixData.copyPaste,
        qrCode: pixData.qrCodeBase64,
        externalId: pixData.id.toString(),
        expiresAt: new Date(pixData.expirationDate)
      }
    });

    // Atualizar status da trade
    await prisma.trade.update({
      where: { id: tradeId },
      data: { 
        status: 'PAYMENT_PENDING',
        updatedAt: new Date()
      }
    });

    return apiResponse.success({
      pixTransaction: {
        id: pixTransaction.id,
        qrCode: pixData.qrCodeBase64,
        qrCodeText: pixData.copyPaste,
        amount: trade.totalAmount,
        expiresAt: pixTransaction.expiresAt
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// GET - Consultar status do PIX
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const tradeId = searchParams.get('tradeId');

    if (!tradeId) {
      return apiResponse.error('Trade ID é obrigatório');
    }

    const pixTransaction = await prisma.pixTransaction.findFirst({
      where: {
        tradeId: tradeId,
        OR: [
          { payerId: session.user.id },
          { recipientId: session.user.id }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!pixTransaction) {
      return apiResponse.error('PIX não encontrado');
    }

    // Se ainda está pendente, consultar status no MP
    if (pixTransaction.status === 'PENDING' && pixTransaction.externalId) {
      try {
        const mpService = getMercadoPagoService();
        const status = await mpService.getPaymentStatus(parseInt(pixTransaction.externalId));
        
        // Atualizar se mudou
        if (status === 'approved' && pixTransaction.status !== 'APPROVED') {
          await prisma.$transaction([
            prisma.pixTransaction.update({
              where: { id: pixTransaction.id },
              data: { status: 'APPROVED' }
            }),
            prisma.trade.update({
              where: { id: pixTransaction.tradeId },
              data: { status: 'PAYMENT_CONFIRMED' }
            })
          ]);
          pixTransaction.status = 'APPROVED';
        }
      } catch (error) {
        console.error('Erro ao consultar status no MP:', error);
      }
    }

    return apiResponse.success({ pixTransaction });

  } catch (error) {
    return handleApiError(error);
  }
}