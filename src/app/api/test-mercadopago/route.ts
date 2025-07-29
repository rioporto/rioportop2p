import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  const diagnostics: any = {
    env: {
      hasToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      tokenLength: process.env.MERCADO_PAGO_ACCESS_TOKEN?.length,
      tokenPrefix: process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 10) + '...',
      nodeEnv: process.env.NODE_ENV
    },
    sdk: {
      canRequire: false,
      hasClasses: false,
      error: null
    },
    instance: {
      canCreate: false,
      error: null
    }
  };

  // Testar require
  try {
    const mp = require('mercadopago');
    diagnostics.sdk.canRequire = true;
    diagnostics.sdk.hasClasses = !!(mp.MercadoPagoConfig && mp.Payment);
    diagnostics.sdk.availableExports = Object.keys(mp);
  } catch (error: any) {
    diagnostics.sdk.error = error.message;
  }

  // Testar criação de instância
  if (diagnostics.sdk.hasClasses) {
    try {
      const { MercadoPagoConfig, Payment } = require('mercadopago');
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-TOKEN',
        options: { timeout: 5000 }
      });
      const payment = new Payment(client);
      diagnostics.instance.canCreate = true;
      diagnostics.instance.hasPaymentMethods = typeof payment.create === 'function';
    } catch (error: any) {
      diagnostics.instance.error = error.message;
    }
  }

  // Testar API diretamente
  diagnostics.api = {
    accountInfo: null,
    error: null
  };

  if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    try {
      const response = await fetch('https://api.mercadopago.com/users/me', {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        diagnostics.api.accountInfo = {
          id: data.id,
          nickname: data.nickname,
          email: data.email,
          siteId: data.site_id,
          countryId: data.country_id,
          tags: data.tags || [],
          identification: data.identification,
          isTest: data.tags?.includes('test_user') || false
        };
      } else {
        diagnostics.api.error = `API Error: ${response.status} ${response.statusText}`;
        const errorText = await response.text();
        diagnostics.api.errorDetails = errorText;
      }
    } catch (error: any) {
      diagnostics.api.error = error.message;
    }
  }

  // Adicionar recomendações
  diagnostics.recommendations = [];
  
  if (!diagnostics.env.hasToken) {
    diagnostics.recommendations.push('Configure MERCADO_PAGO_ACCESS_TOKEN no Railway');
  }
  
  if (diagnostics.api.accountInfo?.isTest) {
    diagnostics.recommendations.push('Você está usando credenciais de TESTE. Use credenciais de PRODUÇÃO.');
  }
  
  if (diagnostics.api.error?.includes('401')) {
    diagnostics.recommendations.push('Token inválido ou expirado. Gere um novo token no painel do Mercado Pago.');
  }

  if (diagnostics.api.accountInfo && !diagnostics.api.accountInfo.tags?.includes('pix_enabled')) {
    diagnostics.recommendations.push('PIX pode não estar habilitado. Verifique em https://www.mercadopago.com.br/settings/pix');
  }

  return apiResponse.success(diagnostics);
}