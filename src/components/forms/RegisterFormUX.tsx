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
import { Alert } from '@/components/ui/Alert';
import { useMobileOptimizations, BottomSheet } from '@/components/forms/MobileOptimizations';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { 
  UserIcon as UserIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  PhoneIcon as PhoneIconSolid,
  LockClosedIcon as LockClosedIconSolid,
  CheckIcon
} from '@heroicons/react/24/solid';
import '@/styles/register.css';
import { useFocusScroll } from '@/hooks/useFocusScroll';

// Mensagens de erro específicas
const errorMessages: { [key: string]: string } = {
  'email_already_exists': 'Este email já está cadastrado. Faça login ou use outro email.',
  'weak_password': 'Senha muito fraca. Use letras maiúsculas, números e caracteres especiais.',
  'invalid_email': 'Email inválido. Verifique se digitou corretamente.',
  'invalid_whatsapp': 'Número de WhatsApp inválido. Use o formato (XX) 9XXXX-XXXX.',
  'network_error': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'server_error': 'Erro no servidor. Tente novamente em alguns instantes.',
  'rate_limit': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
  'validation_error': 'Por favor, verifique os campos e tente novamente.',
  'unknown_error': 'Ocorreu um erro inesperado. Tente novamente.'
};

// Função para analisar e traduzir mensagens de erro
const parseErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    const errorLower = error.toLowerCase();
    
    // Verifica se o erro contém palavras-chave conhecidas
    if (errorLower.includes('email') && (errorLower.includes('exist') || errorLower.includes('already'))) {
      return errorMessages.email_already_exists;
    }
    if (errorLower.includes('password') && (errorLower.includes('weak') || errorLower.includes('invalid'))) {
      return errorMessages.weak_password;
    }
    if (errorLower.includes('network') || errorLower.includes('fetch')) {
      return errorMessages.network_error;
    }
    if (errorLower.includes('rate') || errorLower.includes('limit')) {
      return errorMessages.rate_limit;
    }
    if (errorLower.includes('validation')) {
      return errorMessages.validation_error;
    }
    
    return error;
  }
  
  if (error?.message) {
    return parseErrorMessage(error.message);
  }
  
  if (error?.error) {
    return parseErrorMessage(error.error);
  }
  
  return errorMessages.unknown_error;
};

// Componente de indicador de progresso
const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = [
    { step: 1, icon: UserIcon, iconSolid: UserIconSolid, label: 'Nome' },
    { step: 2, icon: EnvelopeIcon, iconSolid: EnvelopeIconSolid, label: 'Email' },
    { step: 3, icon: PhoneIcon, iconSolid: PhoneIconSolid, label: 'WhatsApp' },
    { step: 4, icon: LockClosedIcon, iconSolid: LockClosedIconSolid, label: 'Senha' },
    { step: 5, icon: ShieldCheckIcon, iconSolid: ShieldCheckIcon, label: 'Termos' }
  ];

  return (
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center space-x-3">
        {steps.map(({ step, icon: Icon, iconSolid: IconSolid, label }) => (
          <div key={step} className="flex flex-col items-center">
            <motion.div
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30' 
                  : 'bg-gray-700 border-2 border-gray-600'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: step * 0.1 }}
            >
              {currentStep >= step ? (
                <IconSolid className="w-5 h-5 text-white" />
              ) : (
                <Icon className="w-5 h-5 text-gray-400" />
              )}
              {currentStep > step && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircleIcon className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.div>
            <span className={`text-xs mt-1 ${currentStep >= step ? 'text-blue-400' : 'text-gray-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de força de senha atualizado
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const calculateStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/\d/)) strength++;
    if (pwd.match(/[@$!%*?&]/)) strength++;
    if (pwd.length >= 12) strength++;
    return strength;
  };

  const strength = calculateStrength(password);
  const strengthText = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Excelente'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500', 
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-600'
  ];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? strengthColors[strength - 1] : 'bg-gray-200'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: i < strength ? 1 : 0.3 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Força: <span className={`font-medium ${
            strength === 0 ? 'text-red-600' :
            strength === 1 ? 'text-orange-600' :
            strength === 2 ? 'text-yellow-600' :
            strength >= 3 ? 'text-green-600' : ''
          }`}>{strengthText[Math.max(0, strength - 1)]}</span>
        </span>
        {strength >= 3 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-green-600"
          >
            <CheckCircleIcon className="w-3 h-3" />
            <span className="text-xs">Senha segura</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Componente de animação de sucesso
const SuccessAnimation: React.FC<{ email: string; onContinue: () => void; verificationUrl?: string }> = ({ email, onContinue, verificationUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        className="relative w-24 h-24 mx-auto mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        {/* Círculo de fundo animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Ícone principal */}
        <motion.div
          className="relative w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 0.6 }}
        >
          <CheckCircleIcon className="w-12 h-12 text-white" />
        </motion.div>
        
        {/* Partículas de celebração */}
        <motion.div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: [0, (i % 2 ? 1 : -1) * (30 + i * 10)],
                y: [0, -50 - i * 10],
                opacity: [1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: 0.3 + i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <motion.h3 
        className="text-3xl font-bold text-white mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Conta criada com sucesso!
      </motion.h3>
      
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="space-y-4 mt-6"
      >
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-start space-x-3">
            <EnvelopeIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-semibold text-green-400">
                {verificationUrl ? 'Conta criada! Verifique seu email:' : 'Email de verificação enviado!'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {verificationUrl ? (
                  <>
                    <span className="block mb-2">Email não configurado no servidor.</span>
                    <a 
                      href={verificationUrl} 
                      className="text-blue-400 hover:text-blue-300 underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Clique aqui para verificar sua conta
                    </a>
                  </>
                ) : (
                  <>Verifique sua caixa de entrada em <span className="font-mono text-green-400">{email}</span></>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <motion.p 
          className="text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Redirecionando em 3 segundos...
        </motion.p>
        
        <motion.button
          onClick={onContinue}
          className="text-blue-400 hover:text-blue-300 text-sm underline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continuar agora
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Componente de input com validação visual
interface InputFieldProps {
  label: string;
  name: keyof RegisterInput;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  register: any;
  showPasswordToggle?: boolean;
  tooltip?: {
    title: string;
    content: string;
    icon: React.ReactNode;
  };
  isValid?: boolean;
  showValidation?: boolean;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  icon,
  error,
  value,
  onChange,
  onBlur,
  disabled,
  register,
  showPasswordToggle,
  tooltip,
  isValid,
  showValidation = true,
  autoComplete
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {tooltip ? (
        <SecurityInfoField
          fieldName={label}
          tooltipTitle={tooltip.title}
          tooltipContent={tooltip.content}
          icon={tooltip.icon}
        />
      ) : (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          {...register(name)}
          type={showPasswordToggle && showPassword ? 'text' : type}
          id={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.();
            register(name).onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-11' : ''} ${showPasswordToggle || (showValidation && (isValid || error)) ? 'pr-11' : ''}
            border rounded-lg transition-all duration-200
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
              isValid && showValidation ? 'border-green-300 focus:border-green-500 focus:ring-green-500' :
              isFocused ? 'border-blue-500 ring-2 ring-blue-100' :
              'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            disabled:bg-gray-50 disabled:cursor-not-allowed
            placeholder:text-gray-400
          `}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          )}
          
          {showValidation && !showPasswordToggle && (
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-red-500"
                >
                  <ExclamationCircleIcon className="w-4 h-4" />
                </motion.div>
              )}
              {isValid && !error && (
                <motion.div
                  key="success"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-green-500"
                >
                  <CheckIcon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <ExclamationCircleIcon className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const RegisterFormUX: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordRequirementsMet, setPasswordRequirementsMet] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  
  const router = useRouter();
  const { vibrate } = useMobileOptimizations();
  
  // Aplica solução definitiva de scroll para campos focados
  useFocusScroll();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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
  const email = watch('email');
  const name = watch('name');
  const whatsapp = watch('whatsapp');
  const confirmPassword = watch('confirmPassword');

  // Detecta se está em dispositivo móvel
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Removido a lógica de atualização do step que causava scroll
  // Agora usamos indicadores inline em cada campo

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      vibrate();

      const response = await fetch('/api/register-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorJson = JSON.parse(errorText);
          
          // Tratamento especial para email duplicado
          if (errorJson.code === 'USER_ALREADY_EXISTS' || errorJson.code === 'PHONE_ALREADY_EXISTS') {
            const isEmailError = errorJson.code === 'USER_ALREADY_EXISTS';
            setError(isEmailError ? 
              'Este email já está cadastrado. Faça login ou use outro email.' :
              'Este WhatsApp já está cadastrado. Use outro número.'
            );
          } else {
            const errorMessage = parseErrorMessage(errorJson);
            setError(errorMessage);
          }
        } catch {
          setError(errorMessages.server_error);
        }
        
        vibrate([100, 50, 100]); // Vibração de erro
        return;
      }

      const result = await response.json();

      // Se houver URL de verificação, salva no estado
      if (result.verificationUrl) {
        setVerificationUrl(result.verificationUrl);
      }

      setSuccess(true);
      vibrate([50, 100, 50, 100]); // Vibração de sucesso
      
      // Aguarda mais tempo se não há email configurado
      setTimeout(() => {
        if (!result.verificationUrl) {
          router.push('/verify?email=' + encodeURIComponent(data.email));
        }
      }, result.verificationUrl ? 10000 : 3000);
    } catch (error) {
      console.error('Erro ao registrar:', error);
      
      // Verifica se é erro de rede
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setError(errorMessages.network_error);
      } else {
        setError(errorMessages.server_error);
      }
      
      vibrate([100, 50, 100]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/verify?email=' + encodeURIComponent(email));
  };

  // Tela de sucesso
  if (success) {
    return <SuccessAnimation email={email} onContinue={handleContinue} verificationUrl={verificationUrl || undefined} />;
  }

  return (
    <>
      <div className="space-y-6 no-smooth-scroll">
        {/* Header simplificado sem StepIndicator que causa scroll */}
        <motion.div 
          className="text-center flex items-center justify-center space-x-2 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <SparklesIcon className="w-4 h-4 text-blue-400" />
          <span>Cadastro rápido e seguro</span>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Mensagens de feedback */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <Alert
                    variant="error"
                    title="Erro ao criar conta"
                    closable
                    onClose={() => setError(null)}
                    icon={<ExclamationCircleIcon className="w-6 h-6" />}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nome completo com ícone animado */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                  animate={{
                    scale: name && name.length >= 3 ? 1.1 : 1,
                    color: name && name.length >= 3 ? '#3B82F6' : '#9CA3AF'
                  }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <UserIcon className="w-5 h-5" />
                </motion.div>
                <Input
                  {...register('name')}
                  label="Nome completo"
                  placeholder="João Silva"
                  variant="glass"
                  theme="dark"
                  error={errors.name?.message}
                  disabled={isLoading}
                  animate="fadeIn"
                  className="pl-12"
                  aria-label="Digite seu nome completo"
                  autoComplete="name"
                />
                {/* Indicador de validação inline */}
                {name && name.length >= 3 && !errors.name && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Email com autocomplete e ícone animado */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute left-3 top-[38px] pointer-events-none z-10"
                  animate={{
                    scale: emailValid ? 1.1 : 1,
                    color: emailValid ? '#3B82F6' : '#9CA3AF'
                  }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                </motion.div>
                <EmailAutocomplete
                  value={watch('email')}
                  onChange={(value) => setValue('email', value)}
                  error={errors.email?.message}
                  disabled={isLoading}
                  theme="dark"
                  onValidate={setEmailValid}
                  required
                />
                {/* Indicador de validação inline */}
                {emailValid && !errors.email && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-[38px]"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* WhatsApp com ícone animado */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute left-3 top-[38px] pointer-events-none z-10"
                  animate={{
                    scale: whatsapp && !errors.whatsapp ? 1.1 : 1,
                    color: whatsapp && !errors.whatsapp ? '#3B82F6' : '#9CA3AF'
                  }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <PhoneIcon className="w-5 h-5" />
                </motion.div>
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
                {/* Indicador de validação inline */}
                {whatsapp && !errors.whatsapp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-[38px]"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Senha com indicador de força e ícone animado */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute left-3 top-[38px] pointer-events-none z-10"
                  animate={{
                    scale: passwordRequirementsMet ? 1.1 : 1,
                    color: passwordRequirementsMet ? '#3B82F6' : '#9CA3AF'
                  }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <LockClosedIcon className="w-5 h-5" />
                </motion.div>
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
              </div>
            </motion.div>

            {/* Confirmar senha com feedback visual */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
                  animate={{
                    color: confirmPassword === password && password ? '#10B981' : '#9CA3AF'
                  }}
                >
                  <LockClosedIcon className="w-5 h-5" />
                </motion.div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2.5 pl-12 pr-12 text-base
                    bg-gray-800 text-white placeholder-gray-400
                    border-2 rounded-lg outline-none transition-all duration-300
                    ${errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : confirmPassword === password && password
                      ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                  {confirmPassword === password && password && !errors.confirmPassword && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </div>
              {errors.confirmPassword && (
                <motion.p 
                  className="text-xs text-red-500 mt-1 flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ExclamationCircleIcon className="w-3 h-3" />
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </motion.div>

            {/* Checkbox de termos com design melhorado */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <label className="flex items-start cursor-pointer group">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  checked={acceptTerms}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2 bg-gray-800"
                  disabled={isLoading}
                  aria-describedby="terms-description"
                />
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
                <motion.p 
                  className="text-xs text-red-400 mt-2 ml-7 flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <InformationCircleIcon className="w-3 h-3" />
                  {errors.acceptTerms.message}
                </motion.p>
              )}
            </motion.div>

            {/* Botão de submit com loading state melhorado */}
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
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Criando sua conta...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Criar conta
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Indicadores de segurança com animação */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center space-x-4 text-xs text-gray-500"
            >
              <motion.div 
                className="flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                <span>SSL 256-bit</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <LockClosedIcon className="w-4 h-4 text-green-500" />
                <span>Dados protegidos</span>
              </motion.div>
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
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900">Termos de Uso</h4>
              <p className="text-sm text-blue-800">
                Ao usar nossa plataforma, você concorda em seguir nossas diretrizes de uso responsável e seguro.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-green-900">Política de Privacidade</h4>
              <p className="text-sm text-green-800">
                Seus dados são protegidos com criptografia de ponta e nunca serão compartilhados sem sua autorização.
              </p>
            </div>
            <motion.button
              onClick={() => {
                setValue('acceptTerms', true);
                setShowTermsSheet(false);
                vibrate();
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium shadow-lg"
              whileTap={{ scale: 0.98 }}
            >
              Aceitar e continuar
            </motion.button>
          </div>
        </BottomSheet>
      </>
  );
};