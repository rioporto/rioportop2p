'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function TradesError({
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
      title="Erro ao carregar trades"
      description="Não foi possível carregar suas operações. Por favor, tente novamente."
    />
  );
} 