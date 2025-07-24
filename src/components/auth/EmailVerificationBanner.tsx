'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

interface EmailVerificationBannerProps {
  email: string;
  isVerified: boolean;
}

export function EmailVerificationBanner({ email, isVerified }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  if (isVerified) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      } else {
        setResendError(data.error?.message || 'Erro ao reenviar email');
      }
    } catch (error) {
      setResendError('Erro ao conectar com o servidor');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      <Alert variant="warning" className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-yellow-900">Email não verificado</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Por favor, verifique seu email para acessar todas as funcionalidades.
            </p>
          </div>
          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            variant="outline"
            size="sm"
            className="border-yellow-600 text-yellow-900 hover:bg-yellow-50"
          >
            {isResending ? 'Enviando...' : 'Reenviar email'}
          </Button>
        </div>
      </Alert>

      {resendSuccess && (
        <Alert variant="success" className="mb-4">
          <p className="text-sm">Email de verificação enviado com sucesso! Verifique sua caixa de entrada.</p>
        </Alert>
      )}

      {resendError && (
        <Alert variant="error" className="mb-4">
          <p className="text-sm">{resendError}</p>
        </Alert>
      )}
    </div>
  );
}