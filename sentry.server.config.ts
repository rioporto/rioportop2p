import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Ajuste o rastreamento de desempenho em produção
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Opções adicionais
  debug: false,
  environment: process.env.NODE_ENV,
  
  // Configurações específicas do servidor
  profilesSampleRate: 0.1,
  
  // Ignora erros específicos
  ignoreErrors: [
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
  ],
  
  // Integração com Prisma
  integrations: [
    Sentry.prismaIntegration(),
  ],
});