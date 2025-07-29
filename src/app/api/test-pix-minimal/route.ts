import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = body.amount || 5.00;
    
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return apiResponse.error('CONFIG_ERROR', 'Token Mercado Pago não configurado', 500);
    }

    console.log('=== Teste Mínimo PIX Mercado Pago ===');
    
    // Configuração MÍNIMA para PIX
    const paymentData = {
      transaction_amount: amount,
      payment_method_id: 'pix',
      payer: {
        email: 'test@example.com'
      }
    };

    console.log('Enviando:', JSON.stringify(paymentData, null, 2));

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `minimal-${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    });

    const responseData = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      // Analisar erro específico
      let suggestion = 'Verifique as configurações da conta';
      
      if (responseData.message?.includes('Collector user without key enabled')) {
        suggestion = 'PIX não está habilitado. Aguarde 24h após criar chave PIX ou contate suporte.';
      } else if (responseData.message?.includes('invalid_parameter')) {
        suggestion = 'Parâmetros inválidos. Verifique a estrutura da requisição.';
      } else if (responseData.status === 401) {
        suggestion = 'Token inválido ou expirado. Gere novo token no painel.';
      }
      
      return apiResponse.success({
        success: false,
        error: responseData,
        suggestion,
        nextSteps: [
          '1. Verifique se a chave PIX está ativa: https://www.mercadopago.com.br/settings/pix',
          '2. Confirme que está usando token de PRODUÇÃO, não teste',
          '3. Se criou a chave hoje, aguarde até 24h para ativação completa',
          '4. Tente criar nova aplicação se o erro persistir'
        ]
      });
    }

    // Sucesso - extrair dados do PIX
    const pixInfo = responseData.point_of_interaction?.transaction_data || {};
    
    return apiResponse.success({
      success: true,
      paymentId: responseData.id,
      status: responseData.status,
      amount: responseData.transaction_amount,
      pixData: {
        qrCode: pixInfo.qr_code || 'Não disponível',
        qrCodeBase64: pixInfo.qr_code_base64 || 'Não disponível',
        ticketUrl: pixInfo.ticket_url || 'Não disponível',
        bankInfo: pixInfo.bank_info || {}
      },
      rawResponse: responseData
    });

  } catch (error: any) {
    console.error('Erro:', error);
    return handleApiError(error);
  }
}

// GET para verificar configuração
export async function GET() {
  return apiResponse.success({
    endpoint: '/api/test-pix-minimal',
    description: 'Teste mínimo de criação PIX',
    usage: 'POST com body: { "amount": 5.00 }',
    requirements: [
      'MERCADO_PAGO_ACCESS_TOKEN configurado',
      'Chave PIX ativa na conta',
      'Usar token de produção'
    ],
    debug: {
      hasToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      tokenLength: process.env.MERCADO_PAGO_ACCESS_TOKEN?.length || 0,
      isProduction: !process.env.MERCADO_PAGO_ACCESS_TOKEN?.includes('TEST')
    }
  });
}