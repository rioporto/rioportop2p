'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { registerFormSchema } from '@/lib/validations/register';

interface ValidationState {
  isValid: boolean;
  isValidating: boolean;
  error: string | null;
  touched: boolean;
}

interface UseFormValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
}

export function useFormValidation(options: UseFormValidationOptions = {}) {
  const { debounceMs = 500, validateOnMount = false } = options;
  
  const [validationStates, setValidationStates] = useState<Record<string, ValidationState>>({
    name: { isValid: false, isValidating: false, error: null, touched: false },
    email: { isValid: false, isValidating: false, error: null, touched: false },
    whatsapp: { isValid: false, isValidating: false, error: null, touched: false },
    password: { isValid: false, isValidating: false, error: null, touched: false },
    confirmPassword: { isValid: false, isValidating: false, error: null, touched: false },
  });

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const validateCounters = useRef<Record<string, number>>({});

  // Função para validar um campo específico
  const validateField = useCallback(async (
    fieldName: keyof typeof registerFormSchema.shape,
    value: any,
    allValues?: Record<string, any>
  ): Promise<{ isValid: boolean; error: string | null }> => {
    try {
      // Para confirmPassword, precisamos validar com a senha original
      if (fieldName === 'confirmPassword' && allValues?.password) {
        const isValid = value === allValues.password;
        return {
          isValid,
          error: isValid ? null : 'As senhas não coincidem'
        };
      }

      // Validação individual do campo
      const fieldSchema = registerFormSchema.shape[fieldName];
      await fieldSchema.parseAsync(value);
      
      return { isValid: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0]?.message || 'Valor inválido' };
      }
      return { isValid: false, error: 'Erro na validação' };
    }
  }, []);

  // Função para validar campo com debounce
  const validateFieldWithDebounce = useCallback((
    fieldName: keyof typeof registerFormSchema.shape,
    value: any,
    allValues?: Record<string, any>
  ) => {
    // Incrementa o contador para esta validação
    const currentCount = (validateCounters.current[fieldName] || 0) + 1;
    validateCounters.current[fieldName] = currentCount;

    // Marca o campo como tocado
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], touched: true }
    }));

    // Cancela o timer anterior
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }

    // Se o campo estiver vazio, limpa a validação
    if (!value && fieldName !== 'confirmPassword') {
      setValidationStates(prev => ({
        ...prev,
        [fieldName]: { 
          isValid: false, 
          isValidating: false, 
          error: null, 
          touched: prev[fieldName].touched 
        }
      }));
      return;
    }

    // Inicia o estado de validação
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isValidating: true }
    }));

    // Configura o novo timer
    debounceTimers.current[fieldName] = setTimeout(async () => {
      const result = await validateField(fieldName, value, allValues);
      
      // Só atualiza se esta ainda for a validação mais recente
      if (validateCounters.current[fieldName] === currentCount) {
        setValidationStates(prev => ({
          ...prev,
          [fieldName]: {
            isValid: result.isValid,
            isValidating: false,
            error: result.error,
            touched: true
          }
        }));
      }
    }, debounceMs);
  }, [validateField, debounceMs]);

  // Função para validar instantaneamente (sem debounce)
  const validateFieldInstant = useCallback(async (
    fieldName: keyof typeof registerFormSchema.shape,
    value: any,
    allValues?: Record<string, any>
  ) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], isValidating: true, touched: true }
    }));

    const result = await validateField(fieldName, value, allValues);

    setValidationStates(prev => ({
      ...prev,
      [fieldName]: {
        isValid: result.isValid,
        isValidating: false,
        error: result.error,
        touched: true
      }
    }));

    return result;
  }, [validateField]);

  // Função para resetar validações
  const resetValidations = useCallback(() => {
    // Cancela todos os timers pendentes
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    debounceTimers.current = {};
    validateCounters.current = {};

    setValidationStates({
      name: { isValid: false, isValidating: false, error: null, touched: false },
      email: { isValid: false, isValidating: false, error: null, touched: false },
      whatsapp: { isValid: false, isValidating: false, error: null, touched: false },
      password: { isValid: false, isValidating: false, error: null, touched: false },
      confirmPassword: { isValid: false, isValidating: false, error: null, touched: false },
    });
  }, []);

  // Função para marcar campo como tocado
  const touchField = useCallback((fieldName: keyof typeof registerFormSchema.shape) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], touched: true }
    }));
  }, []);

  // Cleanup dos timers ao desmontar
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  return {
    validationStates,
    validateFieldWithDebounce,
    validateFieldInstant,
    resetValidations,
    touchField,
  };
}

// Hook para validação de requisitos de senha
export function usePasswordValidation(password: string) {
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    setRequirements({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const allRequirementsMet = Object.values(requirements).every(req => req);

  return { requirements, allRequirementsMet };
}