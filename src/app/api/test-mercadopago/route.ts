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

  return apiResponse.success(diagnostics);
}