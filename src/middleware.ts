import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware simplificado temporário
// A autenticação está sendo feita diretamente nas rotas da API
// TODO: Reimplementar quando resolver incompatibilidade com Edge Runtime

export default async function middleware(request: NextRequest) {
  // Por enquanto, apenas passar todas as requisições
  // A proteção de rotas está implementada em cada API route individualmente
  return NextResponse.next();
}

// Configurar quais rotas devem passar pelo middleware
export const config = {
  matcher: [
    // Incluir apenas rotas que precisam de processamento no Edge
    // Por enquanto, excluir todas para evitar problemas
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};