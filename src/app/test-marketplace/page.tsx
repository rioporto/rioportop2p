'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format';
import { 
  Bitcoin, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShieldCheck,
  Star,
  Clock,
  Filter,
  Plus
} from 'lucide-react';

// Dados mockados para demonstração
const mockListings = [
  {
    id: '1',
    type: 'SELL',
    cryptocurrency: 'BTC',
    pricePerUnit: 352450.00,
    minAmount: 50,
    maxAmount: 5000,
    paymentMethods: ['PIX'],
    user: {
      name: 'João Silva',
      rating: 4.8,
      totalTrades: 127,
      isVerified: true
    },
    margin: -0.5 // 0.5% abaixo do mercado
  },
  {
    id: '2',
    type: 'BUY',
    cryptocurrency: 'BTC',
    pricePerUnit: 348900.00,
    minAmount: 100,
    maxAmount: 10000,
    paymentMethods: ['PIX', 'TED'],
    user: {
      name: 'Maria Santos',
      rating: 4.9,
      totalTrades: 89,
      isVerified: true
    },
    margin: 0.8 // 0.8% acima do mercado
  },
  {
    id: '3',
    type: 'SELL',
    cryptocurrency: 'ETH',
    pricePerUnit: 13250.00,
    minAmount: 100,
    maxAmount: 3000,
    paymentMethods: ['PIX'],
    user: {
      name: 'Pedro Costa',
      rating: 4.6,
      totalTrades: 45,
      isVerified: false
    },
    margin: -0.3
  },
  {
    id: '4',
    type: 'BUY',
    cryptocurrency: 'USDT',
    pricePerUnit: 5.12,
    minAmount: 500,
    maxAmount: 50000,
    paymentMethods: ['PIX'],
    user: {
      name: 'Ana Lima',
      rating: 5.0,
      totalTrades: 203,
      isVerified: true
    },
    margin: 0.2
  }
];

export default function TestMarketplacePage() {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'trades'>('price');

  const filteredListings = mockListings
    .filter(listing => {
      if (filter !== 'all' && listing.type !== filter.toUpperCase()) return false;
      if (selectedCrypto !== 'all' && listing.cryptocurrency !== selectedCrypto) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.pricePerUnit - b.pricePerUnit;
        case 'rating':
          return b.user.rating - a.user.rating;
        case 'trades':
          return b.user.totalTrades - a.user.totalTrades;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketplace P2P - Rio Porto
          </h1>
          <p className="text-gray-600">
            Compre e venda criptomoedas diretamente com outros usuários
          </p>
        </div>

        {/* Estatísticas do Mercado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bitcoin</p>
                <p className="text-xl font-bold">R$ 350.245</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +2.4%
                </p>
              </div>
              <Bitcoin className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volume 24h</p>
                <p className="text-xl font-bold">R$ 1.2M</p>
                <p className="text-xs text-gray-500">523 trades</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-xl font-bold">1.843</p>
                <p className="text-xs text-gray-500">+127 hoje</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa Sucesso</p>
                <p className="text-xl font-bold">99.2%</p>
                <p className="text-xs text-gray-500">Última semana</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex flex-wrap gap-3">
            {/* Tipo de Operação */}
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'gradient' : 'flat'}
                size="sm"
              >
                Todos
              </Button>
              <Button
                onClick={() => setFilter('buy')}
                variant={filter === 'buy' ? 'gradient' : 'flat'}
                size="sm"
              >
                Comprar
              </Button>
              <Button
                onClick={() => setFilter('sell')}
                variant={filter === 'sell' ? 'gradient' : 'flat'}
                size="sm"
              >
                Vender
              </Button>
            </div>

            {/* Criptomoeda */}
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as cryptos</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>

            {/* Ordenar por */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Melhor preço</option>
              <option value="rating">Melhor avaliação</option>
              <option value="trades">Mais negócios</option>
            </select>
          </div>

          <Button variant="gradient" className="md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Criar Anúncio
          </Button>
        </div>

        {/* Lista de Anúncios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge 
                    variant={listing.type === 'SELL' ? 'success' : 'warning'}
                    className="mb-2"
                  >
                    {listing.type === 'SELL' ? 'Venda' : 'Compra'}
                  </Badge>
                  <h3 className="text-xl font-bold">{listing.cryptocurrency}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(listing.pricePerUnit)}
                  </p>
                  <p className={`text-sm flex items-center gap-1 ${
                    listing.margin < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {listing.margin < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {Math.abs(listing.margin)}% do mercado
                  </p>
                </div>
                {listing.cryptocurrency === 'BTC' && <Bitcoin className="w-8 h-8 text-orange-500" />}
                {listing.cryptocurrency === 'ETH' && <div className="w-8 h-8 bg-purple-500 rounded-full" />}
                {listing.cryptocurrency === 'USDT' && <div className="w-8 h-8 bg-green-500 rounded-full" />}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Limites</p>
                  <p className="font-medium">
                    {formatCurrency(listing.minAmount)} - {formatCurrency(listing.maxAmount)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Pagamento</p>
                  <div className="flex gap-2 mt-1">
                    {listing.paymentMethods.map(method => (
                      <Badge key={method} variant="flat" size="sm">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {listing.user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-1">
                          {listing.user.name}
                          {listing.user.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {listing.user.rating}
                          </span>
                          <span>•</span>
                          <span>{listing.user.totalTrades} trades</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="gradient" 
                  className="w-full mt-4"
                  onClick={() => alert(`Iniciando ${listing.type === 'SELL' ? 'compra' : 'venda'} de ${listing.cryptocurrency}`)}
                >
                  {listing.type === 'SELL' ? 'Comprar' : 'Vender'} {listing.cryptocurrency}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Instruções */}
        <Card className="p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-3">
            Como funciona o Marketplace P2P:
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. <strong>Escolha um anúncio:</strong> Filtre por tipo, crypto e método de pagamento</li>
            <li>2. <strong>Inicie a negociação:</strong> Clique no botão para começar o trade</li>
            <li>3. <strong>Chat privado:</strong> Converse com o vendedor/comprador</li>
            <li>4. <strong>Escrow automático:</strong> Cryptos ficam travadas até confirmação</li>
            <li>5. <strong>Pagamento PIX:</strong> Realize o pagamento conforme instruções</li>
            <li>6. <strong>Liberação:</strong> Após confirmação, cryptos são liberadas</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Sempre verifique a reputação do usuário e prefira
              negociar com usuários verificados (ícone azul).
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}