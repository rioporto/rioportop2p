import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = body.amount || 10;
    
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return apiResponse.error('CONFIG_ERROR', 'Token Mercado Pago não configurado', 500);
    }

    console.log('=== Teste Direto PIX Mercado Pago ===');
    console.log('Amount:', amount);
    console.log('Token length:', process.env.MERCADO_PAGO_ACCESS_TOKEN.length);
    
    // Preparar dados do pagamento PIX
    const paymentData = {
      transaction_amount: amount,
      description: `Teste PIX Rio Porto P2P - ${new Date().toISOString()}`,
      payment_method_id: 'pix',
      payer: {
        email: 'teste@rioporto.com.br',
        first_name: 'Teste',
        last_name: 'PIX',
        identification: {
          type: 'CPF',
          number: '12345678909'
        }
      },
    };

    console.log('Payment data:', JSON.stringify(paymentData, null, 2));

    // Fazer requisição direta à API
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `test-${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify(paymentData)
    });

    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      return apiResponse.success({
        success: false,
        status: response.status,
        error: responseData,
        message: responseData.message || 'Erro ao criar pagamento PIX',
        cause: responseData.cause || [],
        suggestions: [
          'Verifique se sua conta tem PIX habilitado',
          'Aguarde alguns minutos se acabou de criar a chave PIX',
          'Verifique no painel: https://www.mercadopago.com.br/settings/pix',
          'Tente criar uma nova aplicação se o erro persistir'
        ]
      });
    }

    // Extrair dados relevantes
    const pixData = {
      id: responseData.id,
      status: responseData.status,
      amount: responseData.transaction_amount,
      qrCode: responseData.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      qrCodeText: responseData.point_of_interaction?.transaction_data?.qr_code || null,
      ticketUrl: responseData.point_of_interaction?.transaction_data?.ticket_url || null,
      expirationDate: responseData.date_of_expiration,
      rawResponse: responseData
    };

    return apiResponse.success({
      success: true,
      message: 'PIX criado com sucesso!',
      pixData,
      nextSteps: {
        checkStatus: `/api/test-pix-direct/${responseData.id}`,
        testPage: '/test-pix'
      }
    });

  } catch (error: any) {
    console.error('Erro completo:', error);
    return handleApiError(error);
  }
}

// GET para verificar status
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('id');
    
    if (!paymentId) {
      return apiResponse.error('VALIDATION_ERROR', 'ID do pagamento é obrigatório', 400);
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return apiResponse.error('PAYMENT_ERROR', data.message || 'Erro ao buscar pagamento', response.status);
    }

    return apiResponse.success({
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      amount: data.transaction_amount,
      paidAt: data.date_approved,
      qrCode: data.point_of_interaction?.transaction_data?.qr_code_base64,
      rawData: data
    });

  } catch (error) {
    return handleApiError(error);
  }
}