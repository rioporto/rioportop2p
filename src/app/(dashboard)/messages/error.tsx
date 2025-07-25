'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Erro ao carregar mensagens"
      description="Não foi possível carregar suas mensagens. Por favor, tente novamente."
    />
  );
} 