"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: "default" | "cofre" | "money";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  suffix?: React.ReactNode;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, IInputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      variant = "default",
      icon,
      iconPosition = "left",
      suffix,
      onClear,
      disabled,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const baseInputStyles = [
      "w-full",
      "transition-all duration-200",
      "outline-none",
      "disabled:opacity-60 disabled:cursor-not-allowed",
    ];

    const variants = {
      default: [
        "bg-white",
        "border-2 border-gray-300",
        "rounded-lg",
        "px-4 py-3",
        "text-text-primary",
        "placeholder-text-secondary/50",
        "shadow-elevation-1",
        "focus:border-azul-bancario",
        "focus:shadow-elevation-2",
        error ? "border-vermelho-alerta" : "",
      ],
      cofre: [
        "bg-gray-900",
        "border-3 border-prata-metal",
        "rounded-lg",
        "px-5 py-4",
        "font-money text-lg",
        "text-green-400",
        "placeholder-green-600/50",
        "shadow-skeuo-input",
        "focus:border-dourado-real",
        "focus:text-green-300",
        error ? "border-vermelho-alerta text-red-400" : "",
      ],
      money: [
        "bg-gray-50",
        "border-2 border-verde-cedula",
        "rounded-lg",
        "px-4 py-3",
        "font-money text-lg",
        "text-verde-cedula",
        "placeholder-gray-400",
        "shadow-elevation-1",
        "focus:border-dourado-real",
        "focus:shadow-elevation-2",
        "focus:bg-white",
        error ? "border-vermelho-alerta text-vermelho-alerta" : "",
      ],
    };

    const wrapperStyles = [
      "relative",
      "transition-all duration-200",
    ];

    const iconStyles = cn(
      "absolute top-1/2 -translate-y-1/2",
      "text-gray-400",
      "pointer-events-none",
      iconPosition === "left" ? "left-3" : "right-3"
    );

    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1">
            {label}
          </label>
        )}

        <div className={cn(wrapperStyles, variant === "cofre" && "relative")}>
          {/* LED Indicator para variant cofre */}
          {variant === "cofre" && (
            <span
              className={cn(
                "absolute top-2 right-2 w-2 h-2 rounded-full transition-all duration-300 z-10",
                isFocused
                  ? "bg-green-500 shadow-green-500/50 animate-led-pulse"
                  : "bg-red-500 shadow-red-500/50",
                error && "bg-red-500 shadow-red-500/50 animate-led-pulse"
              )}
            />
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
              icon && iconPosition === "left" && "pl-12",
              icon && iconPosition === "right" && "pr-12",
              suffix && "pr-12",
              type === "password" && "pr-12",
              onClear && props.value && "pr-12",
              className
            )}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Icon direita */}
          {icon && iconPosition === "right" && !suffix && (
            <span className={iconStyles}>{icon}</span>
          )}

          {/* Suffix */}
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {suffix}
            </span>
          )}

          {/* Password toggle */}
          {type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
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
          {onClear && props.value && !suffix && type !== "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={onClear}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Hint text */}
        {hint && !error && (
          <p className="text-xs text-text-secondary mt-1">{hint}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-xs text-vermelho-alerta mt-1 animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";