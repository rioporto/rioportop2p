import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Ajuste a taxa de amostragem de rastreamento de performance
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Captura de replay de sessão (útil para debug)
    replaysSessionSampleRate: 0.1, // 10% das sessões
    replaysOnErrorSampleRate: 1.0, // 100% das sessões com erro
    
    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Filtra erros locais e de desenvolvimento
    beforeSend(event, hint) {
      // Ignora erros de desenvolvimento local
      if (window.location.hostname === "localhost") {
        return null;
      }
      
      // Ignora erros de extensões do navegador
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes("extension://")
      )) {
        return null;
      }
      
      return event;
    },
    
    // Tags globais
    initialScope: {
      tags: {
        app: "rioporto-p2p",
        component: "client",
      },
    },
  });
}