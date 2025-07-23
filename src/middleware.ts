import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não requerem autenticação
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/reset-password',
  '/showcase',
  '/api/auth',
  '/test-login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permite acesso a rotas públicas
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Por enquanto, permite acesso a todas as rotas
  // TODO: Implementar verificação de autenticação quando resolver o problema do Edge Runtime
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (static files)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|images|assets).*)',
  ],
};