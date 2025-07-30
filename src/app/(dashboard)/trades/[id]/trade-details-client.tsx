"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Trade {
  id: string;
  status: string;
  amount: string;
  pricePerUnit: string;
  totalPrice: string;
  createdAt: string;
  completedAt?: string;
  listing: {
    cryptocurrency: string;
    fiatCurrency: string;
    type: 'BUY' | 'SELL';
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  paymentMethod?: {
    displayName: string;
    paymentType: string;
  };
}

interface TradeDetailsClientProps {
  tradeId: string;
  userId: string;
}

export function TradeDetailsClient({ tradeId, userId }: TradeDetailsClientProps) {
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrade();
  }, []);

  const fetchTrade = async () => {
    try {
      const response = await fetch(`/api/transactions/${tradeId}`);
      if (!response.ok) throw new Error('Erro ao carregar transação');
      
      const data = await response.json();
      setTrade(data.data);
    } catch (err) {
      setError('Erro ao carregar detalhes da transação');
      console.error(err);
    } finally {
      setLoading(false);
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

  const isBuyer = trade.buyer.id === userId;
  const counterparty = isBuyer ? trade.seller : trade.buyer;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: 'warning', label: 'Pendente' },
      AWAITING_PAYMENT: { variant: 'warning', label: 'Aguardando Pagamento' },
      PAYMENT_CONFIRMED: { variant: 'primary', label: 'Pagamento Confirmado' },
      RELEASING_CRYPTO: { variant: 'primary', label: 'Liberando Crypto' },
      COMPLETED: { variant: 'success', label: 'Concluída' },
      CANCELLED: { variant: 'danger', label: 'Cancelada' },
      DISPUTED: { variant: 'danger', label: 'Em Disputa' },
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant} size="lg">{config.label}</Badge>;
  };

  const getActionButtons = () => {
    switch (trade.status) {
      case 'AWAITING_PAYMENT':
        if (isBuyer) {
          return (
            <Button
              onClick={() => router.push(`/trades/${tradeId}/payment`)}
              variant="gradient"
              gradient="primary"
              size="lg"
              className="gap-2"
            >
              <CurrencyDollarIcon className="w-5 h-5" />
              Realizar Pagamento
            </Button>
          );
        }
        break;

      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_PENDING_CONFIRMATION':
        if (!isBuyer) {
          return (
            <Button
              onClick={() => router.push(`/trades/${tradeId}/release`)}
              variant="gradient"
              gradient="success"
              size="lg"
              className="gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Liberar Criptomoedas
            </Button>
          );
        }
        break;
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/trades')}
          className="gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Detalhes da Transação</h1>
          {getStatusBadge(trade.status)}
        </div>
        <p className="text-muted-foreground">
          ID: {trade.id.substring(0, 8)}...
        </p>
      </div>

      {/* Resumo da Transação */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Resumo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tipo de Operação</p>
            <p className="font-medium">
              {isBuyer ? 'Compra' : 'Venda'} de {trade.listing.cryptocurrency}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Quantidade</p>
            <p className="font-medium">{trade.amount} {trade.listing.cryptocurrency}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Preço Unitário</p>
            <p className="font-medium">R$ {parseFloat(trade.pricePerUnit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
            <p className="font-medium text-lg">R$ {parseFloat(trade.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </Card>

      {/* Participantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            {isBuyer ? 'Vendedor' : 'Comprador'}
          </h3>
          <div className="space-y-2">
            <p className="font-medium">
              {counterparty.firstName} {counterparty.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{counterparty.email}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Método de Pagamento</h3>
          <p className="font-medium">
            {trade.paymentMethod?.displayName || 'PIX'}
          </p>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Histórico</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
            <div>
              <p className="font-medium">Transação Iniciada</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(trade.createdAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          {trade.status === 'COMPLETED' && trade.completedAt && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="font-medium">Transação Concluída</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(trade.completedAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        {getActionButtons()}
        <Button
          onClick={() => router.push(`/messages/${tradeId}`)}
          variant="outline"
          className="gap-2"
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
          Abrir Chat
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