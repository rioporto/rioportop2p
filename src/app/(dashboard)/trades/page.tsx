'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ITransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  pricePerUnit: string;
  totalPrice: string;
  status: 'PENDING' | 'AWAITING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'RELEASING_CRYPTO' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    type: 'BUY' | 'SELL';
    cryptocurrency: string;
    fiatCurrency: string;
    pricePerUnit: string;
  };
  buyer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  seller: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  paymentMethod: {
    id: string;
    paymentType: string;
    displayName: string;
  };
}

interface IPaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TradesPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [pagination, setPagination] = useState<IPaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Buscar dados do usuário atual
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user?.id) {
          setCurrentUserId(data.user.id);
        }
      });
  }, []);

  // Buscar transações
  const fetchTransactions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      setTransactions(data.data.transactions);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTransactions(pagination.page);
  }, [statusFilter]);

  // Filtrar transações por tipo (compra/venda)
  const filteredTransactions = transactions.filter(transaction => {
    const isBuyer = transaction.buyerId === currentUserId;
    return activeTab === 'buy' ? isBuyer : !isBuyer;
  });

  // Obter badge de status
  const getStatusBadge = (status: ITransaction['status']) => {
    const statusConfig = {
      PENDING: { variant: 'warning' as const, label: 'Pendente' },
      AWAITING_PAYMENT: { variant: 'warning' as const, label: 'Aguardando Pagamento' },
      PAYMENT_CONFIRMED: { variant: 'primary' as const, label: 'Pagamento Confirmado' },
      RELEASING_CRYPTO: { variant: 'primary' as const, label: 'Liberando Crypto' },
      COMPLETED: { variant: 'success' as const, label: 'Concluída' },
      CANCELLED: { variant: 'danger' as const, label: 'Cancelada' },
      DISPUTED: { variant: 'danger' as const, label: 'Em Disputa' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  // Obter ação baseada no status
  const getActionButton = (transaction: ITransaction) => {
    const isBuyer = transaction.buyerId === currentUserId;
    
    switch (transaction.status) {
      case 'AWAITING_PAYMENT':
        if (isBuyer) {
          return (
            <Button
              onClick={() => router.push(`/trades/${transaction.id}/payment`)}
              size="sm"
              variant="primary"
            >
              Pagar
            </Button>
          );
        }
        return <Button size="sm" variant="secondary" disabled>Aguardando</Button>;

      case 'PAYMENT_CONFIRMED':
        if (!isBuyer) {
          return (
            <Button
              onClick={() => router.push(`/trades/${transaction.id}/release`)}
              size="sm"
              variant="success"
            >
              Liberar Crypto
            </Button>
          );
        }
        return <Button size="sm" variant="secondary" disabled>Aguardando</Button>;

      case 'COMPLETED':
        return (
          <Button
            onClick={() => router.push(`/trades/${transaction.id}`)}
            size="sm"
            variant="secondary"
          >
            Ver Detalhes
          </Button>
        );

      default:
        return (
          <Button
            onClick={() => router.push(`/trades/${transaction.id}`)}
            size="sm"
            variant="secondary"
          >
            Ver Detalhes
          </Button>
        );
    }
  };

  // Formatar nome da contraparte
  const getCounterpartyName = (transaction: ITransaction) => {
    const isBuyer = transaction.buyerId === currentUserId;
    const counterparty = isBuyer ? transaction.seller : transaction.buyer;
    return `${counterparty.firstName} ${counterparty.lastName}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Minhas Transações</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          onClick={() => setActiveTab('buy')}
          variant={activeTab === 'buy' ? 'primary' : 'secondary'}
        >
          Minhas Compras
        </Button>
        <Button
          onClick={() => setActiveTab('sell')}
          variant={activeTab === 'sell' ? 'primary' : 'secondary'}
        >
          Minhas Vendas
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="AWAITING_PAYMENT">Aguardando Pagamento</option>
              <option value="PAYMENT_CONFIRMED">Pagamento Confirmado</option>
              <option value="COMPLETED">Concluída</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="DISPUTED">Em Disputa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Período</label>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filtrar por data"
            />
          </div>
        </div>
      </Card>

      {/* Lista de Transações */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            {activeTab === 'buy' 
              ? 'Você ainda não realizou nenhuma compra.' 
              : 'Você ainda não realizou nenhuma venda.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold">
                      {transaction.listing.cryptocurrency}
                    </h3>
                    {getStatusBadge(transaction.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Quantidade:</span> {transaction.amount} {transaction.listing.cryptocurrency}
                    </div>
                    <div>
                      <span className="font-medium">Valor Total:</span> R$ {parseFloat(transaction.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div>
                      <span className="font-medium">Contraparte:</span> {getCounterpartyName(transaction)}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    {format(new Date(transaction.createdAt), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>
                
                <div className="ml-4">
                  {getActionButton(transaction)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button
            onClick={() => fetchTransactions(pagination.page - 1)}
            disabled={pagination.page === 1}
            variant="secondary"
            size="sm"
          >
            Anterior
          </Button>
          
          <div className="flex items-center px-4">
            <span className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
          </div>
          
          <Button
            onClick={() => fetchTransactions(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            variant="secondary"
            size="sm"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}