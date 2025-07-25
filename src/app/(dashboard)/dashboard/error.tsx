'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function DashboardError({
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
      title="Erro ao carregar dashboard"
      description="Não foi possível carregar as informações do dashboard. Por favor, tente novamente."
    />
  );
} 