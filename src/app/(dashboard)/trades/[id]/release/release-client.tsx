"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Trade {
  id: string;
  status: string;
  amount: string;
  totalPrice: string;
  listing: {
    cryptocurrency: string;
    pricePerUnit: string;
  };
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  pixTransactions?: Array<{
    id: string;
    status: string;
    paidAt?: string;
  }>;
  paymentConfirmedByBuyerAt?: string;
}

interface ReleaseClientProps {
  tradeId: string;
  userId: string;
}

export function ReleaseClient({ tradeId, userId }: ReleaseClientProps) {
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);

  useEffect(() => {
    fetchTrade();
  }, []);

  const fetchTrade = async () => {
    try {
      const response = await fetch(`/api/transactions/${tradeId}`);
      if (!response.ok) throw new Error('Erro ao carregar transação');
      
      const data = await response.json();
      setTrade(data.data);
      
      // Verificar se vendedor pode liberar
      if (data.data.sellerId !== userId) {
        setError('Você não tem permissão para liberar esta transação');
      }
    } catch (err) {
      setError('Erro ao carregar detalhes da transação');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const releaseCrypto = async () => {
    if (!confirm('Tem certeza que deseja liberar as criptomoedas? Esta ação não pode ser desfeita.')) {
      return;
    }

    setReleasing(true);
    setError(null);

    try {
      const response = await fetch(`/api/transactions/${tradeId}/release`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao liberar criptomoedas');
      }

      setReleased(true);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push(`/trades/${tradeId}`);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao liberar criptomoedas');
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trade || error === 'Você não tem permissão para liberar esta transação') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-12 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">
            {error || 'Transação não encontrada'}
          </h2>
          <Button onClick={() => router.push('/trades')} variant="elevated">
            Voltar para Transações
          </Button>
        </Card>
      </div>
    );
  }

  if (released) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-12 text-center">
          <CheckCircleIcon className="w-20 h-20 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-4">Criptomoedas Liberadas!</h2>
          <p className="text-muted-foreground mb-6">
            As criptomoedas foram liberadas com sucesso para o comprador.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecionando...
          </p>
        </Card>
      </div>
    );
  }

  const hasValidPayment = trade.pixTransactions?.some(
    pix => pix.status === 'PAID' || pix.status === 'CONFIRMED'
  ) || trade.paymentConfirmedByBuyerAt;

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
        <h1 className="text-3xl font-bold mb-2">Liberar Criptomoedas</h1>
        <p className="text-muted-foreground">
          Confirme o recebimento do pagamento antes de liberar
        </p>
      </div>

      {/* Resumo da Transação */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Detalhes da Transação</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Comprador:</span>
            <span className="font-medium">
              {trade.buyer.firstName} {trade.buyer.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Criptomoeda:</span>
            <span className="font-medium">{trade.listing.cryptocurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantidade:</span>
            <span className="font-medium">{trade.amount} {trade.listing.cryptocurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor Total:</span>
            <span className="font-medium">R$ {parseFloat(trade.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </Card>

      {/* Status do Pagamento */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Status do Pagamento</h2>
        
        {hasValidPayment ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium">Pagamento Confirmado</p>
                <p className="text-sm text-muted-foreground">
                  O comprador realizou o pagamento
                </p>
              </div>
            </div>
            
            {trade.pixTransactions?.[0]?.paidAt && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                <p className="text-green-800 dark:text-green-200">
                  Pagamento PIX confirmado em {new Date(trade.pixTransactions[0].paidAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="font-medium">Aguardando Confirmação</p>
              <p className="text-sm text-muted-foreground">
                Verifique se recebeu o pagamento antes de liberar
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Aviso de Segurança */}
      <Card className="p-6 mb-6 bg-amber-50 dark:bg-amber-900/20">
        <div className="flex gap-3">
          <LockClosedIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold mb-2">Importante:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Verifique em seu banco/app se o PIX foi recebido</li>
              <li>Confirme que o valor recebido é exatamente R$ {parseFloat(trade.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
              <li>Após liberar, a transação não pode ser revertida</li>
              <li>Em caso de dúvida, contate o suporte antes de liberar</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button
          onClick={() => router.push(`/trades/${tradeId}`)
        }
          variant="outline"
          className="flex-1"
        >
          Voltar aos Detalhes
        </Button>
        <Button
          onClick={releaseCrypto}
          variant="gradient"
          gradient="success"
          disabled={releasing || !hasValidPayment}
          className="flex-1 gap-2"
        >
          {releasing ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Liberando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Liberar Criptomoedas
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mt-4">
          <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
          {error}
        </Card>
      )}
    </div>
  );
}