"use client";

import { StackProvider as Provider, StackTheme } from "@stackframe/stack";

export function StackProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      app={{
        projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
        publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
        urls: {
          home: process.env.NEXT_PUBLIC_STACK_URL || "https://rioporto.com.br",
          signIn: "/auth/signin",
          afterSignIn: "/dashboard",
          signUp: "/auth/signup",
          afterSignUp: "/dashboard",
          signOut: "/",
          afterSignOut: "/",
          emailVerification: "/auth/verify-email",
          passwordReset: "/auth/reset-password",
          forgotPassword: "/auth/forgot-password",
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