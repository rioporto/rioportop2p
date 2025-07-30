"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Trade {
  id: string;
  status: string;
  amount: string;
  totalPrice: string;
  listing: {
    cryptocurrency: string;
    pricePerUnit: string;
  };
  seller: {
    firstName: string;
    lastName: string;
    pixKeys?: Array<{
      id: string;
      pixKey: string;
      keyType: string;
      accountHolderName: string;
      bankName: string;
      isDefault: boolean;
    }>;
  };
  pixTransaction?: {
    id: string;
    qrCode: string;
    qrCodeImage: string;
    pixKey: string;
    amount: string;
    status: string;
  };
}

interface PaymentClientProps {
  tradeId: string;
  userId: string;
}

export function PaymentClient({ tradeId, userId }: PaymentClientProps) {
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    fetchTrade();
  }, []);

  const fetchTrade = async () => {
    try {
      const response = await fetch(`/api/transactions/${tradeId}`);
      if (!response.ok) throw new Error('Erro ao carregar transação');
      
      const data = await response.json();
      setTrade(data.data);
      
      // Se já tem PIX gerado, iniciar verificação de status
      if (data.data.pixTransaction) {
        startStatusPolling();
      }
    } catch (err) {
      setError('Erro ao carregar detalhes da transação');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePixPayment = async () => {
    setGeneratingQR(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${tradeId}/pix`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao gerar PIX');
      }

      const data = await response.json();
      
      // Atualizar trade com dados do PIX
      setTrade(prev => prev ? {
        ...prev,
        pixTransaction: data.data.pixTransaction
      } : null);
      
      // Iniciar polling de status
      startStatusPolling();
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar QR Code PIX');
    } finally {
      setGeneratingQR(false);
    }
  };

  const startStatusPolling = () => {
    const interval = setInterval(async () => {
      setCheckingStatus(true);
      try {
        const response = await fetch(`/api/transactions/${tradeId}/status`);
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.data.status === 'PAYMENT_CONFIRMED') {
          clearInterval(interval);
          // Redirecionar para página de sucesso ou atualizar UI
          router.push(`/trades/${tradeId}`);
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err);
      } finally {
        setCheckingStatus(false);
      }
    }, 5000); // Verificar a cada 5 segundos

    // Limpar interval quando componente desmontar
    return () => clearInterval(interval);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Poderia adicionar um toast de confirmação aqui
  };

  const confirmPayment = async () => {
    try {
      const response = await fetch(`/api/transactions/${tradeId}/confirm-payment`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao confirmar pagamento');
      
      setPaymentSent(true);
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(`/trades/${tradeId}`);
      }, 2000);
    } catch (err) {
      setError('Erro ao confirmar pagamento');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-12 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Transação não encontrada</h2>
          <Button onClick={() => router.push('/trades')} variant="elevated">
            Voltar para Transações
          </Button>
        </Card>
      </div>
    );
  }

  if (paymentSent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-12 text-center">
          <CheckCircleIcon className="w-20 h-20 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-4">Pagamento Enviado!</h2>
          <p className="text-muted-foreground mb-6">
            Aguardando confirmação do vendedor...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pagamento PIX</h1>
        <p className="text-muted-foreground">
          Complete o pagamento para receber suas criptomoedas
        </p>
      </div>

      {/* Resumo da Transação */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Resumo da Transação</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Criptomoeda:</span>
            <span className="font-medium">{trade.listing.cryptocurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantidade:</span>
            <span className="font-medium">{trade.amount} {trade.listing.cryptocurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preço unitário:</span>
            <span className="font-medium">R$ {parseFloat(trade.listing.pricePerUnit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total a pagar:</span>
              <span className="font-bold text-primary">R$ {parseFloat(trade.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Instruções ou QR Code */}
      {!trade.pixTransaction ? (
        <Card className="p-8 text-center">
          <QrCodeIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-4">Gerar QR Code PIX</h3>
          <p className="text-muted-foreground mb-6">
            Clique no botão abaixo para gerar o QR Code PIX para pagamento.
            O código será válido por 30 minutos.
          </p>
          <Button
            onClick={generatePixPayment}
            variant="gradient"
            gradient="primary"
            size="lg"
            disabled={generatingQR}
            className="gap-2"
          >
            {generatingQR ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Gerando...
              </>
            ) : (
              'Gerar QR Code PIX'
            )}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* QR Code */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-center">QR Code PIX</h3>
            
            <div className="max-w-sm mx-auto">
              {trade.pixTransaction.qrCodeImage ? (
                <div className="bg-white p-4 rounded-lg mb-4">
                  <Image
                    src={trade.pixTransaction.qrCodeImage}
                    alt="QR Code PIX"
                    width={300}
                    height={300}
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg mb-4 text-center">
                  <QrCodeIcon className="w-32 h-32 mx-auto text-gray-400" />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Código PIX (copiar e colar):</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={trade.pixTransaction.qrCode}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(trade.pixTransaction!.qrCode)}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      Copiar
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <Badge variant="warning" className="gap-1">
                    <ClockIcon className="w-3 h-3" />
                    Válido por 30 minutos
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Instruções */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-semibold mb-3">Como pagar:</h4>
            <ol className="space-y-2 text-sm">
              <li>1. Abra o app do seu banco ou carteira digital</li>
              <li>2. Escolha a opção "Pagar com PIX" ou "PIX"</li>
              <li>3. Escaneie o QR Code ou copie e cole o código</li>
              <li>4. Confirme o valor de <strong>R$ {parseFloat(trade.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></li>
              <li>5. Complete o pagamento</li>
              <li>6. Clique em "Já realizei o pagamento" abaixo</li>
            </ol>
          </Card>

          {/* Botão de confirmação */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/trades')}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmPayment}
              variant="gradient"
              gradient="success"
              className="flex-1"
            >
              Já realizei o pagamento
            </Button>
          </div>

          {/* Status de verificação */}
          {checkingStatus && (
            <div className="text-center text-sm text-muted-foreground">
              <ClockIcon className="w-4 h-4 inline mr-1 animate-pulse" />
              Verificando status do pagamento...
            </div>
          )}
        </div>
      )}

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mt-4">
          <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
          {error}
        </Card>
      )}
    </div>
  );
}