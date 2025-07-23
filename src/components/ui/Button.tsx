"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "metal";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button: React.FC<IButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  onClick,
  ...props
}) => {
  const baseStyles = [
    "relative inline-flex items-center justify-center",
    "font-bold tracking-wide uppercase",
    "transition-all duration-100 ease-in-out",
    "cursor-pointer select-none",
    "active:animate-button-press",
    "disabled:opacity-60 disabled:cursor-not-allowed",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "shine-effect",
  ];

  const variants = {
    primary: [
      "bg-button-primary-gradient",
      "text-white",
      "border-2 border-blue-900",
      "shadow-skeuo-button",
      "hover:shadow-skeuo-button-active hover:brightness-110",
      "active:shadow-skeuo-button-active",
      "focus-visible:ring-blue-500",
    ],
    secondary: [
      "bg-gradient-to-b from-green-500 to-green-700",
      "text-white",
      "border-2 border-green-800",
      "shadow-skeuo-button",
      "hover:shadow-skeuo-button-active hover:brightness-110",
      "active:shadow-skeuo-button-active",
      "focus-visible:ring-green-500",
    ],
    danger: [
      "bg-gradient-to-b from-red-500 to-red-700",
      "text-white",
      "border-2 border-red-800",
      "shadow-skeuo-button",
      "hover:shadow-skeuo-button-active hover:brightness-110",
      "active:shadow-skeuo-button-active",
      "focus-visible:ring-red-500",
    ],
    metal: [
      "bg-metal-gradient",
      "text-gray-700",
      "border border-gray-400",
      "shadow-skeuo-metal",
      "hover:brightness-105",
      "active:shadow-elevation-1",
      "focus-visible:ring-gray-500",
    ],
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl",
  };

  const iconStyles = "flex-shrink-0";
  const iconSpacing = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      // Adicionar efeito de clique
      const button = e.currentTarget;
      button.classList.add("animate-button-press");
      setTimeout(() => {
        button.classList.remove("animate-button-press");
      }, 100);
      onClick(e);
    }
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        iconSpacing[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* LED Indicator para metal variant */}
      {variant === "metal" && (
        <span
          className={cn(
            "absolute top-2 right-2 w-2 h-2 rounded-full",
            disabled
              ? "bg-red-500 shadow-red-500/50"
              : "bg-green-500 shadow-green-500/50 animate-led-pulse"
          )}
        />
      )}

      {/* Loading Spinner */}
      {loading && (
        <svg
          className={cn(
            "animate-spin h-5 w-5",
            iconPosition === "left" ? "mr-2" : "ml-2 order-2"
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
            iconStyles,
            iconPosition === "right" && "order-2"
          )}
        >
          {icon}
        </span>
      )}

      {/* Text */}
      <span className="relative z-10">{children}</span>

      {/* Text Shadow for depth */}
      <span
        className="absolute inset-0 flex items-center justify-center text-shadow"
        style={{
          textShadow: variant === "metal"
            ? "1px 1px 1px rgba(255,255,255,0.3), -1px -1px 1px rgba(0,0,0,0.3)"
            : "0 1px 2px rgba(0,0,0,0.3)",
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </button>
  );
};