"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Card Component - Componente base reutilizável com design premium
 * Suporta múltiplas variantes visuais e estados interativos
 */
interface ICardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante visual do card */
  variant?: "flat" | "elevated" | "glass" | "gradient" | "neon" | "metal" | "neumorphic";
  /** Tipo de gradiente para variante gradient */
  gradient?: "primary" | "secondary" | "success" | "warning" | "luxury" | "dark";
  /** Efeito de brilho/glow */
  glow?: boolean;
  /** Cor do glow */
  glowColor?: "primary" | "secondary" | "success" | "warning" | "danger";
  /** Card interativo com hover e active states */
  interactive?: boolean;
  /** Remove padding interno */
  noPadding?: boolean;
  /** Adiciona textura de segurança */
  securityTexture?: boolean;
  /** Adiciona chip dourado (para cards bancários) */
  chip?: boolean;
  /** Animação de entrada */
  animate?: "fadeIn" | "scaleUp" | "slideInRight" | "slideInLeft";
  /** Força tema claro ou escuro */
  theme?: "light" | "dark";
}

export const Card = React.forwardRef<HTMLDivElement, ICardProps>(
  (
    {
      children,
      className,
      variant = "flat",
      gradient = "primary",
      glow = false,
      glowColor = "primary",
      interactive = false,
      noPadding = false,
      securityTexture = false,
      chip = false,
      animate,
      theme,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      "relative overflow-hidden",
      "transition-all",
      "rounded-lg",
      // Acessibilidade
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-offset-2",
      variant === "neon" ? "focus:ring-offset-gray-900" : "focus:ring-offset-white",
    ];

    const variants = {
      flat: [
        theme === "dark" ? "bg-gray-800" : "bg-white",
        theme === "dark" ? "border-gray-700" : "border-gray-200",
        "border",
      ],
      elevated: [
        theme === "dark" ? "bg-gray-800" : "bg-white",
        "shadow-medium",
        interactive && "hover:shadow-hard",
      ],
      glass: [
        theme === "dark" ? "glass-dark" : "glass",
        "shadow-soft",
      ],
      gradient: [
        `gradient-${gradient}`,
        "text-white",
        "shadow-medium",
        "border-0",
      ],
      neon: [
        "bg-gray-900",
        "border-2",
        glow ? `border-${glowColor}-500` : "border-gray-700",
        glow && `shadow-${glowColor}`,
        "text-white",
      ],
      metal: [
        "metal-shine",
        "shadow-hard",
        "border border-gray-300",
      ],
      neumorphic: [
        theme === "dark" ? "neumorphic" : "bg-gray-100",
        "border-0",
      ],
    };

    // Estilos de foco baseados na variante
    const focusStyles = {
      flat: "focus:ring-gray-400",
      elevated: "focus:ring-primary-500",
      glass: "focus:ring-white/50",
      gradient: "focus:ring-white/50",
      neon: `focus:ring-${glowColor}-500`,
      metal: "focus:ring-gray-400",
      neumorphic: "focus:ring-gray-400",
    };

    const interactiveStyles = interactive
      ? [
          "cursor-pointer",
          "hover-lift",
          "hover-press",
          // Estados específicos por variante
          variant === "elevated" && "hover:shadow-xl",
          variant === "gradient" && "hover:shadow-lg hover:shadow-current/25",
          variant === "neon" && glow && "hover:shadow-2xl",
          variant === "neumorphic" && "hover:shadow-skeuomorphic-floating",
          // Active state
          "active:scale-[0.98]",
          variant === "neumorphic" && "active:shadow-skeuomorphic-pressed",
        ]
      : [];

    const paddingStyles = noPadding ? "" : "p-6";

    // Classes de animação
    const animationClasses = animate ? `animate-${animate}` : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          focusStyles[variant],
          interactiveStyles,
          paddingStyles,
          animationClasses,
          securityTexture && (theme === "dark" ? "texture-dots" : "texture-carbon"),
          className
        )}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.currentTarget.click();
                }
              }
            : undefined
        }
        {...props}
      >
        {/* Efeito de glow para variante neon */}
        {variant === "neon" && glow && (
          <div
            className="absolute inset-0 -z-10 blur-xl opacity-50"
            style={{
              background: `var(--${glowColor}-gradient)`,
            }}
          />
        )}

        {/* Chip dourado para cards bancários/gradient */}
        {chip && (variant === "gradient" || variant === "metal") && (
          <div className="absolute top-6 left-6">
            <div className="w-12 h-9 gradient-luxury rounded-md shadow-medium metal-shine">
            <div className="w-full h-full relative">
              {/* Detalhes do chip */}
              <div className="absolute inset-1 border border-yellow-600/30 rounded-sm" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="grid grid-cols-2 gap-px">
                  <div className="w-1 h-1 bg-yellow-600/50" />
                  <div className="w-1 h-1 bg-yellow-600/50" />
                  <div className="w-1 h-1 bg-yellow-600/50" />
                  <div className="w-1 h-1 bg-yellow-600/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Overlay especial para glass */}
        {variant === "glass" && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `linear-gradient(
                to bottom right,
                rgba(255,255,255,${theme === "dark" ? "0.05" : "0.1"}) 0%,
                transparent 50%,
                rgba(255,255,255,${theme === "dark" ? "0.02" : "0.05"}) 100%
              )`,
            }}
          />
        )}

      {/* Textura de segurança */}
      {securityTexture && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.03) 10px,
                rgba(255,255,255,0.03) 20px
              )`,
            }}
          />
        </div>
      )}

        {/* Conteúdo */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";

// Subcomponentes do Card
/**
 * CardHeader - Header section do Card com separador opcional
 */
interface ICardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mostra linha separadora */
  separator?: boolean;
  /** Variante do separador */
  separatorVariant?: "solid" | "gradient" | "dashed";
}

export const CardHeader = React.forwardRef<HTMLDivElement, ICardHeaderProps>(
  ({ children, className, separator = true, separatorVariant = "solid", ...props }, ref) => {
    const separatorStyles = {
      solid: "border-b border-gray-200 dark:border-gray-700",
      gradient: "border-b-2 border-gradient-to-r from-primary-500 via-secondary-500 to-transparent",
      dashed: "border-b border-dashed border-gray-300 dark:border-gray-600",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "mb-4",
          separator && "pb-4",
          separator && separatorStyles[separatorVariant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

/**
 * CardTitle - Título do Card com tamanhos responsivos
 */
interface ICardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Tag HTML do título */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Tamanho do texto */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Estilo do texto */
  variant?: "default" | "gradient" | "muted";
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, ICardTitleProps>(
  ({ children, className, as: Component = "h3", size = "lg", variant = "default", ...props }, ref) => {
    const sizeStyles = {
      sm: "text-base",
      md: "text-lg",
      lg: "text-xl",
      xl: "text-2xl",
      "2xl": "text-3xl",
    };

    const variantStyles = {
      default: "text-gray-900 dark:text-white",
      gradient: "bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500",
      muted: "text-gray-600 dark:text-gray-400",
    };

    return (
      <Component
        ref={ref as any}
        className={cn(
          "font-bold leading-tight",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = "CardTitle";

/**
 * CardContent - Área de conteúdo principal do Card
 */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-gray-600 dark:text-gray-300", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

/**
 * CardFooter - Footer section do Card com ações
 */
interface ICardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alinhamento dos itens */
  align?: "left" | "center" | "right" | "between";
  /** Remove separador superior */
  noSeparator?: boolean;
}

export const CardFooter = React.forwardRef<HTMLDivElement, ICardFooterProps>(
  ({ children, className, align = "right", noSeparator = false, ...props }, ref) => {
    const alignStyles = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
      between: "justify-between",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "mt-4 flex items-center gap-2",
          !noSeparator && "pt-4 border-t border-gray-200 dark:border-gray-700",
          alignStyles[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";