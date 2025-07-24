import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Lista de variáveis de ambiente importantes (sem expor valores sensíveis)
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    AUTH_SECRET_EXISTS: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
    SMS_DEV_API_KEY_EXISTS: !!process.env.SMS_DEV_API_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_URL: process.env.AUTH_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    VERCEL_URL: process.env.VERCEL_URL,
    // Versões
    NODE_VERSION: process.version,
    // Timezone
    TZ: process.env.TZ || 'não definido',
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: envVars,
    message: 'Debug info - não expõe valores sensíveis'
  });
}