"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface IAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const Alert: React.FC<IAlertProps> = ({
  children,
  className,
  variant = "info",
  title,
  closable = false,
  onClose,
  icon,
  action,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const baseStyles = [
    "relative",
    "rounded-xl",
    "p-4",
    "transition-all duration-300",
    "animate-fadeIn",
    "overflow-hidden",
  ];

  const variants = {
    info: {
      container: [
        "bg-gradient-to-br from-blue-50 to-blue-100",
        "border-2 border-blue-200",
        "shadow-elevation-2",
      ],
      icon: "text-azul-info",
      title: "text-blue-900",
      content: "text-blue-800",
      closeButton: "text-blue-600 hover:text-blue-800 hover:bg-blue-200",
    },
    success: {
      container: [
        "bg-gradient-to-br from-green-50 to-green-100",
        "border-2 border-green-200",
        "shadow-elevation-2",
      ],
      icon: "text-verde-confirmacao",
      title: "text-green-900",
      content: "text-green-800",
      closeButton: "text-green-600 hover:text-green-800 hover:bg-green-200",
    },
    warning: {
      container: [
        "bg-gradient-to-br from-amber-50 to-amber-100",
        "border-2 border-amber-200",
        "shadow-elevation-2",
      ],
      icon: "text-amarelo-atencao",
      title: "text-amber-900",
      content: "text-amber-800",
      closeButton: "text-amber-600 hover:text-amber-800 hover:bg-amber-200",
    },
    error: {
      container: [
        "bg-gradient-to-br from-red-50 to-red-100",
        "border-2 border-red-200",
        "shadow-elevation-2",
      ],
      icon: "text-vermelho-alerta",
      title: "text-red-900",
      content: "text-red-800",
      closeButton: "text-red-600 hover:text-red-800 hover:bg-red-200",
    },
  };

  const defaultIcons = {
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const currentVariant = variants[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div
      className={cn(baseStyles, currentVariant.container, className)}
      role="alert"
      {...props}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 20px
          )`,
        }}
      />

      <div className="relative z-10 flex items-start gap-3">
        {/* Icon */}
        <div className={cn("flex-shrink-0 mt-0.5", currentVariant.icon)}>
          {displayIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn("font-semibold mb-1", currentVariant.title)}>
              {title}
            </h3>
          )}
          <div className={cn("text-sm", currentVariant.content)}>
            {children}
          </div>
          {action && <div className="mt-3">{action}</div>}
        </div>

        {/* Close button */}
        {closable && (
          <button
            onClick={handleClose}
            className={cn(
              "flex-shrink-0 p-1 rounded-lg transition-all",
              currentVariant.closeButton
            )}
            aria-label="Close alert"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 3D Border effect */}
      <div
        className="absolute inset-x-0 bottom-0 h-1"
        style={{
          background: `linear-gradient(to right, 
            rgba(0,0,0,0.1) 0%, 
            rgba(0,0,0,0.2) 50%, 
            rgba(0,0,0,0.1) 100%)`,
        }}
      />
    </div>
  );
};

// Toast Alert Component
interface IToastAlertProps extends IAlertProps {
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export const ToastAlert: React.FC<IToastAlertProps> = ({
  duration = 5000,
  position = "top-right",
  className,
  onClose,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const positions = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div className={cn("fixed z-50", positions[position], className)}>
      <Alert
        {...props}
        closable
        onClose={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className={cn("shadow-skeuo-card animate-slideInRight", className)}
      />
    </div>
  );
};