import * as Sentry from "@sentry/nextjs";

/**
 * Captura um erro no Sentry com contexto adicional
 */
export function captureError(
  error: Error | unknown,
  context?: Record<string, any>
) {
  console.error("Error captured:", error);
  
  if (context) {
    Sentry.withScope((scope) => {
      scope.setContext("additional", context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Registra uma mensagem no Sentry
 */
export function captureMessage(
  message: string,
  level: "debug" | "info" | "warning" | "error" = "info"
) {
  Sentry.captureMessage(message, level);
}

/**
 * Define o usuário atual para rastreamento
 */
export function setUser(user: { id: string; email?: string; name?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

/**
 * Limpa o usuário (logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Adiciona breadcrumb para rastreamento
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: "info",
    data,
    timestamp: Date.now() / 1000,
  });
}