'use client';

import { useState } from 'react';
import { ListingCard, ListingCardSkeletonGrid } from '@/components/listings';
import { IListing } from '@/types/listings';

// Mock data for demonstration
const mockListings: IListing[] = [
  {
    id: '1',
    userId: '1',
    type: 'SELL',
    cryptocurrency: 'BTC',
    fiatCurrency: 'BRL',
    pricePerUnit: 325000,
    minAmount: 100,
    maxAmount: 10000,
    paymentMethods: ['PIX', 'TED'],
    terms: 'Pagamento instantâneo via PIX. Transação rápida e segura. Disponível 24/7 para negociações.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      reputation: 4.9,
      completedTrades: 523
    }
  },
  {
    id: '2',
    userId: '2',
    type: 'BUY',
    cryptocurrency: 'ETH',
    fiatCurrency: 'BRL',
    pricePerUnit: 13500,
    minAmount: 50,
    maxAmount: 5000,
    paymentMethods: ['PIX', 'BANK_TRANSFER'],
    terms: 'Compro ETH com pagamento imediato. Melhor taxa do mercado!',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@example.com',
      reputation: 4.8,
      completedTrades: 342
    }
  },
  {
    id: '3',
    userId: '3',
    type: 'SELL',
    cryptocurrency: 'USDT',
    fiatCurrency: 'BRL',
    pricePerUnit: 5.65,
    minAmount: 500,
    maxAmount: 50000,
    paymentMethods: ['PIX', 'TED', 'BANK_TRANSFER'],
    terms: 'USDT disponível para venda. Grandes volumes com desconto.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@example.com',
      reputation: 5.0,
      completedTrades: 1205
    }
  },
  {
    id: '4',
    userId: '4',
    type: 'BUY',
    cryptocurrency: 'BNB',
    fiatCurrency: 'BRL',
    pricePerUnit: 1850,
    minAmount: 100,
    maxAmount: 3000,
    paymentMethods: ['PIX'],
    terms: 'Novo trader! Primeira negociação com taxa zero.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana@example.com',
      reputation: 5.0,
      completedTrades: 0
    }
  },
  {
    id: '5',
    userId: '5',
    type: 'SELL',
    cryptocurrency: 'BTC',
    fiatCurrency: 'BRL',
    pricePerUnit: 324500,
    minAmount: 200,
    maxAmount: 20000,
    paymentMethods: ['TED', 'BANK_TRANSFER'],
    terms: 'Bitcoin à pronta entrega. Resposta em menos de 1 minuto.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '5',
      name: 'Carlos Mendes',
      email: 'carlos@example.com',
      reputation: 4.7,
      completedTrades: 89
    }
  },
  {
    id: '6',
    userId: '6',
    type: 'BUY',
    cryptocurrency: 'ETH',
    fiatCurrency: 'BRL',
    pricePerUnit: 13600,
    minAmount: 100,
    maxAmount: 8000,
    paymentMethods: ['PIX', 'TED'],
    terms: 'Comprador verificado. Pago o melhor preço do mercado.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '6',
      name: 'Fernanda Lima',
      email: 'fernanda@example.com',
      reputation: 4.9,
      completedTrades: 267
    }
  }
];

export default function DemoCardsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<IListing | null>(null);

  const handleToggleLoading = () => {
    setLoading(!loading);
  };

  const handleSelectListing = (listing: IListing) => {
    setSelectedListing(listing);
    console.log('Selected listing:', listing);
    // Here you would normally navigate to the trade page
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cards de Anúncios Premium
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Demonstração dos novos cards com design excepcional e micro-interações
          </p>
          
          <button
            onClick={handleToggleLoading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Mostrar Cards' : 'Mostrar Skeleton'}
          </button>
        </div>

        {loading ? (
          <ListingCardSkeletonGrid count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={handleSelectListing}
                index={index}
              />
            ))}
          </div>
        )}

        {selectedListing && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            Selecionado: {selectedListing.cryptocurrency} - {selectedListing.type}
          </div>
        )}
      </div>
    </div>
  );
}