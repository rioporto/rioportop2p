'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function ListingsError({
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
      title="Erro ao carregar anúncios"
      description="Não foi possível carregar a lista de anúncios. Por favor, tente novamente."
    />
  );
} 