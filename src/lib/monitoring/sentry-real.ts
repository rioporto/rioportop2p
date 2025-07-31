import * as Sentry from "@sentry/nextjs";

/**
 * Configuração real do Sentry com DSN
 * Este arquivo substitui o sentry.ts quando o DSN estiver configurado
 */

export {
  captureException as captureError,
  captureMessage,
  setUser,
  addBreadcrumb,
} from "@sentry/nextjs";

export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Captura um erro específico de transação PIX
 */
export function capturePixError(
  error: Error | unknown,
  transactionData: {
    amount?: number;
    userId?: string;
    transactionId?: string;
    status?: string;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag("transaction.type", "pix");
    scope.setContext("pix_transaction", transactionData);
    scope.setLevel("error");
    Sentry.captureException(error);
  });
}

/**
 * Rastreia performance de operações críticas
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({ name, op }, (span) => {
    return span;
  });
}

/**
 * Monitora taxa de sucesso de transações
 */
export function trackTransactionSuccess(
  type: "pix" | "crypto" | "trade",
  success: boolean,
  metadata?: Record<string, any>
) {
  Sentry.metrics.increment(`transaction.${type}.${success ? "success" : "failure"}`, 1, {
    tags: metadata,
  });
}