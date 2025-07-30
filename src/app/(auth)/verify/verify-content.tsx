'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyContent() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  // Removido verificação automática via URL - agora só aceita código manual

  const handleVerification = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setError('Erro ao verificar email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode) {
      handleVerification(verificationCode);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email verificado!</h2>
            <p className="text-gray-600 mb-4">Sua conta foi verificada com sucesso.</p>
            <p className="text-sm text-gray-500">Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Rio Porto P2P</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            Verifique seu email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {email ? (
              <>Enviamos um código de verificação para <strong>{email}</strong></>
            ) : (
              'Digite o código de verificação enviado para seu email'
            )}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de verificação
              </label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => {
                  // Permitir apenas números
                  const value = e.target.value.replace(/\D/g, '');
                  setVerificationCode(value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                autoComplete="off"
                inputMode="numeric"
                pattern="[0-9]{6}"
              />
              <p className="mt-2 text-xs text-gray-500">
                Digite o código de 6 dígitos enviado para seu email (válido por 30 minutos)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !verificationCode}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : 'Verificar email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não recebeu o email?{' '}
              <button className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Reenviar código
              </button>
            </p>
          </div>
        </div>

        <div className="text-center">
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Voltar para o login
          </a>
        </div>
      </div>
    </div>
  );
}