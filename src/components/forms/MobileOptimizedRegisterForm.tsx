'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { useRouter } from 'next/navigation';
import { formatCPF, formatPhone } from '@/lib/auth/client-utils';
import { 
  useMobileOptimizations, 
  BottomSheet,
  useHapticFeedback 
} from './MobileOptimizations';

export const MobileOptimizedRegisterForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const router = useRouter();
  
  // Hooks de otimização mobile
  const { scrollToElement } = useMobileOptimizations();
  const { vibrate } = useHapticFeedback();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  // Detecta se está em dispositivo móvel
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Vibra ao encontrar erro
  useEffect(() => {
    if (error || Object.keys(errors).length > 0) {
      vibrate([100, 50, 100]); // Padrão de vibração para erro
    }
  }, [error, errors, vibrate]);

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);
      vibrate(10); // Feedback tátil ao submeter

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      setSuccess(true);
      vibrate([50, 100, 50]); // Vibração de sucesso
      
      setTimeout(() => {
        router.push('/verify?email=' + encodeURIComponent(data.email));
      }, 2000);
    } catch (error) {
      setError('Ocorreu um erro ao criar sua conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue('cpf', formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue('phone', formatted);
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg text-center">
          <h3 className="font-semibold mb-2">Conta criada com sucesso!</h3>
          <p className="text-sm">Redirecionando para verificação de email...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto px-4 pb-20 sm:pb-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Mensagem de erro fixa no topo em mobile */}
          {error && (
            <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg ${
              isMobile ? 'sticky top-0 z-10 shadow-md' : ''
            }`}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              autoComplete="name"
              autoCapitalize="words"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-base"
              placeholder="João Silva"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-base"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
              CPF (opcional - aumenta seu limite)
            </label>
            <input
              {...register('cpf')}
              type="text"
              id="cpf"
              inputMode="numeric"
              autoComplete="off"
              onChange={handleCPFChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-base"
              placeholder="123.456.789-00"
              disabled={isLoading}
            />
            {errors.cpf && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.cpf.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp (opcional)
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              inputMode="tel"
              autoComplete="tel"
              onChange={handlePhoneChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-base"
              placeholder="(11) 99999-9999"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-base"
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.password.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar senha
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-base"
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              {...register('acceptTerms')}
              type="checkbox"
              id="acceptTerms"
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
              disabled={isLoading}
            />
            <label htmlFor="acceptTerms" className="ml-3 block text-sm text-gray-700">
              Eu aceito os{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms(true);
                  vibrate(10);
                }}
                className="text-blue-600 hover:text-blue-500 underline"
              >
                termos de uso
              </button>{' '}
              e a{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacy(true);
                  vibrate(10);
                }}
                className="text-blue-600 hover:text-blue-500 underline"
              >
                política de privacidade
              </button>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.acceptTerms.message}</p>
          )}

          {/* Botão flutuante em mobile */}
          <div className={isMobile ? 'fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg' : ''}>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </div>

          <p className={`text-center text-sm text-gray-600 ${isMobile ? 'mb-4' : ''}`}>
            Já tem uma conta?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Faça login
            </a>
          </p>
        </form>
      </div>

      {/* Bottom Sheets para termos e privacidade */}
      <BottomSheet
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        title="Termos de Uso"
      >
        <div className="prose prose-sm max-w-none">
          <h4>1. Aceitação dos Termos</h4>
          <p>
            Ao usar a plataforma RioPorto P2P, você concorda com estes termos de uso.
          </p>
          
          <h4>2. Uso da Plataforma</h4>
          <p>
            A RioPorto é uma plataforma de negociação P2P de criptomoedas. 
            Você é responsável por suas transações.
          </p>
          
          <h4>3. Segurança</h4>
          <p>
            Mantenha suas credenciais seguras. Não compartilhe sua senha com terceiros.
          </p>
          
          <h4>4. Taxas</h4>
          <p>
            A plataforma pode cobrar taxas de transação conforme informado no momento da negociação.
          </p>
          
          <h4>5. Disputas</h4>
          <p>
            Em caso de disputas, nossa equipe de suporte mediará conforme nossas políticas.
          </p>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Política de Privacidade"
      >
        <div className="prose prose-sm max-w-none">
          <h4>1. Coleta de Dados</h4>
          <p>
            Coletamos apenas os dados necessários para operar a plataforma de forma segura.
          </p>
          
          <h4>2. Uso dos Dados</h4>
          <p>
            Seus dados são usados para verificação de identidade, prevenção de fraudes e melhoria do serviço.
          </p>
          
          <h4>3. Compartilhamento</h4>
          <p>
            Não compartilhamos seus dados com terceiros, exceto quando exigido por lei.
          </p>
          
          <h4>4. Segurança</h4>
          <p>
            Utilizamos criptografia e outras medidas de segurança para proteger seus dados.
          </p>
          
          <h4>5. Seus Direitos</h4>
          <p>
            Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento.
          </p>
        </div>
      </BottomSheet>
    </>
  );
};