import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getMercadoPagoService } from '@/services/payments/mercadopago.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = body.amount || 100; // Default R$ 100

    // Criar pagamento de teste no Mercado Pago
    const mpService = getMercadoPagoService();
    const pixData = await mpService.createPixPayment({
      tradeId: 'test-' + Date.now(),
      amount: amount,
      buyerEmail: 'teste@rioporto.com.br',
      buyerName: 'Usuário Teste',
      description: `Rio Porto P2P - Teste PIX R$ ${amount}`
    });

    return apiResponse.success({
      pixTransaction: {
        id: 'test-' + Date.now(),
        qrCode: pixData.qrCodeBase64,
        qrCodeText: pixData.copyPaste,
        amount: amount,
        expiresAt: new Date(pixData.expirationDate)
      }
    });

  } catch (error) {
    console.error('Erro no teste PIX:', error);
    return handleApiError(error);
  }
}