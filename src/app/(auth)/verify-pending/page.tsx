'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function VerifyPendingPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!email) return;

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifique seu email
          </h1>
          
          <p className="text-gray-600">
            Para acessar sua conta, você precisa verificar seu endereço de email.
          </p>
        </div>

        {email && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 text-center">
              Enviamos um email de verificação para:
            </p>
            <p className="font-medium text-gray-900 text-center mt-1">
              {email}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Alert variant="info">
            <p className="text-sm">
              Verifique sua caixa de entrada e clique no link de verificação. 
              O link é válido por 24 horas.
            </p>
          </Alert>

          {resendSuccess && (
            <Alert variant="success">
              <p className="text-sm">
                Email de verificação reenviado com sucesso!
              </p>
            </Alert>
          )}

          {resendError && (
            <Alert variant="error">
              <p className="text-sm">{resendError}</p>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || !email}
              variant="gradient"
              className="w-full"
            >
              {isResending ? 'Reenviando...' : 'Reenviar email de verificação'}
            </Button>

            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full">
                Voltar para o login
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Não recebeu o email?
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verifique sua pasta de spam ou lixo eletrônico</li>
              <li>• Certifique-se de que o email está correto</li>
              <li>• Aguarde alguns minutos e tente reenviar</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}