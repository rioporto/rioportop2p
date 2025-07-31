import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Ajuste a taxa de amostragem de rastreamento de performance
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Habilita o profiling
    profilesSampleRate: 0.1,
    
    // Tags globais
    initialScope: {
      tags: {
        app: "rioporto-p2p",
        component: "server",
      },
    },
    
    // Integrations específicas do servidor
    integrations: [
      // Captura automaticamente erros não tratados
      Sentry.captureConsoleIntegration({
        levels: ["error", "warn"],
      }),
    ],
    
    // Filtra informações sensíveis
    beforeSend(event) {
      // Remove dados sensíveis
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      
      // Remove tokens de autenticação
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers["x-auth-token"];
      }
      
      return event;
    },
  });
}