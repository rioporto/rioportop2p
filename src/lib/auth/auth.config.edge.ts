import type { NextAuthConfig } from 'next-auth';

// Configuração básica para o middleware (Edge Runtime)
// Não pode incluir Prisma ou outras dependências Node.js
export const authConfigEdge: NextAuthConfig = {
  providers: [], // Providers serão adicionados no auth.ts (Node.js runtime)
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      
      return true;
    },
  },
};