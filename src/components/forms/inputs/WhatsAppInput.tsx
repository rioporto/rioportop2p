"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputMask from "react-input-mask";
import { cn } from "@/lib/utils/cn";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppInputProps {
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
  /** Callback para validação em tempo real */
  onValidate?: (isValid: boolean) => void;
  /** Classe CSS adicional */
  className?: string;
}

export const WhatsAppInput: React.FC<WhatsAppInputProps> = ({
  value = "",
  onChange,
  label = "WhatsApp",
  placeholder = "(11) 99999-9999",
  error,
  required = false,
  disabled = false,
  id,
  name,
  size = "md",
  theme,
  onValidate,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [animateIcon, setAnimateIcon] = useState(false);

  // Valida o número de WhatsApp
  const validateWhatsApp = useCallback((phone: string) => {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, "");
    
    // Verifica se tem 11 dígitos (com DDD)
    if (cleanPhone.length !== 11) return false;
    
    // Verifica se o DDD é válido (11-99)
    const ddd = parseInt(cleanPhone.substring(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    
    // Verifica se o nono dígito é 9
    if (cleanPhone[2] !== "9") return false;
    
    return true;
  }, []);

  // Atualiza validação quando o valor muda
  useEffect(() => {
    const valid = validateWhatsApp(value);
    setIsValid(valid);
    onValidate?.(valid);
    
    // Anima o ícone quando o número fica válido
    if (valid && !isValid) {
      setAnimateIcon(true);
      setTimeout(() => setAnimateIcon(false), 600);
    }
  }, [value, validateWhatsApp, onValidate, isValid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const sizes = {
    sm: {
      input: "px-3 py-2 text-sm",
      icon: "w-4 h-4",
      preview: "text-xs",
    },
    md: {
      input: "px-4 py-2.5 text-base",
      icon: "w-5 h-5",
      preview: "text-sm",
    },
    lg: {
      input: "px-5 py-3 text-lg",
      icon: "w-6 h-6",
      preview: "text-base",
    },
  };

  const inputStyles = cn(
    "w-full transition-all duration-300",
    "outline-none rounded-lg",
    "border-2",
    sizes[size].input,
    "pl-12", // Espaço para o ícone
    disabled && "opacity-60 cursor-not-allowed",
    error
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : isValid
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

  const iconAnimation = {
    initial: { scale: 1, rotate: 0 },
    animate: animateIcon
      ? {
          scale: [1, 1.2, 1],
          rotate: [0, -10, 10, -10, 0],
        }
      : {},
    transition: { duration: 0.6, ease: "easeInOut" },
  };

  const previewAnimation = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
  };

  const formatPreview = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 11) return "";
    
    return `+55 ${clean}`;
  };

  return (
    <div className="space-y-1">
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
        {/* Ícone do WhatsApp */}
        <motion.div
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10",
            error
              ? "text-red-500"
              : isValid
              ? "text-green-500"
              : isFocused
              ? "text-primary-500"
              : "text-gray-400"
          )}
          {...iconAnimation}
        >
          <FaWhatsapp className={sizes[size].icon} />
        </motion.div>

        {/* Input com máscara */}
        <InputMask
          mask="(99) 99999-9999"
          value={value}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            setShowPreview(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setShowPreview(false);
          }}
          disabled={disabled}
        >
          {(inputProps: any) => (
            <input
              {...inputProps}
              id={id}
              name={name}
              type="tel"
              placeholder={placeholder}
              className={inputStyles}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
          )}
        </InputMask>

        {/* Indicador de validação */}
        <AnimatePresence>
          {isValid && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
            >
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview do número formatado */}
      <AnimatePresence>
        {showPreview && isValid && (
          <motion.div
            className={cn(
              "flex items-center gap-2 mt-2",
              sizes[size].preview,
              "text-green-600 dark:text-green-400"
            )}
            {...previewAnimation}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">
              Número internacional: {formatPreview(value)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Dica para o usuário */}
      {!error && !isValid && isFocused && (
        <motion.p
          className={cn(
            "text-xs mt-1",
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Digite seu WhatsApp com DDD (11 dígitos)
        </motion.p>
      )}
    </div>
  );
};