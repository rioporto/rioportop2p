import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { API_ROUTES } from '@/lib/api/config';
import { checkUserKYCLevel, checkUserIsAdmin } from '@/lib/auth/kyc';
// import { withTelemetry } from './lib/monitoring/telemetry';

// Função para verificar se uma rota é pública
function isPublicRoute(pathname: string): boolean {
  return API_ROUTES.public.some(route => {
    // Converter rota com parâmetros dinâmicos para regex
    const routeRegex = new RegExp(
      '^' + route.replace(/\[.*?\]/g, '[^/]+') + '/?$'
    );
    return routeRegex.test(pathname);
  });
}

// Função para verificar se uma rota requer autenticação
function isProtectedRoute(pathname: string): boolean {
  return API_ROUTES.protected.some(route => {
    const routeRegex = new RegExp(
      '^' + route.replace(/\[.*?\]/g, '[^/]+') + '/?$'
    );
    return routeRegex.test(pathname);
  });
}

// Função para verificar se uma rota requer nível específico de KYC
function getRequiredKYCLevel(pathname: string): number | null {
  for (const [level, routes] of Object.entries(API_ROUTES.kycRequired)) {
    const levelNumber = parseInt(level.replace('level', ''));
    const hasMatch = routes.some(route => {
      const routeRegex = new RegExp(
        '^' + route.replace(/\[.*?\]/g, '[^/]+') + '/?$'
      );
      return routeRegex.test(pathname);
    });
    if (hasMatch) {
      return levelNumber;
    }
  }
  return null;
}

// Função para verificar se uma rota requer permissões de admin
function isAdminRoute(pathname: string): boolean {
  return API_ROUTES.adminOnly.some(route => {
    const routeRegex = new RegExp(
      '^' + route.replace(/\[.*?\]/g, '[^/]+') + '/?$'
    );
    return routeRegex.test(pathname);
  });
}

// Middleware
export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir rotas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Verificar autenticação para rotas protegidas
  if (isProtectedRoute(pathname)) {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Não autenticado',
          code: 'UNAUTHORIZED'
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  // Verificar nível de KYC se necessário
  const requiredKYCLevel = getRequiredKYCLevel(pathname);
  if (requiredKYCLevel !== null) {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Não autenticado',
          code: 'UNAUTHORIZED'
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const hasRequiredKYC = await checkUserKYCLevel(session.user.id, requiredKYCLevel);
    if (!hasRequiredKYC) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Nível KYC insuficiente',
          code: 'INSUFFICIENT_KYC',
          requiredLevel: requiredKYCLevel
        }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  // Verificar permissões de admin se necessário
  if (isAdminRoute(pathname)) {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Não autenticado',
          code: 'UNAUTHORIZED'
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const isAdmin = await checkUserIsAdmin(session.user.id);
    if (!isAdmin) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Acesso negado',
          code: 'FORBIDDEN'
        }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  return NextResponse.next();
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    // Rotas da API
    '/api/:path*',
    // Rotas do dashboard (requerem autenticação)
    '/dashboard/:path*',
    // Excluir rotas públicas
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};