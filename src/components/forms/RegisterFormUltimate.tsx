'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerFormSchema, type RegisterFormData } from '@/lib/validations/register';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { WhatsAppInputCustom } from '@/components/forms/inputs/WhatsAppInputCustom';
import { PasswordStrength } from '@/components/forms/inputs/PasswordStrength';
import { EmailAutocomplete } from '@/components/forms/inputs/EmailAutocomplete';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMobileOptimizations, BottomSheet } from '@/components/forms/MobileOptimizations';
import { FiUser, FiLock, FiCheck } from 'react-icons/fi';
import '@/styles/register.css';

export const RegisterFormUltimate: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordRequirementsMet, setPasswordRequirementsMet] = useState(false);
  
  const router = useRouter();
  const { vibrate } = useMobileOptimizations();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      acceptTerms: false,
    },
    mode: 'onChange',
  });

  const password = watch('password');
  const acceptTerms = watch('acceptTerms');

  // Detecta se está em dispositivo móvel
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      vibrate();

      console.log('Dados sendo enviados:', {
        ...data,
        password: '[REDACTED]',
        confirmPassword: '[REDACTED]'
      });

      const response = await fetch('/api/auth/register-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API:', response.status, errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          setError(errorJson.error?.message || 'Erro ao criar conta');
        } catch {
          setError('Erro ao criar conta. Tente novamente.');
        }
        
        vibrate([100, 50, 100]); // Vibração de erro
        return;
      }

      const result = await response.json();

      setSuccess(true);
      vibrate([50, 100, 50, 100]); // Vibração de sucesso
      
      setTimeout(() => {
        router.push('/verify?email=' + encodeURIComponent(data.email));
      }, 2000);
    } catch (error) {
      setError('Ocorreu um erro ao criar sua conta');
      vibrate([100, 50, 100]);
    } finally {
      setIsLoading(false);
    }
  };

  // Animação de sucesso
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{ duration: 0.6 }}
        >
          <FiCheck className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Conta criada com sucesso!</h3>
        <p className="text-gray-400">Redirecionando para verificação...</p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header com indicador de progresso */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <motion.div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === 1 ? 'w-8 bg-blue-500' :
                    step === 2 && (emailValid || errors.email) ? 'w-8 bg-blue-500' :
                    step === 3 && (!errors.whatsapp && watch('whatsapp')) ? 'w-8 bg-blue-500' :
                    step === 4 && (passwordRequirementsMet || errors.password) ? 'w-8 bg-blue-500' :
                    'w-2 bg-gray-600'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step * 0.1 }}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-400">Cadastro rápido e seguro</p>
        </div>

        {/* Mensagem de erro global */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3"
            >
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nome completo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Input
              {...register('name')}
              label="Nome completo"
              placeholder="João Silva"
              variant="glass"
              theme="dark"
              icon={<FiUser />}
              error={errors.name?.message}
              disabled={isLoading}
              animate="fadeIn"
              className="input-premium"
              aria-label="Digite seu nome completo"
              autoComplete="name"
            />
          </motion.div>

          {/* Email com autocomplete */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EmailAutocomplete
              value={watch('email')}
              onChange={(value) => setValue('email', value)}
              error={errors.email?.message}
              disabled={isLoading}
              theme="dark"
              onValidate={setEmailValid}
              required
            />
          </motion.div>

          {/* WhatsApp */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <WhatsAppInputCustom
              value={watch('whatsapp')}
              onChange={(value) => setValue('whatsapp', value)}
              onBlur={() => trigger('whatsapp')}
              error={errors.whatsapp?.message}
              disabled={isLoading}
              label="WhatsApp"
              required
              showPreview
              size="md"
              id="whatsapp"
              name="whatsapp"
            />
          </motion.div>

          {/* Senha com indicador de força */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PasswordStrength
              value={watch('password')}
              onChange={(value) => setValue('password', value)}
              error={errors.password?.message}
              disabled={isLoading}
              theme="dark"
              showStrengthBar
              showRequirements
              onRequirementsMet={setPasswordRequirementsMet}
              required
            />
          </motion.div>

          {/* Confirmar senha */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-gray-400">
                <FiLock className="w-5 h-5" />
              </div>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Confirme sua senha"
                disabled={isLoading}
                className={`
                  w-full px-4 py-2.5 pl-12 text-base
                  bg-gray-800 text-white placeholder-gray-400
                  border-2 rounded-lg outline-none transition-all duration-300
                  ${errors.confirmPassword 
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-gray-600 hover:border-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  }
                  ${isLoading && 'opacity-60 cursor-not-allowed'}
                `}
                aria-label="Confirme sua senha"
                aria-invalid={!!errors.confirmPassword}
              />
              <label className="absolute -top-2 left-3 px-1 bg-gray-800 text-xs font-medium text-gray-200">
                Confirmar senha <span className="text-red-500">*</span>
              </label>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.confirmPassword.message}
              </p>
            )}
          </motion.div>

          {/* Checkbox de termos */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
          >
            <label className="flex items-start cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  className="sr-only"
                  disabled={isLoading}
                  aria-describedby="terms-description"
                />
                <div className={`
                  w-5 h-5 border-2 rounded transition-all duration-200
                  ${acceptTerms 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-500 group-hover:border-gray-400'
                  }
                `}>
                  <AnimatePresence>
                    {acceptTerms && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-full h-full text-white p-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <span id="terms-description" className="ml-3 text-sm text-gray-300">
                Li e aceito os{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isMobile) {
                      setShowTermsSheet(true);
                    } else {
                      window.open('/terms', '_blank');
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  termos de uso
                </button>{' '}
                e a{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isMobile) {
                      setShowTermsSheet(true);
                    } else {
                      window.open('/privacy', '_blank');
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  política de privacidade
                </button>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-xs text-red-400 mt-2 ml-8">{errors.acceptTerms.message}</p>
            )}
          </motion.div>

          {/* Botão de submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
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
              className="button-submit relative overflow-hidden group"
              animate="scaleUp"
              aria-label={isLoading ? 'Criando conta...' : 'Criar conta'}
            >
              <span className="relative z-10">
                {isLoading ? 'Criando sua conta...' : 'Criar conta'}
              </span>
              {!isLoading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              )}
            </Button>
          </motion.div>

          {/* Indicadores de segurança inline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center space-x-4 text-xs text-gray-500"
          >
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SSL 256-bit</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
              </svg>
              <span>Dados protegidos</span>
            </div>
          </motion.div>
        </form>
      </div>

      {/* Bottom Sheet para termos (mobile) */}
      <BottomSheet
        isOpen={showTermsSheet}
        onClose={() => setShowTermsSheet(false)}
        title="Termos e Políticas"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Termos de Uso</h4>
            <p className="text-sm text-gray-600">
              Ao usar nossa plataforma, você concorda com nossos termos de uso...
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Política de Privacidade</h4>
            <p className="text-sm text-gray-600">
              Seus dados são protegidos e nunca serão compartilhados...
            </p>
          </div>
          <button
            onClick={() => {
              setValue('acceptTerms', true);
              setShowTermsSheet(false);
            }}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium"
          >
            Aceitar e continuar
          </button>
        </div>
      </BottomSheet>
    </>
  );
};