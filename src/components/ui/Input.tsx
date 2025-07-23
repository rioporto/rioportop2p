"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Input Component - Campo de entrada premium com múltiplas variantes
 * Suporta validação, ícones, e estilos skeumórficos
 */
interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label do campo */
  label?: string;
  /** Mensagem de erro */
  error?: string;
  /** Dica/ajuda */
  hint?: string;
  /** Variante visual */
  variant?: "flat" | "elevated" | "glass" | "gradient" | "neon" | "neumorphic";
  /** Ícone do input */
  icon?: React.ReactNode;
  /** Posição do ícone */
  iconPosition?: "left" | "right";
  /** Sufixo (texto ou elemento) */
  suffix?: React.ReactNode;
  /** Prefixo (texto ou elemento) */
  prefix?: React.ReactNode;
  /** Callback para limpar campo */
  onClear?: () => void;
  /** Mostra contador de caracteres */
  showCounter?: boolean;
  /** Tamanho do input */
  inputSize?: "sm" | "md" | "lg";
  /** Estado de sucesso */
  success?: boolean;
  /** Mensagem de sucesso */
  successMessage?: string;
  /** Animação de entrada */
  animate?: "fadeIn" | "scaleUp" | "slideInRight" | "slideInLeft";
  /** Força tema */
  theme?: "light" | "dark";
}

export const Input = React.forwardRef<HTMLInputElement, IInputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      variant = "flat",
      icon,
      iconPosition = "left",
      suffix,
      prefix,
      onClear,
      disabled,
      type = "text",
      showCounter = false,
      maxLength,
      inputSize = "md",
      success = false,
      successMessage,
      animate,
      theme,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState("");

    // Use internal value if not controlled
    const currentValue = value !== undefined ? value : internalValue;
    const charCount = String(currentValue).length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const baseInputStyles = [
      "w-full transition-all",
      "outline-none",
      "disabled:opacity-60 disabled:cursor-not-allowed",
      // Acessibilidade
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      variant === "neon" ? "focus:ring-offset-gray-900" : "focus:ring-offset-white",
    ];

    const variants = {
      flat: [
        theme === "dark" ? "bg-gray-800" : "bg-white",
        "border-2",
        error ? "border-red-500" : success ? "border-green-500" : theme === "dark" ? "border-gray-600" : "border-gray-300",
        "rounded-lg",
        theme === "dark" ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500",
        "focus:border-primary-500 focus:ring-primary-500/20",
      ],
      elevated: [
        theme === "dark" ? "bg-gray-800" : "bg-white",
        "border-2",
        error ? "border-red-500" : success ? "border-green-500" : "border-transparent",
        "rounded-lg shadow-medium",
        theme === "dark" ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500",
        "focus:shadow-hard focus:border-primary-500 focus:ring-primary-500/20",
      ],
      glass: [
        theme === "dark" ? "glass-dark" : "glass",
        "border",
        error ? "border-red-500/50" : success ? "border-green-500/50" : "border-white/20",
        "rounded-lg shadow-soft",
        theme === "dark" ? "text-white placeholder-gray-300" : "text-gray-700 placeholder-gray-600",
        "focus:border-white/50 focus:ring-white/20",
      ],
      gradient: [
        "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700",
        "border-2",
        error ? "border-red-500" : success ? "border-green-500" : "border-transparent",
        "rounded-lg shadow-inner-soft",
        theme === "dark" ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500",
        "focus:from-white focus:to-gray-50 dark:focus:from-gray-700 dark:focus:to-gray-600",
        "focus:shadow-inner-medium focus:border-primary-500 focus:ring-primary-500/20",
      ],
      neon: [
        "bg-gray-900",
        "border-2",
        error ? "border-red-500" : success ? "border-green-500" : isFocused ? "border-primary-500" : "border-gray-700",
        "rounded-lg",
        "text-white placeholder-gray-500",
        isFocused && !error && !success && "shadow-primary animate-led-pulse",
        "focus:border-primary-500 focus:ring-primary-500/50",
      ],
      neumorphic: [
        theme === "dark" ? "bg-gray-800" : "bg-gray-100",
        "border-0",
        "rounded-lg",
        theme === "dark" ? "text-white placeholder-gray-400" : "text-gray-900 placeholder-gray-500",
        isFocused ? "shadow-skeuomorphic-pressed" : "shadow-skeuomorphic-raised",
        "focus:ring-2 focus:ring-primary-500/20",
      ],
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-5 py-3 text-lg",
    };

    const iconPadding = {
      sm: { left: "pl-9", right: "pr-9" },
      md: { left: "pl-11", right: "pr-11" },
      lg: { left: "pl-13", right: "pr-13" },
    };

    const wrapperStyles = [
      "relative",
      animate && `animate-${animate}`,
    ];

    const iconStyles = cn(
      "absolute top-1/2 -translate-y-1/2 pointer-events-none",
      error ? "text-red-500" : success ? "text-green-500" : "text-gray-400",
      iconPosition === "left" ? "left-3" : "right-3"
    );

    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      <div className="space-y-1">
        {/* Label */}
        {label && (
          <label 
            className={cn(
              "block text-sm font-medium mb-1",
              theme === "dark" ? "text-gray-200" : "text-gray-700",
              disabled && "opacity-60"
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className={cn(wrapperStyles)}>
          {/* Status indicator for neon variant */}
          {variant === "neon" && (
            <span
              className={cn(
                "absolute -top-1 -right-1 w-2 h-2 rounded-full z-10",
                error ? "bg-red-500" : success ? "bg-green-500" : isFocused ? "bg-primary-500" : "bg-gray-600",
                (isFocused || error || success) && "animate-led-pulse"
              )}
              style={{
                boxShadow: `0 0 8px currentColor`,
              }}
            />
          )}

          {/* Prefix */}
          {prefix && (
            <span className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            )}>
              {prefix}
            </span>
          )}

          {/* Icon */}
          {icon && iconPosition === "left" && (
            <span className={iconStyles}>{icon}</span>
          )}

          <input
            ref={ref}
            type={inputType}
            className={cn(
              baseInputStyles,
              variants[variant],
              sizes[inputSize],
              icon && iconPosition === "left" && iconPadding[inputSize].left,
              icon && iconPosition === "right" && iconPadding[inputSize].right,
              prefix && "pl-10",
              suffix && "pr-10",
              type === "password" && "pr-10",
              onClear && currentValue && "pr-10",
              className
            )}
            disabled={disabled}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
            }
            {...props}
          />

          {/* Icon right */}
          {icon && iconPosition === "right" && !suffix && !onClear && type !== "password" && (
            <span className={iconStyles}>{icon}</span>
          )}

          {/* Suffix */}
          {suffix && !onClear && type !== "password" && (
            <span className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            )}>
              {suffix}
            </span>
          )}

          {/* Password toggle */}
          {type === "password" && (
            <button
              type="button"
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded"
              )}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
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
          )}

          {/* Clear button */}
          {onClear && currentValue && !suffix && type !== "password" && (
            <button
              type="button"
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded",
                "transition-transform hover:scale-110"
              )}
              onClick={onClear}
              tabIndex={-1}
              aria-label="Clear input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Helper text area */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Hint text */}
            {hint && !error && !success && (
              <p id={`${props.id}-hint`} className={cn(
                "text-xs mt-1",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )}>
                {hint}
              </p>
            )}

            {/* Error message */}
            {error && (
              <p id={`${props.id}-error`} className="text-xs text-red-500 mt-1 animate-fadeIn flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}

            {/* Success message */}
            {success && successMessage && (
              <p className="text-xs text-green-500 mt-1 animate-fadeIn flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </p>
            )}
          </div>

          {/* Character counter */}
          {showCounter && maxLength && (
            <span className={cn(
              "text-xs ml-2",
              charCount > maxLength * 0.9 ? "text-orange-500" : theme === "dark" ? "text-gray-400" : "text-gray-500"
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * InputGroup - Container para agrupar inputs com addons
 */
interface IInputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientação do grupo */
  orientation?: "horizontal" | "vertical";
}

export const InputGroup = React.forwardRef<HTMLDivElement, IInputGroupProps>(
  ({ children, className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          orientation === "horizontal" && "[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none",
          orientation === "horizontal" && "[&>*:not(:first-child)]:-ml-px",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

InputGroup.displayName = "InputGroup";

/**
 * InputAddon - Addon para InputGroup
 */
interface IInputAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Posição do addon */
  position?: "left" | "right";
  /** Variante visual */
  variant?: "flat" | "elevated";
}

export const InputAddon = React.forwardRef<HTMLDivElement, IInputAddonProps>(
  ({ children, className, position = "left", variant = "flat", ...props }, ref) => {
    const variants = {
      flat: "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600",
      elevated: "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-2.5 flex items-center",
          variants[variant],
          position === "left" ? "rounded-l-lg border-r-0" : "rounded-r-lg border-l-0",
          "text-gray-600 dark:text-gray-400 text-sm font-medium",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

InputAddon.displayName = "InputAddon";