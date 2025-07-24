'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { useRouter } from 'next/navigation';
import { formatCPF, formatPhone } from '@/lib/auth/client-utils';
import { useFocusTrap, useKeyboardNavigation } from '@/hooks/useFocusTrap';
import { SecurityInfoField, securityTooltips } from './SecurityInfo';

export const RegisterFormDark: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  
  // Usar focus trap no formulário
  const formRef = useFocusTrap<HTMLFormElement>(!success);
  
  // Habilitar navegação por teclado
  useKeyboardNavigation();

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

  // Função para anunciar mudanças para screen readers
  const announceToScreenReader = (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 100);
  };

  // Focus no erro quando ocorrer
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
      announceToScreenReader(`Erro: ${error}`);
    }
  }, [error]);

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);
      announceToScreenReader('Processando cadastro, por favor aguarde');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error.message);
        announceToScreenReader(`Erro no cadastro: ${result.error.message}`);
        return;
      }

      setSuccess(true);
      announceToScreenReader('Conta criada com sucesso! Redirecionando para verificação de email');
      setTimeout(() => {
        router.push('/verify?email=' + encodeURIComponent(data.email));
      }, 2000);
    } catch (error) {
      const errorMessage = 'Ocorreu um erro ao criar sua conta';
      setError(errorMessage);
      announceToScreenReader(`Erro: ${errorMessage}`);
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
      <div className="w-full max-w-md mx-auto">
        <div 
          className="bg-green-900/20 border border-green-500 text-green-400 px-6 py-4 rounded-lg text-center"
          role="status"
          aria-live="polite"
          tabIndex={-1}
          ref={errorRef}
        >
          <h3 className="font-semibold mb-2">Conta criada com sucesso!</h3>
          <p className="text-sm">Redirecionando para verificação de email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Skip link para navegação rápida */}
      <a href="#register-submit" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md">
        Pular para o botão de cadastro
      </a>
      
      {/* Área de anúncios para screen readers */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcement}
      </div>
      
      <form 
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-5"
        role="form"
        aria-label="Formulário de cadastro"
        aria-busy={isLoading}
      >
        {error && (
          <div 
            ref={errorRef}
            className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg"
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
          >
            <span className="sr-only">Erro: </span>{error}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Nome completo
              <span className="text-red-400 ml-1" aria-label="campo obrigatório">*</span>
            </label>
          </div>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-white shadow-sm placeholder-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
            placeholder="João Silva"
            disabled={isLoading}
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-400" role="alert">
              <span className="sr-only">Erro: </span>{errors.name.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
              <span className="text-red-400 ml-1" aria-label="campo obrigatório">*</span>
            </label>
            <SecurityInfoField
              fieldName=""
              tooltipTitle={securityTooltips.email.title}
              tooltipContent={securityTooltips.email.content}
              icon={securityTooltips.email.icon}
            />
          </div>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-white shadow-sm placeholder-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
            placeholder="seu@email.com"
            disabled={isLoading}
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : 'email-help'}
            autoComplete="email"
          />
          <span id="email-help" className="sr-only">Digite seu email para criar a conta</span>
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
              <span className="sr-only">Erro: </span>{errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="cpf" className="text-sm font-medium text-gray-300">
              CPF
              <span className="text-gray-500 text-xs ml-2">(opcional - aumenta seu limite)</span>
            </label>
            <SecurityInfoField
              fieldName=""
              tooltipTitle={securityTooltips.cpf.title}
              tooltipContent={securityTooltips.cpf.content}
              icon={securityTooltips.cpf.icon}
            />
          </div>
          <input
            {...register('cpf')}
            type="text"
            id="cpf"
            onChange={handleCPFChange}
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-white shadow-sm placeholder-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
            placeholder="123.456.789-00"
            disabled={isLoading}
            aria-required="false"
            aria-invalid={errors.cpf ? 'true' : 'false'}
            aria-describedby={errors.cpf ? 'cpf-error' : 'cpf-help'}
            inputMode="numeric"
            autoComplete="off"
          />
          <span id="cpf-help" className="sr-only">CPF é opcional mas aumenta seu limite de transações</span>
          {errors.cpf && (
            <p id="cpf-error" className="mt-1 text-sm text-red-400" role="alert">
              <span className="sr-only">Erro: </span>{errors.cpf.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-300">
              WhatsApp
              <span className="text-gray-500 text-xs ml-2">(opcional)</span>
            </label>
            <SecurityInfoField
              fieldName=""
              tooltipTitle={securityTooltips.whatsapp.title}
              tooltipContent={securityTooltips.whatsapp.content}
              icon={securityTooltips.whatsapp.icon}
            />
          </div>
          <input
            {...register('phone')}
            type="text"
            id="phone"
            onChange={handlePhoneChange}
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-white shadow-sm placeholder-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
            placeholder="(11) 98765-4321"
            disabled={isLoading}
            aria-required="false"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
            inputMode="tel"
            autoComplete="tel"
          />
          <span id="phone-help" className="sr-only">Telefone para contato, campo opcional</span>
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-400" role="alert">
              <span className="sr-only">Erro: </span>{errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Senha
              <span className="text-red-400 ml-1" aria-label="campo obrigatório">*</span>
            </label>
            <SecurityInfoField
              fieldName=""
              tooltipTitle={securityTooltips.password.title}
              tooltipContent={securityTooltips.password.content}
              icon={securityTooltips.password.icon}
            />
          </div>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-white shadow-sm placeholder-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
            placeholder="••••••••"
            disabled={isLoading}
            aria-required="true"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : 'password-help'}
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos
          </p>
          <span id="password-help" className="sr-only">A senha deve ter pelo menos 8 caracteres</span>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-400" role="alert">
              <span className="sr-only">Erro: </span>{errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirmar senha
            <span className="text-red-400 ml-1" aria-label="campo obrigatório">*</span>
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-800 text-white shadow-sm placeholder-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
            placeholder="••••••••"
            disabled={isLoading}
            aria-required="true"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : 'confirmPassword-help'}
            autoComplete="new-password"
          />
          <span id="confirmPassword-help" className="sr-only">Digite a mesma senha para confirmar</span>
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-400" role="alert">
              <span className="sr-only">Erro: </span>{errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start">
          <input
            {...register('acceptTerms')}
            type="checkbox"
            id="acceptTerms"
            className="mt-1 h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-2 focus:ring-blue-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
            disabled={isLoading}
            aria-required="true"
            aria-invalid={errors.acceptTerms ? 'true' : 'false'}
            aria-describedby={errors.acceptTerms ? 'acceptTerms-error' : undefined}
          />
          <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-400">
            Li e aceito os{' '}
            <a 
              href="/terms" 
              className="text-blue-400 hover:text-blue-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
              aria-label="Ler termos de uso"
            >
              termos de uso
            </a>{' '}
            e a{' '}
            <a 
              href="/privacy" 
              className="text-blue-400 hover:text-blue-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
              aria-label="Ler política de privacidade"
            >
              política de privacidade
            </a>
            <span className="text-red-400 ml-1" aria-label="campo obrigatório">*</span>
          </label>
        </div>
        {errors.acceptTerms && (
          <p id="acceptTerms-error" className="text-sm text-red-400" role="alert">
            <span className="sr-only">Erro: </span>{errors.acceptTerms.message}
          </p>
        )}

        <button
          id="register-submit"
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
          aria-label={isLoading ? 'Criando conta, aguarde' : 'Criar conta'}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span aria-hidden="true">Criando conta...</span>
            </span>
          ) : (
            'Criar conta'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          <span className="sr-only">Nota: </span>
          Campos marcados com <span className="text-red-400" aria-label="asterisco">*</span> são obrigatórios
        </p>
      </form>
    </div>
  );
};