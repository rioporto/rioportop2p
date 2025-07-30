"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Importação dinâmica do Stack Auth para evitar SSR
const StackProvider = dynamic(
  () => import('@stackframe/stack').then(mod => mod.StackProvider),
  { 
    ssr: false,
    loading: () => null 
  }
);

const StackTheme = dynamic(
  () => import('@stackframe/stack').then(mod => mod.StackTheme),
  { 
    ssr: false,
    loading: () => null 
  }
);

interface ClientStackProviderProps {
  children: ReactNode;
}

export function ClientStackProvider({ children }: ClientStackProviderProps) {
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // Verificar se as variáveis existem
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

  if (!projectId || !publishableKey) {
    console.warn('Stack Auth: Missing environment variables');
    return <>{children}</>;
  }

  return (
    <StackProvider
      app={{
        projectId,
        publishableClientKey: publishableKey,
        urls: {
          home: "https://rioporto.com.br",
          signIn: "/handler/sign-in",
          afterSignIn: "/dashboard",
          signUp: "/handler/sign-up",
          afterSignUp: "/dashboard",
          signOut: "/",
          afterSignOut: "/",
          emailVerification: "/handler/verify-email",
          passwordReset: "/handler/reset-password",
          forgotPassword: "/handler/forgot-password",
          userProfile: "/profile",
          selectOrganization: "/select-organization"
        }
      }}
    >
      <StackTheme>
        {children}
      </StackTheme>
    </StackProvider>
  );
}