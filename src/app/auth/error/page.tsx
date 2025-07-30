'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Erro de Configuração',
          description: 'O login com Google ainda não está configurado nesta aplicação. Por favor, use o login com email e senha.',
          action: 'Voltar ao Login'
        };
      case 'OAuthSignin':
        return {
          title: 'Erro ao fazer login',
          description: 'Ocorreu um erro ao tentar fazer login com o provedor OAuth. Por favor, tente novamente.',
          action: 'Tentar Novamente'
        };
      case 'OAuthCallback':
        return {
          title: 'Erro de Callback',
          description: 'Ocorreu um erro durante o processo de autenticação. Por favor, tente novamente.',
          action: 'Voltar ao Login'
        };
      case 'OAuthCreateAccount':
        return {
          title: 'Erro ao criar conta',
          description: 'Não foi possível criar sua conta com o provedor OAuth. Por favor, tente com email e senha.',
          action: 'Criar Conta'
        };
      case 'EmailCreateAccount':
        return {
          title: 'Erro ao criar conta',
          description: 'Este email já está registrado. Por favor, faça login ou use outro email.',
          action: 'Fazer Login'
        };
      case 'Callback':
        return {
          title: 'Erro de autenticação',
          description: 'Ocorreu um erro durante o processo de autenticação. Por favor, tente novamente.',
          action: 'Voltar ao Login'
        };
      case 'Default':
      default:
        return {
          title: 'Erro de autenticação',
          description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
          action: 'Voltar ao Login'
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-vermelho-alerta/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-vermelho-alerta" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {errorInfo.title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {errorInfo.description}
          </p>

          {error === 'Configuration' && (
            <div className="bg-amarelo-ouro/10 border border-amarelo-ouro/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-amarelo-ouro">
                <strong>Nota:</strong> O login social estará disponível em breve. Por enquanto, utilize seu email e senha para acessar a plataforma.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button
                variant="gradient"
                gradient="primary"
                className="w-full"
              >
                {errorInfo.action}
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button
                variant="ghost"
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </Link>
          </div>

          {error && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
              Código do erro: {error}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}