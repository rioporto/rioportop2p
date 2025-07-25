"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface IQRCodeDisplayProps {
  qrCodeUrl: string;
  pixCode: string;
  expiresAt?: Date;
  onExpire?: () => void;
  className?: string;
}

export const QRCodeDisplay: React.FC<IQRCodeDisplayProps> = ({
  qrCodeUrl,
  pixCode,
  expiresAt,
  onExpire,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  // Timer de expiração
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expireTime = new Date(expiresAt).getTime();
      const difference = expireTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Expirado");
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  // Função para copiar código PIX
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      
      // Reset após 3 segundos
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error("Erro ao copiar código PIX:", err);
    }
  };

  return (
    <Card 
      variant="default" 
      className={cn("max-w-md mx-auto", className)}
      elevation={2}
    >
      <CardContent className="p-6">
        {/* Timer de expiração */}
        {expiresAt && (
          <div className="text-center mb-4">
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
              isExpired 
                ? "bg-red-100 text-red-700" 
                : "bg-blue-100 text-blue-700"
            )}>
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              {isExpired ? "Código expirado" : `Expira em: ${timeLeft}`}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className={cn(
          "relative bg-white p-4 rounded-lg border-2 border-gray-200 mb-6",
          isExpired && "opacity-50"
        )}>
          {isExpired && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
              <div className="text-center">
                <svg 
                  className="w-16 h-16 text-red-500 mx-auto mb-2" 
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
                <p className="text-red-600 font-medium">QR Code expirado</p>
              </div>
            </div>
          )}
          
          <img 
            src={qrCodeUrl} 
            alt="QR Code PIX" 
            className="w-full h-auto max-w-[256px] mx-auto"
          />
        </div>

        {/* Código PIX copia e cola */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Código PIX copia e cola:
          </label>
          
          <div className="relative">
            <div className={cn(
              "p-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg",
              "font-mono text-sm break-all select-all",
              isExpired && "opacity-50"
            )}>
              {pixCode}
            </div>
            
            <Button
              size="sm"
              variant="gradient"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleCopyCode}
              disabled={isExpired}
              icon={
                copied ? (
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                ) : (
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                    />
                  </svg>
                )
              }
            >
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>

          {/* Feedback visual de cópia */}
          {copied && (
            <div className="flex items-center text-sm text-green-600 animate-fade-in">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              Código copiado para a área de transferência!
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Como pagar:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Abra o app do seu banco</li>
            <li>2. Escolha pagar com PIX</li>
            <li>3. Escaneie o QR Code ou cole o código</li>
            <li>4. Confirme o pagamento</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};