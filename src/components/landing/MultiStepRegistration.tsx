"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProgressBar, CompletionCelebration } from "./ProgressBar";
import { CTAButton } from "./CTAButton";
import { cn } from "@/lib/utils/cn";

// Step schemas
const step1Schema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
});

const step2Schema = z.object({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

const step3Schema = z.object({
  cpf: z.string().optional(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos",
  }),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

interface IMultiStepRegistrationProps {
  onComplete: (data: Step1Data & Step2Data & Step3Data) => void;
  className?: string;
}

export const MultiStepRegistration: React.FC<IMultiStepRegistrationProps> = ({
  onComplete,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data & Step3Data>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [abandonmentTimer, setAbandonmentTimer] = useState<NodeJS.Timeout | null>(null);

  const steps = [
    {
      id: "account",
      label: "Conta",
      description: "Informações básicas",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "security",
      label: "Segurança",
      description: "Proteja sua conta",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: "verification",
      label: "Verificação",
      description: "Últimos detalhes",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  // Track form abandonment
  useEffect(() => {
    if (currentStep > 0 && currentStep < steps.length - 1) {
      // Clear existing timer
      if (abandonmentTimer) {
        clearTimeout(abandonmentTimer);
      }

      // Set new timer for 30 seconds of inactivity
      const timer = setTimeout(() => {
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "form_abandonment", {
            abandoned_step: currentStep,
            step_label: steps[currentStep].label,
          });
        }
      }, 30000);

      setAbandonmentTimer(timer);
    }

    return () => {
      if (abandonmentTimer) {
        clearTimeout(abandonmentTimer);
      }
    };
  }, [currentStep, steps]);

  // Track step progression
  const trackStepProgression = (from: number, to: number) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "registration_step", {
        from_step: from,
        to_step: to,
        direction: to > from ? "forward" : "backward",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      trackStepProgression(currentStep, currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      trackStepProgression(currentStep, currentStep - 1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (finalData: Step1Data & Step2Data & Step3Data) => {
    setShowCompletion(true);
    
    // Track completion
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "registration_complete", {
        total_time: Date.now(),
      });
    }

    setTimeout(() => {
      onComplete(finalData);
    }, 2000);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Progress Bar */}
      <ProgressBar
        steps={steps}
        currentStep={currentStep}
        variant="linear"
        showLabels={true}
        showNumbers={true}
        allowStepClick={true}
        onStepClick={(step) => {
          if (step < currentStep) {
            trackStepProgression(currentStep, step);
            setCurrentStep(step);
          }
        }}
        className="mb-8"
      />

      {/* Form Steps */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8">
        {currentStep === 0 && (
          <Step1
            data={formData}
            onNext={(data) => {
              setFormData({ ...formData, ...data });
              nextStep();
            }}
          />
        )}

        {currentStep === 1 && (
          <Step2
            data={formData}
            onNext={(data) => {
              setFormData({ ...formData, ...data });
              nextStep();
            }}
            onBack={prevStep}
          />
        )}

        {currentStep === 2 && (
          <Step3
            data={formData}
            onComplete={(data) => {
              const finalData = { ...formData, ...data } as Step1Data & Step2Data & Step3Data;
              handleComplete(finalData);
            }}
            onBack={prevStep}
          />
        )}
      </div>

      {/* Social proof */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Junte-se a <span className="font-semibold text-gray-700 dark:text-gray-300">+100.000</span> usuários que já negociam com segurança
        </p>
      </div>

      {/* Completion celebration */}
      {showCompletion && (
        <CompletionCelebration onClose={() => setShowCompletion(false)} />
      )}
    </div>
  );
};

// Step 1: Basic Information
const Step1: React.FC<{
  data: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
}> = ({ data, onNext }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: data,
    mode: "onChange",
  });

  const watchedFields = watch();

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Vamos começar!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Precisamos de algumas informações básicas
        </p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Como devemos chamar você?
        </label>
        <input
          {...register("name")}
          type="text"
          id="name"
          placeholder="João Silva"
          className={cn(
            "w-full px-4 py-3 rounded-lg border transition-all duration-200",
            "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            errors.name 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-300 dark:border-gray-600"
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Seu melhor email
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          placeholder="seu@email.com"
          className={cn(
            "w-full px-4 py-3 rounded-lg border transition-all duration-200",
            "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            errors.email 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-300 dark:border-gray-600"
          )}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Live validation feedback */}
      {watchedFields.email && !errors.email && (
        <div className="flex items-center gap-2 text-green-600 text-sm animate-fadeIn">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Email válido
        </div>
      )}

      <CTAButton
        text="Continuar"
        onClick={() => {}}
        variant="primary"
        type="submit"
        fullWidthMobile
        disabled={!isValid}
        className="mt-8"
      />
    </form>
  );
};

// Step 2: Security
const Step2: React.FC<{
  data: Partial<Step2Data>;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}> = ({ data, onNext, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: data,
    mode: "onChange",
  });

  const password = watch("password");

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Proteja sua conta
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Crie uma senha forte para manter sua conta segura
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Senha
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="••••••••"
            className={cn(
              "w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200",
              "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
              errors.password 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 dark:border-gray-600"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}

        {/* Password strength indicator */}
        {password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    i < passwordStrength
                      ? passwordStrength <= 2
                        ? "bg-red-500"
                        : passwordStrength <= 3
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>
            <p className={cn(
              "text-xs",
              passwordStrength <= 2 ? "text-red-600" :
              passwordStrength <= 3 ? "text-yellow-600" :
              "text-green-600"
            )}>
              {passwordStrength <= 2 ? "Senha fraca" :
               passwordStrength <= 3 ? "Senha média" :
               "Senha forte"}
            </p>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirmar senha
        </label>
        <input
          {...register("confirmPassword")}
          type={showPassword ? "text" : "password"}
          id="confirmPassword"
          placeholder="••••••••"
          className={cn(
            "w-full px-4 py-3 rounded-lg border transition-all duration-200",
            "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "dark:bg-gray-800 dark:border-gray-700 dark:text-white",
            errors.confirmPassword 
              ? "border-red-500 focus:ring-red-500" 
              : "border-gray-300 dark:border-gray-600"
          )}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Voltar
        </button>
        <CTAButton
          text="Continuar"
          onClick={() => {}}
          variant="primary"
          type="submit"
          disabled={!isValid}
          className="flex-1"
        />
      </div>
    </form>
  );
};

// Step 3: Verification
const Step3: React.FC<{
  data: Partial<Step3Data>;
  onComplete: (data: Step3Data) => void;
  onBack: () => void;
}> = ({ data, onComplete, onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: data,
  });

  const acceptTerms = watch("acceptTerms");

  // Format CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  // Format phone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  return (
    <form onSubmit={handleSubmit(onComplete)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Última etapa!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Informações opcionais para aumentar seus limites
        </p>
      </div>

      {/* Benefits of providing additional info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Vantagens de fornecer mais informações
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Limite inicial 5x maior (até R$ 50.000)
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Acesso a ofertas exclusivas
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Suporte prioritário 24/7
          </li>
        </ul>
      </div>

      <div>
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CPF (opcional)
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            Aumenta limite em 5x
          </span>
        </label>
        <input
          {...register("cpf")}
          type="text"
          id="cpf"
          placeholder="123.456.789-00"
          onChange={(e) => setValue("cpf", formatCPF(e.target.value))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Telefone (opcional)
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            Para recuperação de conta
          </span>
        </label>
        <input
          {...register("phone")}
          type="text"
          id="phone"
          placeholder="(11) 99999-9999"
          onChange={(e) => setValue("phone", formatPhone(e.target.value))}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register("acceptTerms")}
            type="checkbox"
            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <div className="flex-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Li e aceito os{" "}
              <a href="/terms" className="text-primary-600 hover:text-primary-700 underline" target="_blank">
                termos de uso
              </a>{" "}
              e a{" "}
              <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline" target="_blank">
                política de privacidade
              </a>
            </span>
          </div>
        </label>
        {errors.acceptTerms && (
          <p className="mt-2 text-sm text-red-600">{errors.acceptTerms.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Voltar
        </button>
        <CTAButton
          text="Finalizar Cadastro"
          onClick={() => {}}
          variant="value"
          type="submit"
          disabled={!acceptTerms}
          className="flex-1"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
      </div>
    </form>
  );
};