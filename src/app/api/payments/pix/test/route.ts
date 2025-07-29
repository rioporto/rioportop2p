import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getMercadoPagoService } from '@/services/payments/mercadopago.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = body.amount || 100; // Default R$ 100

    console.log('=== TESTE PIX INICIADO ===');
    console.log('Amount:', amount);
    console.log('Has MP Token:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
    console.log('Token length:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.length);

    // Criar pagamento de teste no Mercado Pago
    const mpService = getMercadoPagoService();
    console.log('MercadoPagoService criado');
    
    const pixData = await mpService.createPixPayment({
      tradeId: 'test-' + Date.now(),
      amount: amount,
      buyerEmail: 'teste@rioporto.com.br',
      buyerName: 'Usuário Teste',
      description: `Rio Porto P2P - Teste PIX R$ ${amount}`
    });
    
    console.log('PIX Data recebido:', {
      hasId: !!pixData.id,
      hasQrCode: !!pixData.qrCode,
      hasQrCodeBase64: !!pixData.qrCodeBase64,
      status: pixData.status
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
    console.error('Erro detalhado no teste PIX:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      hasToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN
    });
    
    // Retornar erro mais específico
    if (error instanceof Error) {
      if (error.message.includes('MERCADO_PAGO_ACCESS_TOKEN')) {
        return apiResponse.error('CONFIG_ERROR', 'Mercado Pago não configurado corretamente', 500);
      }
      return apiResponse.error('PAYMENT_ERROR', error.message, 500);
    }
    
    return handleApiError(error);
  }
}