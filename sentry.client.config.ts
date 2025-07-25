import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Ajuste o rastreamento de desempenho em produção
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Capture Replay apenas para erros em produção
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0,
  
  // Opções adicionais
  debug: false,
  environment: process.env.NODE_ENV,
  
  // Ignora erros específicos
  ignoreErrors: [
    // Erros de browser comuns
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    // Erros de rede
    "NetworkError",
    "Failed to fetch",
  ],
  
  // Filtra transações
  beforeTransaction(context) {
    // Não registra rotas de health check
    if (context.name === "GET /api/health") {
      return null;
    }
    return context;
  },
});