"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

/**
 * Modal Component - Modal premium com múltiplas variantes e animações
 * Suporta diferentes tamanhos, posições e estilos visuais
 */
interface IModalProps {
  /** Estado de abertura */
  isOpen: boolean;
  /** Callback de fechamento */
  onClose: () => void;
  /** Título do modal */
  title?: string;
  /** Descrição/subtítulo */
  description?: string;
  /** Conteúdo do modal */
  children: React.ReactNode;
  /** Tamanho do modal */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  /** Variante visual */
  variant?: "flat" | "elevated" | "glass" | "gradient" | "neon" | "neumorphic";
  /** Posição do modal */
  position?: "center" | "top" | "bottom" | "left" | "right";
  /** Fecha ao clicar no backdrop */
  closeOnBackdrop?: boolean;
  /** Fecha ao pressionar ESC */
  closeOnEsc?: boolean;
  /** Mostra botão de fechar */
  showCloseButton?: boolean;
  /** Footer do modal */
  footer?: React.ReactNode;
  /** Anima entrada/saída */
  animate?: boolean;
  /** Tipo de animação */
  animationType?: "fade" | "scale" | "slide" | "rotate";
  /** Bloqueia scroll do body */
  blockScroll?: boolean;
  /** Classe CSS customizada */
  className?: string;
  /** Tema forçado */
  theme?: "light" | "dark";
  /** Ícone do header */
  icon?: React.ReactNode;
  /** Overlay customizado */
  customOverlay?: boolean;
  /** Callback após abrir */
  onAfterOpen?: () => void;
  /** Callback após fechar */
  onAfterClose?: () => void;
}

export const Modal: React.FC<IModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  variant = "elevated",
  position = "center",
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  animate = true,
  animationType = "scale",
  blockScroll = true,
  className,
  theme,
  icon,
  customOverlay = false,
  onAfterOpen,
  onAfterClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      previousActiveElement.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => {
        setIsAnimating(true);
        onAfterOpen?.();
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onAfterClose?.();
        // Restore focus
        if (previousActiveElement.current && previousActiveElement.current.focus) {
          previousActiveElement.current.focus();
        }
      }, animate ? 300 : 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, animate, onAfterOpen, onAfterClose]);

  // Handle ESC key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && closeOnEsc) {
      onClose();
    }
  }, [closeOnEsc, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      if (blockScroll) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (blockScroll) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, handleEscape, blockScroll]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    firstFocusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  const sizes = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  const positions = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-16",
    bottom: "items-end justify-center pb-16",
    left: "items-center justify-start pl-16",
    right: "items-center justify-end pr-16",
  };

  const variants = {
    flat: [
      theme === "dark" ? "bg-gray-800" : "bg-white",
      "shadow-xl",
    ],
    elevated: [
      theme === "dark" ? "bg-gray-800" : "bg-white",
      "shadow-skeuomorphic-floating",
    ],
    glass: [
      theme === "dark" ? "glass-dark" : "glass",
      "shadow-xl backdrop-blur-xl",
    ],
    gradient: [
      "gradient-primary text-white",
      "shadow-xl",
    ],
    neon: [
      "bg-gray-900 border-2 border-primary-500",
      "shadow-primary",
      "text-white",
    ],
    neumorphic: [
      theme === "dark" ? "bg-gray-800" : "bg-gray-100",
      "shadow-skeuomorphic-raised",
    ],
  };

  const animationClasses = {
    fade: {
      base: "transition-opacity duration-300",
      enter: isAnimating ? "opacity-100" : "opacity-0",
    },
    scale: {
      base: "transition-all duration-300",
      enter: isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95",
    },
    slide: {
      base: "transition-all duration-300",
      enter: isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    },
    rotate: {
      base: "transition-all duration-300",
      enter: isAnimating ? "opacity-100 rotate-0" : "opacity-0 rotate-3",
    },
  };

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex overflow-y-auto",
        positions[position],
        animate && animationClasses[animationType].base,
        animate && animationClasses[animationType].enter
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0",
          customOverlay 
            ? "bg-gradient-to-br from-black/60 via-black/50 to-black/60" 
            : "bg-black/50",
          animate && "transition-opacity duration-300",
          animate && (isAnimating ? "opacity-100" : "opacity-0")
        )}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full transform",
          sizes[size],
          "rounded-xl overflow-hidden",
          variants[variant],
          animate && animationClasses[animationType].base,
          animate && animationClasses[animationType].enter,
          className
        )}
      >
        {/* Special effects for certain variants */}
        {variant === "neon" && (
          <div
            className="absolute inset-0 -z-10 blur-xl opacity-50"
            style={{
              background: "var(--primary-gradient)",
            }}
          />
        )}

        {/* Modal Header */}
        {(title || description || showCloseButton || icon) && (
          <div className={cn(
            "px-6 py-4",
            "border-b",
            variant === "gradient" || variant === "neon" 
              ? "border-white/20" 
              : theme === "dark" 
              ? "border-gray-700" 
              : "border-gray-200"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {icon && (
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                    variant === "gradient" || variant === "neon"
                      ? "bg-white/20"
                      : theme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-100"
                  )}>
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <h2 
                      id="modal-title"
                      className={cn(
                        "text-xl font-bold",
                        variant === "gradient" || variant === "neon"
                          ? "text-white"
                          : theme === "dark"
                          ? "text-white"
                          : "text-gray-900"
                      )}
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p 
                      id="modal-description"
                      className={cn(
                        "mt-1 text-sm",
                        variant === "gradient" || variant === "neon"
                          ? "text-white/80"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    "ml-4 p-2 rounded-lg transition-all",
                    "hover:bg-black/10 dark:hover:bg-white/10",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                    variant === "neon" ? "focus:ring-offset-gray-900" : "focus:ring-offset-white",
                    "focus:ring-primary-500"
                  )}
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className={cn(
          "px-6 py-4",
          size === "full" && "min-h-[50vh]"
        )}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className={cn(
            "px-6 py-4",
            "border-t",
            variant === "gradient" || variant === "neon"
              ? "border-white/20"
              : theme === "dark"
              ? "border-gray-700"
              : "border-gray-200"
          )}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Portal to render modal at root level
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
};

/**
 * ModalFooter - Footer padronizado para modals
 */
interface IModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alinhamento dos botões */
  align?: "left" | "center" | "right" | "between";
}

export const ModalFooter: React.FC<IModalFooterProps> = ({
  children,
  className,
  align = "right",
  ...props
}) => {
  const alignStyles = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        alignStyles[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};