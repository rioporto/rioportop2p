'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-md w-full animate-fadeIn">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
          <CardTitle variant="gradient" size="xl" className="text-center">
            Oops! Algo deu errado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Encontramos um erro ao carregar o dashboard. Isso pode ser temporário.
          </p>

          {/* Error Details (apenas em desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <Button
              onClick={reset}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Tentar Novamente
            </Button>
            <Link href="/" className="w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Se o problema persistir, entre em contato com o suporte:
            </p>
            <p className="text-sm text-center mt-2">
              <a 
                href="mailto:suporte@rioporto.com" 
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                suporte@rioporto.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}