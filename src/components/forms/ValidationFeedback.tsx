'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';

interface ValidationFeedbackProps {
  isValid: boolean;
  isValidating: boolean;
  error: string | null;
  touched: boolean;
  showIcon?: boolean;
  showError?: boolean;
  className?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  isValid,
  isValidating,
  error,
  touched,
  showIcon = true,
  showError = true,
  className = '',
}) => {
  return (
    <>
      {/* Ícone de feedback */}
      {showIcon && touched && (
        <AnimatePresence mode="wait">
          {isValidating ? (
            <motion.div
              key="validating"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${className}`}
            >
              <FiLoader className="w-5 h-5 text-blue-400 animate-spin" />
            </motion.div>
          ) : isValid ? (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${className}`}
            >
              <div className="flex items-center justify-center w-5 h-5 bg-green-500/20 rounded-full">
                <FiCheck className="w-3 h-3 text-green-400" />
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${className}`}
            >
              <div className="flex items-center justify-center w-5 h-5 bg-red-500/20 rounded-full">
                <FiX className="w-3 h-3 text-red-400" />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}

      {/* Mensagem de erro */}
      {showError && (
        <AnimatePresence>
          {error && touched && !isValidating && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-red-400 mt-1 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

interface PasswordRequirementsProps {
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  show?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  requirements,
  show = true,
}) => {
  const requirementsList = [
    { key: 'minLength', label: 'Mínimo 8 caracteres', met: requirements.minLength },
    { key: 'hasUppercase', label: '1 letra maiúscula', met: requirements.hasUppercase },
    { key: 'hasNumber', label: '1 número', met: requirements.hasNumber },
    { key: 'hasSpecial', label: '1 caractere especial', met: requirements.hasSpecial },
  ];

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 space-y-1"
    >
      {requirementsList.map((req) => (
        <motion.div
          key={req.key}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-2 text-xs transition-colors ${
            req.met ? 'text-green-400' : 'text-gray-500'
          }`}
        >
          <AnimatePresence mode="wait">
            {req.met ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <FiCheck className="w-3 h-3" />
              </motion.div>
            ) : (
              <motion.div
                key="dot"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-3 h-3 flex items-center justify-center"
              >
                <div className="w-1 h-1 bg-current rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
          <span>{req.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

interface FieldHelpTextProps {
  text: string;
  show?: boolean;
  type?: 'info' | 'warning' | 'success';
}

export const FieldHelpText: React.FC<FieldHelpTextProps> = ({
  text,
  show = true,
  type = 'info',
}) => {
  if (!show) return null;

  const colors = {
    info: 'text-gray-400',
    warning: 'text-yellow-400',
    success: 'text-green-400',
  };

  return (
    <AnimatePresence>
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className={`text-xs mt-1 ${colors[type]}`}
      >
        {text}
      </motion.p>
    </AnimatePresence>
  );
};