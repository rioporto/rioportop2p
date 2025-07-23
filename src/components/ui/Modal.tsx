"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  variant?: "default" | "cofre";
}

export const Modal: React.FC<IModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
  variant = "default",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const variants = {
    default: [
      "bg-white",
      "rounded-xl",
      "shadow-skeuo-card",
    ],
    cofre: [
      "bg-cofre-gradient",
      "rounded-2xl",
      "shadow-skeuo-card",
      "text-white",
      "border-4 border-prata-metal",
      "relative overflow-hidden",
    ],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Backdrop com blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full transform transition-all duration-300",
          "animate-scaleUp",
          sizes[size],
          variants[variant]
        )}
      >
        {/* Textura de segurança para variant cofre */}
        {variant === "cofre" && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="w-full h-full opacity-20"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.1) 10px,
                  rgba(255,255,255,0.1) 20px
                )`,
              }}
            />
          </div>
        )}

        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-2xl font-bold font-display tracking-wide">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  "hover:bg-gray-100 active:bg-gray-200",
                  variant === "cofre" && "hover:bg-white/10 active:bg-white/20"
                )}
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
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
        )}

        {/* Modal Content */}
        <div className="p-6 relative z-10">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            {footer}
          </div>
        )}

        {/* Decoração de cofre */}
        {variant === "cofre" && (
          <>
            {/* Maçaneta do cofre */}
            <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
              <div className="w-12 h-24 bg-prata-metal rounded-r-lg shadow-skeuo-metal flex items-center justify-center">
                <div className="w-8 h-8 bg-cinza-seguro rounded-full shadow-inner animate-cofre-unlock" />
              </div>
            </div>
            
            {/* Dobradiças */}
            <div className="absolute top-4 -left-2 w-4 h-8 bg-prata-metal rounded-l shadow-skeuo-metal" />
            <div className="absolute bottom-4 -left-2 w-4 h-8 bg-prata-metal rounded-l shadow-skeuo-metal" />
          </>
        )}
      </div>
    </div>
  );
};

// Componente de exemplo de uso do Modal
export const ModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmação de Transação"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Tem certeza que deseja prosseguir com esta transação?
        </p>
      </Modal>
    </>
  );
};