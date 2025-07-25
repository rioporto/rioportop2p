import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';

export async function GET(req: NextRequest) {
  // Verificar autenticação
  const session = await auth();
  
  if (!session || session.user?.email !== 'johnny@rioporto.com.br') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  // Lista de variáveis de ambiente importantes (sem expor valores sensíveis)
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    AUTH_SECRET_EXISTS: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
    SMS_DEV_API_KEY_EXISTS: !!process.env.SMS_DEV_API_KEY,
    SMSDEV_API_KEY_EXISTS: !!process.env.SMSDEV_API_KEY,
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