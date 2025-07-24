'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Check, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface WhatsAppInputCustomProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPreview?: boolean;
  name?: string;
  id?: string;
}

export const WhatsAppInputCustom: React.FC<WhatsAppInputCustomProps> = ({
  value = '',
  onChange,
  onBlur,
  error,
  placeholder = '(11) 99999-9999',
  label = 'WhatsApp',
  required = false,
  disabled = false,
  className,
  size = 'md',
  showPreview = true,
  name,
  id,
}) => {
  const [focused, setFocused] = useState(false);
  const [formattedValue, setFormattedValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para formatar o número
  const formatPhoneNumber = (input: string): string => {
    // Remove tudo que não é número
    const numbers = input.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const truncated = numbers.substring(0, 11);
    
    // Aplica a máscara
    if (truncated.length === 0) return '';
    if (truncated.length <= 2) return `(${truncated}`;
    if (truncated.length <= 6) return `(${truncated.substring(0, 2)}) ${truncated.substring(2)}`;
    if (truncated.length <= 10) return `(${truncated.substring(0, 2)}) ${truncated.substring(2, 6)}-${truncated.substring(6)}`;
    return `(${truncated.substring(0, 2)}) ${truncated.substring(2, 7)}-${truncated.substring(7)}`;
  };

  // Função para validar o número
  const validateNumber = (input: string): boolean => {
    const numbers = input.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    const ddd = parseInt(numbers.substring(0, 2));
    const ninthDigit = numbers[2];
    
    return ddd >= 11 && ddd <= 99 && ninthDigit === '9';
  };

  // Atualiza o valor formatado quando o value prop muda
  useEffect(() => {
    const formatted = formatPhoneNumber(value);
    setFormattedValue(formatted);
    setIsValid(validateNumber(formatted));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    
    // Permite apenas a entrada de números e caracteres da máscara
    if (input.length > formattedValue.length) {
      // Está digitando
      const lastChar = input[input.length - 1];
      if (!/\d/.test(lastChar) && lastChar !== '(' && lastChar !== ')' && lastChar !== ' ' && lastChar !== '-') {
        return;
      }
    }
    
    setFormattedValue(formatted);
    setIsValid(validateNumber(formatted));
    
    // Retorna apenas os números para o onChange
    const numbers = formatted.replace(/\D/g, '');
    onChange?.(numbers);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-5 py-3 text-lg',
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <motion.div
            animate={{
              scale: isValid ? [1, 1.2, 1] : 1,
              rotate: isValid ? [0, 10, -10, 0] : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <MessageCircle 
              size={iconSize[size]} 
              className={cn(
                'transition-colors duration-200',
                isValid ? 'text-green-400' : 'text-gray-500'
              )}
            />
          </motion.div>
        </div>
        
        <input
          ref={inputRef}
          type="tel"
          id={id}
          name={name}
          value={formattedValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full bg-gray-800/50 backdrop-blur-sm text-white rounded-lg',
            'border-2 transition-all duration-200',
            'pl-10 pr-10',
            sizeClasses[size],
            focused ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-700',
            error && 'border-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            'placeholder:text-gray-500',
            'focus:outline-none'
          )}
          inputMode="tel"
          autoComplete="tel"
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <AnimatePresence mode="wait">
            {formattedValue && (
              <motion.div
                key={isValid ? 'valid' : 'invalid'}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isValid ? (
                  <Check size={iconSize[size]} className="text-green-400" />
                ) : (
                  <X size={iconSize[size]} className="text-red-400" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <AnimatePresence>
        {showPreview && isValid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-green-400 flex items-center gap-2"
          >
            <Phone size={14} />
            <span>+55 {formattedValue}</span>
          </motion.div>
        )}
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};