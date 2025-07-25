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
  '/api/register',
  '/api/register-complete',
  '/api/listings',
  '/api/crypto/prices',
  '/test-login',
  '/_next',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ignora recursos estáticos e arquivos do Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') || // arquivos com extensão
    pathname.startsWith('/api/auth') // rotas de autenticação
  ) {
    return NextResponse.next();
  }
  
  // Permite acesso a rotas públicas
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Verificar se o usuário está autenticado
  const token = request.cookies.get('next-auth.session-token') || 
                request.cookies.get('__Secure-next-auth.session-token');
  
  if (!token) {
    // Se for uma rota de API, retorna 401
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Se for uma página, redireciona para login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
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