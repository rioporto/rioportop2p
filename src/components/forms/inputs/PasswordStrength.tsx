"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { FiEye, FiEyeOff, FiLock, FiCheck, FiX } from "react-icons/fi";

interface PasswordStrengthProps {
  /** Valor do campo */
  value?: string;
  /** Callback quando o valor muda */
  onChange?: (value: string) => void;
  /** Label do campo */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Mensagem de erro */
  error?: string;
  /** Campo obrigatório */
  required?: boolean;
  /** Desabilitado */
  disabled?: boolean;
  /** ID do campo */
  id?: string;
  /** Nome do campo */
  name?: string;
  /** Tamanho do input */
  size?: "sm" | "md" | "lg";
  /** Tema */
  theme?: "light" | "dark";
  /** Mostrar barra de força */
  showStrengthBar?: boolean;
  /** Mostrar requisitos */
  showRequirements?: boolean;
  /** Callback para quando todos requisitos são atendidos */
  onRequirementsMet?: (met: boolean) => void;
  /** Classe CSS adicional */
  className?: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  regex: RegExp;
  met: boolean;
}

const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  
  // Comprimento
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  
  // Letras maiúsculas
  if (/[A-Z]/.test(password)) strength += 20;
  
  // Letras minúsculas
  if (/[a-z]/.test(password)) strength += 20;
  
  // Números
  if (/[0-9]/.test(password)) strength += 20;
  
  // Caracteres especiais
  if (/[^A-Za-z0-9]/.test(password)) strength += 10;
  
  return Math.min(strength, 100);
};

const getStrengthColor = (strength: number) => {
  if (strength < 20) return "bg-red-500";
  if (strength < 40) return "bg-orange-500";
  if (strength < 60) return "bg-yellow-500";
  if (strength < 80) return "bg-lime-500";
  return "bg-green-500";
};

const getStrengthLabel = (strength: number) => {
  if (strength < 20) return "Muito fraca";
  if (strength < 40) return "Fraca";
  if (strength < 60) return "Razoável";
  if (strength < 80) return "Forte";
  return "Muito forte";
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  value = "",
  onChange,
  label = "Senha",
  placeholder = "Digite sua senha",
  error,
  required = false,
  disabled = false,
  id,
  name,
  size = "md",
  theme,
  showStrengthBar = true,
  showRequirements = true,
  onRequirementsMet,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { id: "length", label: "Mínimo 8 caracteres", regex: /.{8,}/, met: false },
    { id: "uppercase", label: "Uma letra maiúscula", regex: /[A-Z]/, met: false },
    { id: "lowercase", label: "Uma letra minúscula", regex: /[a-z]/, met: false },
    { id: "number", label: "Um número", regex: /[0-9]/, met: false },
    { id: "special", label: "Um caractere especial", regex: /[^A-Za-z0-9]/, met: false },
  ]);

  // Atualiza força e requisitos quando o valor muda
  useEffect(() => {
    const newStrength = calculatePasswordStrength(value);
    setStrength(newStrength);

    const newRequirements = requirements.map(req => ({
      ...req,
      met: req.regex.test(value),
    }));
    setRequirements(newRequirements);

    const allMet = newRequirements.every(req => req.met);
    onRequirementsMet?.(allMet);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const sizes = {
    sm: {
      input: "px-3 py-2 text-sm",
      icon: "w-4 h-4",
      bar: "h-1",
    },
    md: {
      input: "px-4 py-2.5 text-base",
      icon: "w-5 h-5",
      bar: "h-1.5",
    },
    lg: {
      input: "px-5 py-3 text-lg",
      icon: "w-6 h-6",
      bar: "h-2",
    },
  };

  const inputStyles = cn(
    "w-full transition-all duration-300",
    "outline-none rounded-lg",
    "border-2",
    sizes[size].input,
    "pl-12 pr-12", // Espaço para ícones
    disabled && "opacity-60 cursor-not-allowed",
    error
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : strength >= 80 && value
      ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
      : isFocused
      ? "border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      : theme === "dark"
      ? "border-gray-600 hover:border-gray-500"
      : "border-gray-300 hover:border-gray-400",
    theme === "dark"
      ? "bg-gray-800 text-white placeholder-gray-400"
      : "bg-white text-gray-900 placeholder-gray-500",
    className
  );

  const eyeAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { duration: 0.2 },
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "block text-sm font-medium mb-1",
            theme === "dark" ? "text-gray-200" : "text-gray-700",
            disabled && "opacity-60"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Ícone de cadeado */}
        <div
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10",
            error
              ? "text-red-500"
              : strength >= 80 && value
              ? "text-green-500"
              : isFocused
              ? "text-primary-500"
              : "text-gray-400"
          )}
        >
          <FiLock className={sizes[size].icon} />
        </div>

        {/* Input */}
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputStyles}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {/* Botão mostrar/esconder senha */}
        <button
          type="button"
          onClick={togglePassword}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 z-10",
            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded",
            "transition-all duration-200"
          )}
          tabIndex={-1}
          aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
        >
          <AnimatePresence mode="wait">
            {showPassword ? (
              <motion.div key="hide" {...eyeAnimation}>
                <FiEyeOff className={sizes[size].icon} />
              </motion.div>
            ) : (
              <motion.div key="show" {...eyeAnimation}>
                <FiEye className={sizes[size].icon} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Barra de força */}
      {showStrengthBar && value && (
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Força da senha
            </span>
            <span className={cn(
              "text-xs font-semibold",
              strength < 40 ? "text-red-500" : 
              strength < 60 ? "text-yellow-500" :
              strength < 80 ? "text-lime-500" : "text-green-500"
            )}>
              {getStrengthLabel(strength)}
            </span>
          </div>
          
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-colors duration-300",
                getStrengthColor(strength),
                sizes[size].bar
              )}
              initial={{ width: 0 }}
              animate={{ width: `${strength}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <div className={cn("w-full", sizes[size].bar)} />
          </div>
        </motion.div>
      )}

      {/* Lista de requisitos */}
      {showRequirements && isFocused && value && (
        <motion.div
          className="space-y-1 mt-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Requisitos da senha:
          </p>
          {requirements.map((req) => (
            <motion.div
              key={req.id}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <motion.div
                animate={{
                  scale: req.met ? [1, 1.2, 1] : 1,
                  rotate: req.met ? [0, 360] : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {req.met ? (
                  <FiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FiX className="w-4 h-4 text-gray-400" />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-xs transition-colors duration-200",
                  req.met
                    ? "text-green-600 dark:text-green-400 font-medium"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {req.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Mensagem de erro */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            className="text-xs text-red-500 mt-1 flex items-center gap-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Dica contextual */}
      {!error && !value && isFocused && (
        <motion.p
          className={cn(
            "text-xs mt-1",
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Use uma combinação de letras, números e símbolos para criar uma senha forte
        </motion.p>
      )}
    </div>
  );
};