// Versão temporária sem Sentry até configurar DSN

/**
 * Captura um erro no Sentry com contexto adicional
 */
export function captureError(
  error: Error | unknown,
  context?: Record<string, any>
) {
  console.error("Error captured:", error);
  if (context) {
    console.error("Context:", context);
  }
}

/**
 * Registra uma mensagem no Sentry
 */
export function captureMessage(
  message: string,
  level: "debug" | "info" | "warning" | "error" = "info"
) {
  console.log(`[${level.toUpperCase()}]`, message);
}

/**
 * Define o usuário atual para rastreamento
 */
export function setUser(user: { id: string; email?: string; name?: string }) {
  console.log("User set:", user);
}

/**
 * Limpa o usuário (logout)
 */
export function clearUser() {
  console.log("User cleared");
}

/**
 * Adiciona breadcrumb para rastreamento
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  console.log(`[${category}] ${message}`, data);
}