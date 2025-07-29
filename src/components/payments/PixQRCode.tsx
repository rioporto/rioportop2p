'use client';

import { useState, useEffect } from 'react';
import { Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';

interface PixQRCodeProps {
  tradeId: string;
  amount: number;
  onPaymentConfirmed?: () => void;
}

export function PixQRCode({ tradeId, amount, onPaymentConfirmed }: PixQRCodeProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeText: string;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Gerar QR Code
  useEffect(() => {
    generatePixQRCode();
  }, [tradeId]);

  // Verificar status periodicamente
  useEffect(() => {
    if (!pixData) return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(interval);
  }, [pixData]);

  const generatePixQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId })
      });

      const data = await response.json();
      console.log('Response data:', data); // Debug

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Erro ao gerar PIX');
      }

      // Verificar se temos os dados corretos
      if (!data.data?.pixTransaction) {
        console.error('Resposta inválida:', data);
        throw new Error('Resposta inválida do servidor');
      }

      setPixData(data.data.pixTransaction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (checkingStatus) return;

    try {
      setCheckingStatus(true);
      
      const response = await fetch(`/api/payments/pix?tradeId=${tradeId}`);
      const data = await response.json();

      if (data.pixTransaction?.status === 'APPROVED') {
        onPaymentConfirmed?.();
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyToClipboard = async () => {
    if (!pixData?.qrCodeText) return;

    try {
      await navigator.clipboard.writeText(pixData.qrCodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const getExpirationTime = () => {
    if (!pixData?.expiresAt) return '';
    
    const expires = new Date(pixData.expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const minutes = Math.floor(diff / 60000);
    return `Expira em ${minutes} minutos`;
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
          <p className="text-gray-600">Gerando QR Code PIX...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-600">{error}</p>
          <Button onClick={generatePixQRCode} variant="elevated">
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  if (!pixData) return null;

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-6">
        {/* Valor */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Valor a pagar</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(amount)}
          </p>
        </div>

        {/* QR Code */}
        <div className="relative">
          <img
            src={`data:image/png;base64,${pixData.qrCode}`}
            alt="QR Code PIX"
            className="w-64 h-64 rounded-lg"
          />
          {checkingStatus && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Verificando...</p>
              </div>
            </div>
          )}
        </div>

        {/* PIX Copia e Cola */}
        <div className="w-full max-w-md">
          <p className="text-sm text-gray-600 mb-2 text-center">PIX Copia e Cola</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={pixData.qrCodeText}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
            />
            <Button
              onClick={copyToClipboard}
              variant="elevated"
              size="sm"
              className="shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tempo de expiração */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{getExpirationTime()}</span>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 rounded-lg p-4 w-full max-w-md">
          <h4 className="font-semibold text-blue-900 mb-2">Como pagar:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Abra o app do seu banco</li>
            <li>2. Escolha pagar com PIX</li>
            <li>3. Escaneie o QR Code ou use o código copia e cola</li>
            <li>4. Confirme o pagamento</li>
          </ol>
        </div>

        {/* Status */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Após o pagamento, a confirmação é automática
          </p>
        </div>
      </div>
    </Card>
  );
}