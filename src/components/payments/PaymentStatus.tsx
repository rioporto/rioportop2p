"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/Card";

export type PaymentStatusType = 
  | "pending" 
  | "processing" 
  | "approved" 
  | "rejected" 
  | "expired" 
  | "cancelled";

interface IPaymentStatusProps {
  status: PaymentStatusType;
  message?: string;
  amount?: string;
  className?: string;
  showConfetti?: boolean;
}

export const PaymentStatus: React.FC<IPaymentStatusProps> = ({
  status,
  message,
  amount,
  className,
  showConfetti = true,
}) => {
  const [showConfettiAnimation, setShowConfettiAnimation] = useState(false);

  // Configurações por status
  const statusConfig = {
    pending: {
      icon: (
        <svg 
          className="w-16 h-16" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      title: "Aguardando Pagamento",
      defaultMessage: "Estamos aguardando a confirmação do seu pagamento PIX",
      showLoader: true,
    },
    processing: {
      icon: (
        <div className="relative">
          <svg 
            className="w-16 h-16 animate-spin" 
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
        </div>
      ),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      title: "Processando Pagamento",
      defaultMessage: "Seu pagamento está sendo processado",
      showLoader: true,
    },
    approved: {
      icon: (
        <div className="relative">
          <svg 
            className="w-16 h-16 animate-bounce-in" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
      ),
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      title: "Pagamento Aprovado!",
      defaultMessage: "Seu pagamento foi confirmado com sucesso",
      showLoader: false,
    },
    rejected: {
      icon: (
        <svg 
          className="w-16 h-16" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ),
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      title: "Pagamento Recusado",
      defaultMessage: "Houve um problema com seu pagamento",
      showLoader: false,
    },
    expired: {
      icon: (
        <svg 
          className="w-16 h-16" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      ),
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      title: "Pagamento Expirado",
      defaultMessage: "O prazo para pagamento expirou",
      showLoader: false,
    },
    cancelled: {
      icon: (
        <svg 
          className="w-16 h-16" 
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
      ),
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      title: "Pagamento Cancelado",
      defaultMessage: "O pagamento foi cancelado",
      showLoader: false,
    },
  };

  const config = statusConfig[status];

  // Ativar confetti quando pagamento for aprovado
  useEffect(() => {
    if (status === "approved" && showConfetti) {
      setShowConfettiAnimation(true);
      
      // Remover confetti após animação
      const timer = setTimeout(() => {
        setShowConfettiAnimation(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status, showConfetti]);

  return (
    <>
      {/* Confetti Animation */}
      {showConfettiAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: [
                    "#f56565",
                    "#ed8936",
                    "#ecc94b",
                    "#48bb78",
                    "#4299e1",
                    "#667eea",
                    "#9f7aea",
                  ][Math.floor(Math.random() * 7)],
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Card 
        variant="default" 
        className={cn("max-w-md mx-auto", className)}
        elevation={2}
      >
        <CardContent className="p-8 text-center">
          {/* Ícone com animação */}
          <div className={cn("mb-6 flex justify-center", config.color)}>
            {config.icon}
          </div>

          {/* Título */}
          <h3 className={cn("text-2xl font-bold mb-2", config.color)}>
            {config.title}
          </h3>

          {/* Mensagem */}
          <p className="text-gray-600 mb-4">
            {message || config.defaultMessage}
          </p>

          {/* Valor (se houver) */}
          {amount && (
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full mb-6",
              config.bgColor,
              config.borderColor,
              "border"
            )}>
              <span className="text-sm font-medium text-gray-700">Valor:</span>
              <span className={cn("ml-2 text-lg font-bold", config.color)}>
                {amount}
              </span>
            </div>
          )}

          {/* Loading animation para status pendente/processando */}
          {config.showLoader && (
            <div className="mt-6">
              <div className="flex justify-center space-x-2">
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  config.bgColor.replace("50", "400")
                )} />
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse delay-150",
                  config.bgColor.replace("50", "400")
                )} />
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse delay-300",
                  config.bgColor.replace("50", "400")
                )} />
              </div>
            </div>
          )}

          {/* Status badges adicionais */}
          {status === "approved" && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
                  />
                </svg>
                Transação segura
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s ease-in-out;
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </>
  );
};