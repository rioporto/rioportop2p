"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface ICardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bancario" | "metal" | "glass";
  elevation?: 1 | 2 | 3;
  noPadding?: boolean;
  interactive?: boolean;
  chip?: boolean;
  securityTexture?: boolean;
}

export const Card: React.FC<ICardProps> = ({
  children,
  className,
  variant = "default",
  elevation = 2,
  noPadding = false,
  interactive = false,
  chip = false,
  securityTexture = false,
  ...props
}) => {
  const baseStyles = [
    "relative overflow-hidden",
    "transition-all duration-300 ease-in-out",
  ];

  const variants = {
    default: [
      "bg-white",
      "border border-gray-200",
      "rounded-xl",
    ],
    bancario: [
      "bg-cofre-gradient",
      "text-white",
      "rounded-2xl",
      "min-h-[200px]",
    ],
    metal: [
      "bg-metal-gradient",
      "border border-prata-metal",
      "rounded-lg",
      "backdrop-blur-sm",
    ],
    glass: [
      "bg-white/10",
      "backdrop-blur-md",
      "border border-white/20",
      "rounded-xl",
    ],
  };

  const elevations = {
    1: "shadow-elevation-1",
    2: "shadow-elevation-2",
    3: "shadow-elevation-3",
  };

  const interactiveStyles = interactive
    ? [
        "cursor-pointer",
        "hover:shadow-skeuo-card",
        "hover:scale-[1.02]",
        "active:scale-[0.99]",
      ]
    : [];

  const paddingStyles = noPadding ? "" : "p-6";

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        elevations[elevation],
        interactiveStyles,
        paddingStyles,
        securityTexture && "texture-security",
        className
      )}
      {...props}
    >
      {/* Chip dourado para cards bancários */}
      {chip && variant === "bancario" && (
        <div className="absolute top-6 left-6">
          <div className="w-12 h-9 bg-chip-gradient rounded-md shadow-skeuo-coin">
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

      {/* Padrão de reflexo para cards metálicos */}
      {variant === "metal" && (
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            background: `linear-gradient(135deg, 
              transparent 0%, 
              rgba(255,255,255,0.1) 45%, 
              rgba(255,255,255,0.2) 50%, 
              rgba(255,255,255,0.1) 55%, 
              transparent 100%)`,
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

      {/* Gradiente de borda para glass */}
      {variant === "glass" && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `linear-gradient(
              to bottom right,
              rgba(255,255,255,0.2) 0%,
              transparent 50%,
              rgba(255,255,255,0.1) 100%
            )`,
          }}
        />
      )}
    </div>
  );
};

// Subcomponentes do Card
interface ICardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  separator?: boolean;
}

export const CardHeader: React.FC<ICardHeaderProps> = ({
  children,
  className,
  separator = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "mb-4",
        separator && "pb-4 border-b border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface ICardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CardTitle: React.FC<ICardTitleProps> = ({
  children,
  className,
  as: Component = "h3",
  ...props
}) => {
  return (
    <Component
      className={cn(
        "text-xl font-bold text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("text-text-secondary", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};