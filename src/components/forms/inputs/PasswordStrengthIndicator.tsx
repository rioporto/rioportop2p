"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface PasswordStrengthIndicatorProps {
  /** Senha para calcular a força */
  password: string;
  /** Tamanho da barra */
  size?: "sm" | "md" | "lg";
  /** Mostrar label de força */
  showLabel?: boolean;
  /** Mostrar porcentagem */
  showPercentage?: boolean;
  /** Tema */
  theme?: "light" | "dark";
  /** Classe CSS adicional */
  className?: string;
}

export const calculatePasswordStrength = (password: string): number => {
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

export const getStrengthColor = (strength: number) => {
  if (strength < 20) return "bg-red-500";
  if (strength < 40) return "bg-orange-500";
  if (strength < 60) return "bg-yellow-500";
  if (strength < 80) return "bg-lime-500";
  return "bg-green-500";
};

export const getStrengthTextColor = (strength: number) => {
  if (strength < 20) return "text-red-500";
  if (strength < 40) return "text-orange-500";
  if (strength < 60) return "text-yellow-500";
  if (strength < 80) return "text-lime-500";
  return "text-green-500";
};

export const getStrengthLabel = (strength: number) => {
  if (strength < 20) return "Muito fraca";
  if (strength < 40) return "Fraca";
  if (strength < 60) return "Razoável";
  if (strength < 80) return "Forte";
  return "Muito forte";
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = "",
  size = "md",
  showLabel = true,
  showPercentage = false,
  theme = "light",
  className,
}) => {
  const strength = calculatePasswordStrength(password);
  
  const sizes = {
    sm: {
      bar: "h-1",
      text: "text-xs",
    },
    md: {
      bar: "h-1.5",
      text: "text-sm",
    },
    lg: {
      bar: "h-2",
      text: "text-base",
    },
  };

  if (!password) return null;

  return (
    <motion.div
      className={cn("space-y-1", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center">
          {showLabel && (
            <span className={cn(
              sizes[size].text,
              "font-medium",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              Força da senha
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className={cn(
              sizes[size].text,
              "font-semibold",
              getStrengthTextColor(strength)
            )}>
              {getStrengthLabel(strength)}
            </span>
            {showPercentage && (
              <span className={cn(
                sizes[size].text,
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              )}>
                {strength}%
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className={cn(
        "relative w-full rounded-full overflow-hidden",
        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
      )}>
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
  );
};