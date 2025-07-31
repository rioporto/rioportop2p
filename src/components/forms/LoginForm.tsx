'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/styles/login.css';

interface ILoginFormProps {
  callbackUrl?: string;
}

export const LoginForm: React.FC<ILoginFormProps> = ({ callbackUrl = '/dashboard' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const router = useRouter();
  
  // Limpar loading ao desmontar o componente
  useEffect(() => {
    return () => {
      setIsLoading(false);
      setLoadingMessage('');
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingMessage('Verificando suas credenciais...');

      // Timeout de segurança de 30 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 30000)
      );

      const loginPromise = signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      const result = await Promise.race([loginPromise, timeoutPromise]).catch(err => {
        if (err.message === 'timeout') {
          throw new Error('O servidor está demorando para responder. Tente novamente.');
        }
        throw err;
      }) as any;

      if (result?.error) {
        setError('Email ou senha inválidos');
        return;
      }

      setLoadingMessage('Login realizado! Preparando sua área segura...');
      
      // Pequeno delay para o usuário ver a mensagem de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoadingMessage('Redirecionando...');
      
      // Manter o loading ativo durante o redirecionamento
      // Forçar navegação com window.location para garantir carregamento completo
      window.location.href = callbackUrl;
      
      // NÃO remover o loading aqui - deixar ativo até a página mudar
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao fazer login');
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Conectando com o Google...');
      await signIn('google', { callbackUrl });
      // Manter loading ativo - será removido quando a página mudar
    } catch (error) {
      setError('Erro ao fazer login com Google');
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Overlay de loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex flex-col items-center justify-center loading-overlay">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
            <p className="text-white font-semibold text-lg loading-message">{loadingMessage}</p>
            <p className="text-gray-400 text-sm mt-2">Por favor, aguarde...</p>
            {loadingMessage.includes('Redirecionando') && (
              <p className="text-gray-500 text-xs mt-4">Se demorar muito, <a href={callbackUrl} className="text-blue-400 hover:underline">clique aqui</a></p>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
            placeholder="seu@email.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Senha
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            Esqueceu a senha?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative submit-button"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Entrando...
            </span>
          ) : (
            'Entrar'
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">Ou continue com</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-gray-800 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 submit-button"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Conectando...
            </span>
          ) : (
            'Entrar com Google'
          )}
        </button>

        <p className="text-center text-sm text-gray-400">
          Não tem uma conta?{' '}
          <a href="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
            Cadastre-se
          </a>
        </p>
      </form>
    </div>
  );
};