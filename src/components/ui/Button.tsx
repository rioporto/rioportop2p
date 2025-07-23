"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Button Component - Botão premium com múltiplas variantes e estados
 * Suporta temas skeumórficos, gradientes, e efeitos especiais
 */
interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: "flat" | "elevated" | "glass" | "gradient" | "neon" | "metal" | "ghost" | "link";
  /** Tipo de gradiente para variante gradient */
  gradient?: "primary" | "secondary" | "success" | "warning" | "luxury" | "dark";
  /** Tamanho do botão */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Largura total do container */
  fullWidth?: boolean;
  /** Estado de carregamento */
  loading?: boolean;
  /** Ícone do botão */
  icon?: React.ReactNode;
  /** Posição do ícone */
  iconPosition?: "left" | "right";
  /** Efeito de brilho/glow */
  glow?: boolean;
  /** Cor do glow */
  glowColor?: "primary" | "secondary" | "success" | "warning" | "danger";
  /** Adiciona efeito de pulse */
  pulse?: boolean;
  /** Formato do botão */
  shape?: "default" | "rounded" | "pill" | "square";
  /** Animação de entrada */
  animate?: "fadeIn" | "scaleUp" | "slideInRight" | "slideInLeft";
}

export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      children,
      className,
      variant = "flat",
      gradient = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      iconPosition = "left",
      glow = false,
      glowColor = "primary",
      pulse = false,
      shape = "default",
      animate,
      type = "button",
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      "relative inline-flex items-center justify-center",
      "font-medium transition-all",
      "select-none whitespace-nowrap",
      "disabled:opacity-60 disabled:cursor-not-allowed",
      // Acessibilidade
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      variant === "neon" ? "focus-visible:ring-offset-gray-900" : "focus-visible:ring-offset-white",
      // Animações
      animate && `animate-${animate}`,
      pulse && !disabled && "animate-led-pulse",
    ];

    const variants = {
      flat: [
        "bg-gray-100 dark:bg-gray-800",
        "text-gray-700 dark:text-gray-300",
        "hover:bg-gray-200 dark:hover:bg-gray-700",
        "active:bg-gray-300 dark:active:bg-gray-600",
        "focus-visible:ring-gray-400",
      ],
      elevated: [
        "bg-white dark:bg-gray-800",
        "text-gray-700 dark:text-gray-300",
        "shadow-medium hover:shadow-hard",
        "active:shadow-soft",
        "hover-lift hover-press",
        "focus-visible:ring-primary-500",
      ],
      glass: [
        "glass dark:glass-dark",
        "text-gray-700 dark:text-white",
        "shadow-soft",
        "hover:shadow-medium",
        "backdrop-blur-md",
        "focus-visible:ring-white/50",
      ],
      gradient: [
        `gradient-${gradient}`,
        "text-white",
        "shadow-medium",
        "hover:shadow-lg hover:shadow-current/25",
        "hover:brightness-110",
        "active:brightness-95",
        "focus-visible:ring-white/50",
      ],
      neon: [
        "bg-transparent",
        "border-2",
        glow ? `border-${glowColor}-500 text-${glowColor}-500` : "border-gray-600 text-gray-300",
        glow && `shadow-${glowColor}`,
        "hover:bg-gray-800/50",
        "active:bg-gray-700/50",
        `focus-visible:ring-${glowColor}-500`,
      ],
      metal: [
        "metal-shine",
        "text-gray-700",
        "border border-gray-400",
        "shadow-hard",
        "hover:brightness-105",
        "active:shadow-medium",
        "focus-visible:ring-gray-500",
      ],
      ghost: [
        "bg-transparent",
        "text-gray-700 dark:text-gray-300",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "active:bg-gray-200 dark:active:bg-gray-700",
        "focus-visible:ring-gray-400",
      ],
      link: [
        "bg-transparent",
        "text-primary-600 dark:text-primary-400",
        "hover:underline",
        "hover:text-primary-700 dark:hover:text-primary-300",
        "p-0 h-auto",
        "focus-visible:ring-primary-500",
      ],
    };

    const sizes = {
      xs: ["px-2.5 py-1.5 text-xs", "min-h-[28px]"],
      sm: ["px-3 py-2 text-sm", "min-h-[36px]"],
      md: ["px-4 py-2.5 text-base", "min-h-[44px]"],
      lg: ["px-6 py-3 text-lg", "min-h-[52px]"],
      xl: ["px-8 py-4 text-xl", "min-h-[60px]"],
    };

    const shapes = {
      default: "rounded-lg",
      rounded: "rounded-xl",
      pill: "rounded-full",
      square: "rounded-none",
    };

    const iconSpacing = {
      xs: "gap-1.5",
      sm: "gap-2",
      md: "gap-2.5",
      lg: "gap-3",
      xl: "gap-4",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onClick) {
        // Adicionar efeito de clique
        const button = e.currentTarget;
        button.classList.add("animate-button-press");
        
        // Criar ripple effect para algumas variantes
        if (variant === "elevated" || variant === "gradient") {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const ripple = document.createElement("span");
          ripple.className = "absolute bg-white/30 rounded-full animate-ping pointer-events-none";
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          ripple.style.width = "20px";
          ripple.style.height = "20px";
          ripple.style.transform = "translate(-50%, -50%)";
          
          button.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }
        
        setTimeout(() => {
          button.classList.remove("animate-button-press");
        }, 100);
        
        onClick(e);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== "link" && sizes[size],
          variant !== "link" && shapes[shape],
          iconSpacing[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {/* Efeito de glow para variante neon */}
        {variant === "neon" && glow && (
          <span
            className="absolute inset-0 -z-10 blur-lg opacity-50 rounded-lg"
            style={{
              background: `var(--${glowColor}-gradient)`,
            }}
          />
        )}

        {/* LED Indicator para metal variant */}
        {variant === "metal" && (
          <span
            className={cn(
              "absolute top-2 right-2 w-2 h-2 rounded-full",
              disabled
                ? "bg-red-500"
                : loading
                ? "bg-yellow-500 animate-led-pulse"
                : "bg-green-500",
              "shadow-sm"
            )}
            style={{
              boxShadow: `0 0 4px currentColor`,
            }}
          />
        )}

        {/* Loading Spinner */}
        {loading && (
          <svg
            className={cn(
              "animate-spin h-4 w-4",
              size === "xs" && "h-3 w-3",
              size === "xl" && "h-5 w-5",
              iconPosition === "left" ? "-ml-1" : "-mr-1 order-2"
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Icon */}
        {icon && !loading && (
          <span
            className={cn(
              "flex-shrink-0",
              iconPosition === "right" && "order-2"
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {/* Text Content */}
        <span className="relative">
          {children}
          
          {/* Text Shadow for depth (apenas para algumas variantes) */}
          {(variant === "metal" || variant === "gradient") && (
            <span
              className="absolute inset-0 select-none pointer-events-none"
              style={{
                textShadow: variant === "metal"
                  ? "1px 1px 1px rgba(255,255,255,0.3), -1px -1px 1px rgba(0,0,0,0.3)"
                  : "0 1px 2px rgba(0,0,0,0.3)",
              }}
              aria-hidden="true"
            >
              {children}
            </span>
          )}
        </span>

        {/* Shine effect overlay */}
        {(variant === "gradient" || variant === "metal") && (
          <span
            className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

/**
 * ButtonGroup - Container para agrupar botões
 */
interface IButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientação do grupo */
  orientation?: "horizontal" | "vertical";
  /** Espaçamento entre botões */
  spacing?: "none" | "sm" | "md" | "lg";
  /** Une os botões visualmente */
  attached?: boolean;
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, IButtonGroupProps>(
  ({ children, className, orientation = "horizontal", spacing = "md", attached = false, ...props }, ref) => {
    const spacingStyles = {
      none: "gap-0",
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-4",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          !attached && spacingStyles[spacing],
          attached && "divide-x divide-gray-300 dark:divide-gray-600",
          attached && "[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none",
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";