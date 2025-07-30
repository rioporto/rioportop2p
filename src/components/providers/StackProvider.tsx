"use client";

import { StackProvider as Provider, StackTheme } from "@stackframe/stack";
import { useEffect, useState } from "react";

export function StackProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Durante o SSR, apenas renderiza os children sem o provider
  if (!isMounted) {
    return <>{children}</>;
  }

  // Verifica se as variáveis estão disponíveis
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

  if (!projectId || !publishableKey) {
    console.warn("Stack Auth: Missing environment variables");
    return <>{children}</>;
  }

  return (
    <Provider
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
    </Provider>
  );
}