'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { useRouter } from 'next/navigation';
import { formatCPF, formatPhone } from '@/lib/auth/client-utils';
import { TrustBadges } from './TrustBadges';
import { SecurityInfo, SecurityInfoField, securityTooltips } from './SecurityInfo';

export const RegisterForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);

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
      <div className="w-full max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg text-center">
          <h3 className="font-semibold mb-2">Conta criada com sucesso!</h3>
          <p className="text-sm">Redirecionando para verificação de email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna do formulário */}
        <div className="order-2 lg:order-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                placeholder="João Silva"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <SecurityInfoField
                fieldName="Email"
                tooltipTitle={securityTooltips.email.title}
                tooltipContent={securityTooltips.email.content}
                icon={securityTooltips.email.icon}
              />
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm mt-2"
                placeholder="seu@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <SecurityInfoField
                fieldName="CPF (opcional - aumenta seu limite)"
                tooltipTitle={securityTooltips.cpf.title}
                tooltipContent={securityTooltips.cpf.content}
                icon={securityTooltips.cpf.icon}
              />
              <input
                {...register('cpf')}
                type="text"
                id="cpf"
                onChange={handleCPFChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm mt-2"
                placeholder="123.456.789-00"
                disabled={isLoading}
              />
              {errors.cpf && (
                <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
              )}
            </div>

            <div>
              <SecurityInfoField
                fieldName="WhatsApp (opcional)"
                tooltipTitle={securityTooltips.whatsapp.title}
                tooltipContent={securityTooltips.whatsapp.content}
                icon={securityTooltips.whatsapp.icon}
              />
              <input
                {...register('phone')}
                type="text"
                id="phone"
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm mt-2"
                placeholder="(11) 99999-9999"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <SecurityInfoField
                fieldName="Senha"
                tooltipTitle={securityTooltips.password.title}
                tooltipContent={securityTooltips.password.content}
                icon={securityTooltips.password.icon}
              />
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm mt-2"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                {...register('acceptTerms')}
                type="checkbox"
                id="acceptTerms"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                disabled={isLoading}
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                Eu aceito os{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                  termos de uso
                </a>{' '}
                e a{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                  política de privacidade
                </a>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Faça login
              </a>
            </p>
          </form>
        </div>

        {/* Coluna de segurança e confiança */}
        <div className="order-1 lg:order-2 space-y-6">
          {/* Trust Badges */}
          <div className="lg:sticky lg:top-4">
            <TrustBadges />
            
            {/* Security Info */}
            <div className="mt-6">
              <SecurityInfo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};