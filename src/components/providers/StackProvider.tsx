"use client";

import { StackProvider as Provider, StackTheme } from "@stackframe/stack";

export function StackProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      app={{
        projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
        publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
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