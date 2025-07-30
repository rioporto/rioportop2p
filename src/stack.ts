import "server-only";
import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
  tokenStore: "nextjs-cookie",
  urls: {
    home: process.env.NEXTAUTH_URL || "https://rioporto.com.br",
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
});