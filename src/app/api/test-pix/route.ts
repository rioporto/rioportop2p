import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getMercadoPagoService } from '@/services/payments/mercadopago.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = body.amount || 100; // Default R$ 100

    console.log('=== TESTE PIX COM INTEGRAÇÃO REAL ===');
    console.log('Amount:', amount);
    console.log('Has MP Token:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
    
    // Tentar usar o serviço real do Mercado Pago
    try {
      const mpService = getMercadoPagoService();
      console.log('MercadoPagoService criado');
      
      const pixData = await mpService.createPixPayment({
        tradeId: 'test-' + Date.now(),
        amount: amount,
        buyerEmail: 'teste@rioporto.com.br',
        buyerName: 'Usuário Teste',
        description: `Rio Porto P2P - Teste PIX R$ ${amount}`
      });
      
      console.log('PIX criado com sucesso! Real:', !pixData.qrCode.includes('MOCK'));
      
      return apiResponse.success({
        pixTransaction: {
          id: 'test-' + Date.now(),
          qrCode: pixData.qrCodeBase64,
          qrCodeText: pixData.copyPaste,
          amount: amount,
          expiresAt: new Date(pixData.expirationDate),
          isReal: !pixData.qrCode.includes('MOCK')
        }
      });
      
    } catch (mpError: any) {
      console.error('Erro no MercadoPago, usando mock:', mpError.message);
      
      // Fallback para mock se falhar
      const mockPixKey = `00020126330014BR.GOV.BCB.PIX0114${Date.now()}5204000053039865802BR5913RIO PORTO P2P6009SAO PAULO62070503***63041234`;
      const mockQRCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABeklEQVR4nO3VQQ0AIRDAwOf/GkYiEAlbCNjZM2fmnM+1twN4M5YkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJMpYkY0kyliRjSTKWJGNJupZ9A2CgA3XoAAAAAElFTkSuQmCC';
      
      return apiResponse.success({
        pixTransaction: {
          id: 'test-' + Date.now(),
          qrCode: mockQRCodeBase64,
          qrCodeText: mockPixKey,
          amount: amount,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          isReal: false,
          mockReason: mpError.message
        }
      });
    }

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