import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    // Teste 1: Verificar ambiente
    const envCheck = {
      hasToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      tokenLength: process.env.MERCADO_PAGO_ACCESS_TOKEN?.length,
      nodeVersion: process.version,
      platform: process.platform
    };

    // Teste 2: Tentar importar bibliotecas
    let qrcodeAvailable = false;
    let mercadopagoAvailable = false;
    
    try {
      const qr = require('qrcode');
      qrcodeAvailable = !!qr;
    } catch (e) {
      // QRCode não disponível
    }
    
    try {
      const mp = require('mercadopago');
      mercadopagoAvailable = !!mp;
    } catch (e) {
      // MercadoPago não disponível
    }

    // Teste 3: Gerar dados mock simples
    const mockData = {
      id: Date.now(),
      qrCode: 'mock-qr-base64',
      qrCodeText: `PIX-MOCK-${Date.now()}`,
      amount: 100,
      status: 'pending'
    };

    return apiResponse.success({
      tests: {
        environment: envCheck,
        libraries: {
          qrcode: qrcodeAvailable,
          mercadopago: mercadopagoAvailable
        },
        mockData: mockData
      }
    });

  } catch (error: any) {
    console.error('Erro no teste simples:', error);
    return apiResponse.error(
      'TEST_ERROR',
      error.message || 'Erro desconhecido',
      500,
      { stack: error.stack }
    );
  }
}