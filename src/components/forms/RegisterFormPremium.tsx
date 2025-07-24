'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { useRouter } from 'next/navigation';
import { formatCPF, formatPhone } from '@/lib/auth/client-utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import '@/styles/register.css';

// Ícones personalizados
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export const RegisterFormPremium: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  const password = watch('password');
  const acceptTerms = watch('acceptTerms');

  // Análise de força da senha
  const getPasswordStrength = (password: string = '') => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

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

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['name', 'email'] 
      : ['password', 'confirmPassword'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  if (success) {
    return (
      <div className="register-container-premium">
        <div className="register-form-wrapper">
          <div className="success-animation">
            <div className="success-checkmark">
              <CheckIcon />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Conta criada com sucesso!</h3>
            <p className="text-gray-400">Redirecionando para verificação de email...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container-premium">
      <div className="register-form-wrapper">
        {/* Elementos decorativos de fundo */}
        <div className="register-bg-gradient" />
        <div className="register-bg-pattern" />
        
        <div className="register-form-content">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-glow">
              <ShieldIcon />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Criar conta premium</h2>
            <p className="text-gray-400">Junte-se à plataforma P2P mais segura do Brasil</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Dados pessoais</span>
              </div>
              <div className="step-connector" />
              <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Segurança</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message-premium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Dados Pessoais */}
            <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
              <Input
                {...register('name')}
                label="Nome completo"
                placeholder="João Silva"
                variant="glass"
                theme="dark"
                icon={<UserIcon />}
                error={errors.name?.message}
                disabled={isLoading}
                animate="fadeIn"
                className="input-premium"
              />

              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="seu@email.com"
                variant="glass"
                theme="dark"
                icon={<EmailIcon />}
                error={errors.email?.message}
                disabled={isLoading}
                animate="fadeIn"
                className="input-premium"
              />

              <Input
                {...register('cpf')}
                label="CPF"
                placeholder="123.456.789-00"
                variant="glass"
                theme="dark"
                icon={<DocumentIcon />}
                onChange={handleCPFChange}
                error={errors.cpf?.message}
                hint="Opcional - aumenta seu limite de transações"
                disabled={isLoading}
                animate="fadeIn"
                className="input-premium"
              />

              <Input
                {...register('phone')}
                label="Telefone"
                placeholder="(11) 98765-4321"
                variant="glass"
                theme="dark"
                icon={<PhoneIcon />}
                onChange={handlePhoneChange}
                error={errors.phone?.message}
                hint="Opcional - para notificações importantes"
                disabled={isLoading}
                animate="fadeIn"
                className="input-premium"
              />

              <Button
                type="button"
                onClick={nextStep}
                variant="gradient"
                gradient="luxury"
                size="lg"
                fullWidth
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
                iconPosition="right"
                className="mt-6"
                animate="scaleUp"
              >
                Próximo passo
              </Button>
            </div>

            {/* Step 2: Segurança */}
            <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
              <div>
                <Input
                  {...register('password')}
                  type="password"
                  label="Senha"
                  placeholder="••••••••"
                  variant="glass"
                  theme="dark"
                  icon={<LockIcon />}
                  error={errors.password?.message}
                  disabled={isLoading}
                  animate="fadeIn"
                  className="input-premium"
                />
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="password-strength-container">
                    <div className="password-strength-bars">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`password-strength-bar ${i < passwordStrength ? 'active' : ''} strength-${passwordStrength}`}
                        />
                      ))}
                    </div>
                    <span className="password-strength-text">
                      {passwordStrength === 0 && 'Muito fraca'}
                      {passwordStrength === 1 && 'Fraca'}
                      {passwordStrength === 2 && 'Razoável'}
                      {passwordStrength === 3 && 'Forte'}
                      {passwordStrength === 4 && 'Muito forte'}
                    </span>
                  </div>
                )}
              </div>

              <Input
                {...register('confirmPassword')}
                type="password"
                label="Confirmar senha"
                placeholder="••••••••"
                variant="glass"
                theme="dark"
                icon={<LockIcon />}
                error={errors.confirmPassword?.message}
                disabled={isLoading}
                animate="fadeIn"
                className="input-premium"
              />

              {/* Terms Checkbox */}
              <div className="terms-container">
                <label className="terms-label">
                  <input
                    {...register('acceptTerms')}
                    type="checkbox"
                    className="terms-checkbox"
                    disabled={isLoading}
                  />
                  <span className="terms-checkbox-custom">
                    {acceptTerms && <CheckIcon />}
                  </span>
                  <span className="terms-text">
                    Li e aceito os{' '}
                    <a href="/terms" className="terms-link">
                      termos de uso
                    </a>{' '}
                    e a{' '}
                    <a href="/privacy" className="terms-link">
                      política de privacidade
                    </a>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-400 mt-1">{errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="glass"
                  size="lg"
                  fullWidth
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                  }
                  className="button-secondary"
                >
                  Voltar
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading || !acceptTerms}
                  variant="gradient"
                  gradient="luxury"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  glow
                  glowColor="primary"
                  className="button-submit"
                  animate="scaleUp"
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta premium'}
                </Button>
              </div>
            </div>
          </form>

          {/* Security badges */}
          <div className="security-badges">
            <div className="security-badge">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Criptografia SSL</span>
            </div>
            <div className="security-badge">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
              </svg>
              <span>Dados protegidos</span>
            </div>
            <div className="security-badge">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verificação 2FA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};