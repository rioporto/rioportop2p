import "server-only";
import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    home: process.env.NEXT_PUBLIC_STACK_URL || process.env.NEXTAUTH_URL || "https://rioporto.com.br",
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
});