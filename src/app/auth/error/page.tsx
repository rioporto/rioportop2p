'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'Há um problema na configuração do servidor. Por favor, tente novamente mais tarde.',
    AccessDenied: 'Acesso negado. Você não tem permissão para acessar este recurso.',
    Verification: 'O link de verificação expirou ou é inválido.',
    OAuthSignin: 'Erro ao fazer login com provedor externo.',
    OAuthCallback: 'Erro ao processar resposta do provedor externo.',
    OAuthCreateAccount: 'Não foi possível criar sua conta.',
    EmailCreateAccount: 'Não foi possível criar sua conta com este email.',
    Callback: 'Erro ao processar autenticação.',
    OAuthAccountNotLinked: 'Este email já está cadastrado com outro método de login.',
    EmailSignin: 'Erro ao enviar email de verificação.',
    CredentialsSignin: 'Email ou senha incorretos.',
    SessionRequired: 'Por favor, faça login para acessar esta página.',
    Default: 'Ocorreu um erro durante a autenticação.',
  };

  const message = errorMessages[error || 'Default'] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Rio Porto P2P</h1>
          <h2 className="mt-6 text-2xl font-semibold text-red-600">Erro de Autenticação</h2>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <div className="space-y-4">
            {error === 'Configuration' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Este erro geralmente indica um problema temporário. 
                  Nossa equipe foi notificada e está trabalhando na solução.
                </p>
              </div>
            )}

            <Link href="/login" className="block">
              <Button className="w-full">
                Tentar Novamente
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Código do erro: <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{error || 'Unknown'}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}