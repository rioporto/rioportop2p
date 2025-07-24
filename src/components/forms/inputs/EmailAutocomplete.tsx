"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { FiMail, FiCheck } from "react-icons/fi";

interface EmailAutocompleteProps {
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
  /** Domínios para sugestão */
  customDomains?: string[];
  /** Callback para validação */
  onValidate?: (isValid: boolean) => void;
  /** Classe CSS adicional */
  className?: string;
}

// Domínios populares no Brasil
const DEFAULT_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com.br",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
];

// Correções comuns de typos
const TYPO_CORRECTIONS: Record<string, string> = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "hotmai.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "iclou.com": "icloud.com",
  "icloud.co": "icloud.com",
};

export const EmailAutocomplete: React.FC<EmailAutocompleteProps> = ({
  value = "",
  onChange,
  label = "E-mail",
  placeholder = "seu@email.com",
  error,
  required = false,
  disabled = false,
  id,
  name,
  size = "md",
  theme,
  customDomains = [],
  onValidate,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [correctedEmail, setCorrectedEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const domains = [...DEFAULT_DOMAINS, ...customDomains];

  // Valida o e-mail
  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Detecta e corrige typos
  const detectTypo = useCallback((email: string) => {
    const [local, domain] = email.split("@");
    if (!domain) return null;

    // Verifica correções exatas
    if (TYPO_CORRECTIONS[domain]) {
      return `${local}@${TYPO_CORRECTIONS[domain]}`;
    }

    // Verifica similaridade com domínios conhecidos
    for (const correctDomain of domains) {
      if (domain.length > 0 && correctDomain.startsWith(domain)) {
        return `${local}@${correctDomain}`;
      }
    }

    return null;
  }, [domains]);

  // Gera sugestões baseadas no input
  const generateSuggestions = useCallback((email: string) => {
    const [local, partialDomain] = email.split("@");
    
    if (!local || email.indexOf("@") === -1) {
      return [];
    }

    if (!partialDomain) {
      // Se apenas @ foi digitado, mostra os domínios mais populares
      return domains.slice(0, 5).map(domain => `${local}@${domain}`);
    }

    // Filtra domínios que começam com o texto digitado
    const filteredDomains = domains
      .filter(domain => domain.toLowerCase().startsWith(partialDomain.toLowerCase()))
      .slice(0, 5)
      .map(domain => `${local}@${domain}`);

    return filteredDomains;
  }, [domains]);

  // Atualiza validação e sugestões quando o valor muda
  useEffect(() => {
    const valid = validateEmail(value);
    setIsValid(valid);
    onValidate?.(valid);

    // Detecta typos
    const correction = detectTypo(value);
    setCorrectedEmail(correction || "");

    // Gera sugestões
    if (value.includes("@") && !valid) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0 && isFocused);
    } else {
      setShowSuggestions(false);
    }
  }, [value, validateEmail, detectTypo, generateSuggestions, onValidate, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value.toLowerCase());
    setSelectedSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange?.(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestion]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const sizes = {
    sm: {
      input: "px-3 py-2 text-sm",
      icon: "w-4 h-4",
      suggestion: "px-3 py-1.5 text-sm",
    },
    md: {
      input: "px-4 py-2.5 text-base",
      icon: "w-5 h-5",
      suggestion: "px-4 py-2 text-base",
    },
    lg: {
      input: "px-5 py-3 text-lg",
      icon: "w-6 h-6",
      suggestion: "px-5 py-2.5 text-lg",
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

  const suggestionAnimation = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
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
        {/* Ícone de e-mail */}
        <div
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
        >
          <FiMail className={sizes[size].icon} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="email"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay para permitir clique nas sugestões
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={inputStyles}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />

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
              <FiCheck className="w-5 h-5 text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de sugestões */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              className={cn(
                "absolute top-full left-0 right-0 mt-1 z-50",
                "bg-white dark:bg-gray-800",
                "border-2 border-gray-200 dark:border-gray-700",
                "rounded-lg shadow-lg overflow-hidden"
              )}
              {...suggestionAnimation}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  className={cn(
                    "w-full text-left transition-colors duration-150",
                    sizes[size].suggestion,
                    selectedSuggestion === index
                      ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestion(index)}
                >
                  <span className="flex items-center gap-2">
                    <FiMail className="w-4 h-4 opacity-50" />
                    {suggestion}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Correção de typo */}
      <AnimatePresence>
        {correctedEmail && !showSuggestions && !isValid && (
          <motion.div
            className="flex items-center gap-2 mt-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Você quis dizer:
            </span>
            <button
              type="button"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
              onClick={() => onChange?.(correctedEmail)}
            >
              {correctedEmail}
            </button>
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
      {!error && !isValid && isFocused && !showSuggestions && (
        <motion.p
          className={cn(
            "text-xs mt-1",
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Digite @ para ver sugestões de domínios populares
        </motion.p>
      )}
    </div>
  );
};