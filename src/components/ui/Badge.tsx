"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface IBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "metal";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  animated?: boolean;
  icon?: React.ReactNode;
  kycLevel?: 0 | 1 | 2 | 3;
}

export const Badge: React.FC<IBadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  dot = false,
  animated = false,
  icon,
  kycLevel,
  ...props
}) => {
  const baseStyles = [
    "inline-flex items-center justify-center",
    "font-semibold tracking-wide",
    "transition-all duration-200",
    "relative overflow-hidden",
  ];

  const variants = {
    default: [
      "bg-gray-100",
      "text-gray-700",
      "border border-gray-300",
      "shadow-elevation-1",
    ],
    primary: [
      "bg-gradient-to-b from-blue-500 to-blue-600",
      "text-white",
      "border border-blue-700",
      "shadow-elevation-1",
    ],
    secondary: [
      "bg-gradient-to-b from-gray-500 to-gray-600",
      "text-white",
      "border border-gray-700",
      "shadow-elevation-1",
    ],
    success: [
      "bg-gradient-to-b from-green-500 to-green-600",
      "text-white",
      "border border-green-700",
      "shadow-elevation-1",
    ],
    warning: [
      "bg-gradient-to-b from-amber-500 to-amber-600",
      "text-white",
      "border border-amber-700",
      "shadow-elevation-1",
    ],
    danger: [
      "bg-gradient-to-b from-red-500 to-red-600",
      "text-white",
      "border border-red-700",
      "shadow-elevation-1",
    ],
    metal: [
      "bg-metal-gradient",
      "text-gray-700",
      "border border-prata-metal",
      "shadow-skeuo-metal",
      "shine-effect",
    ],
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs rounded-md gap-1",
    md: "px-3 py-1 text-sm rounded-lg gap-1.5",
    lg: "px-4 py-1.5 text-base rounded-xl gap-2",
  };

  // KYC Level específico
  const getKYCVariant = () => {
    switch (kycLevel) {
      case 0:
        return {
          bg: "bg-gradient-to-b from-gray-400 to-gray-500",
          border: "border-gray-600",
          text: "text-white",
          icon: "🔓",
          label: "Acesso Básico",
        };
      case 1:
        return {
          bg: "bg-gradient-to-b from-bronze-400 to-bronze-600",
          border: "border-bronze-700",
          text: "text-white",
          icon: "🥉",
          label: "Bronze",
        };
      case 2:
        return {
          bg: "bg-gradient-to-b from-prata-metal to-gray-400",
          border: "border-gray-500",
          text: "text-gray-800",
          icon: "🥈",
          label: "Prata",
        };
      case 3:
        return {
          bg: "bg-gradient-to-b from-dourado-real to-yellow-600",
          border: "border-yellow-700",
          text: "text-gray-800",
          icon: "🥇",
          label: "Ouro",
        };
      default:
        return null;
    }
  };

  const kycConfig = kycLevel !== undefined ? getKYCVariant() : null;

  return (
    <span
      className={cn(
        baseStyles,
        kycConfig
          ? [kycConfig.bg, kycConfig.border, kycConfig.text, "shadow-elevation-2"]
          : variants[variant],
        sizes[size],
        animated && "animate-pulse",
        className
      )}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            animated && "animate-led-pulse",
            variant === "default" && "bg-gray-500",
            variant === "primary" && "bg-blue-300",
            variant === "secondary" && "bg-gray-300",
            variant === "success" && "bg-green-300",
            variant === "warning" && "bg-amber-300",
            variant === "danger" && "bg-red-300",
            variant === "metal" && "bg-prata-metal"
          )}
        />
      )}

      {/* Icon */}
      {(icon || kycConfig?.icon) && (
        <span className="flex-shrink-0">
          {kycConfig?.icon || icon}
        </span>
      )}

      {/* Content */}
      <span className="relative z-10">
        {kycConfig?.label || children}
      </span>

      {/* Gloss effect for metal variant */}
      {variant === "metal" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(255,255,255,0.4) 0%, 
              transparent 50%, 
              rgba(0,0,0,0.1) 100%)`,
          }}
        />
      )}

      {/* KYC Level stars effect */}
      {kycConfig && kycLevel === 3 && (
        <div className="absolute -inset-1 opacity-30">
          <div className="w-full h-full animate-shine">
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(105deg, 
                  transparent 40%, 
                  rgba(255,215,0,0.7) 50%, 
                  transparent 60%)`,
              }}
            />
          </div>
        </div>
      )}
    </span>
  );
};

// Badge Group Component
interface IBadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: "sm" | "md" | "lg";
}

export const BadgeGroup: React.FC<IBadgeGroupProps> = ({
  children,
  className,
  gap = "md",
  ...props
}) => {
  const gaps = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  };

  return (
    <div
      className={cn("inline-flex items-center flex-wrap", gaps[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
};