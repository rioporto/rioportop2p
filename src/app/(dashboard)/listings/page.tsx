'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KYCLevel } from '@/types/kyc';

interface IListing {
  id: string;
  userId: string;
  type: 'BUY' | 'SELL';
  cryptocurrency: string;
  fiatCurrency: string;
  pricePerUnit: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  terms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    kycLevel: KYCLevel;
  };
}

interface IFilters {
  type: 'all' | 'BUY' | 'SELL';
  cryptocurrency: string;
  minPrice: string;
  maxPrice: string;
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<IListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IFilters>({
    type: 'all',
    cryptocurrency: '',
    minPrice: '',
    maxPrice: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchListings();
  }, [filters, currentPage]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.cryptocurrency) params.append('cryptocurrency', filters.cryptocurrency);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setListings(data.listings || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Erro ao buscar anúncios:', data.error);
        setListings([]);
      }
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof IFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const getKYCBadge = (level: KYCLevel) => {
    const badges = {
      [KYCLevel.BASIC]: { text: 'KYC Básico', className: 'bg-gray-100 text-gray-700' },
      [KYCLevel.INTERMEDIARY]: { text: 'KYC Intermediário', className: 'bg-blue-100 text-blue-700' },
      [KYCLevel.ADVANCED]: { text: 'KYC Avançado', className: 'bg-green-100 text-green-700' }
    };
    return badges[level] || badges[KYCLevel.BASIC];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-primary hover:text-opacity-80 transition-colors">
              Dashboard
            </Link>
          </li>
          <li className="text-text-secondary">
            <span className="mx-2">/</span>
            Anúncios
          </li>
        </ol>
      </nav>

      {/* Page Title e Botão Criar */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Anúncios P2P
          </h1>
          <p className="text-text-secondary">
            Compre e venda criptomoedas diretamente com outros usuários
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push('/listings/new')}
        >
          Criar Anúncio
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Tipo
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="BUY">Compra</option>
                <option value="SELL">Venda</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Criptomoeda
              </label>
              <input
                type="text"
                value={filters.cryptocurrency}
                onChange={(e) => handleFilterChange('cryptocurrency', e.target.value)}
                placeholder="Ex: BTC, ETH, USDT"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Preço Mínimo
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Preço Máximo
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grid de Anúncios */}
      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card 
              key={listing.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/listings/${listing.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    listing.type === 'BUY' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {listing.type === 'BUY' ? 'Compra' : 'Venda'}
                  </span>
                  <span className="text-2xl font-bold text-text-primary">
                    {listing.cryptocurrency}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-text-secondary mb-1">Preço por unidade</p>
                  <p className="text-xl font-semibold text-text-primary">
                    {formatCurrency(listing.pricePerUnit)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-text-secondary">Mínimo</p>
                    <p className="font-medium text-text-primary">
                      {formatCurrency(listing.minAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Máximo</p>
                    <p className="font-medium text-text-primary">
                      {formatCurrency(listing.maxAmount)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {listing.user.name}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                        getKYCBadge(listing.user.kycLevel).className
                      }`}>
                        {getKYCBadge(listing.user.kycLevel).text}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/listings/${listing.id}`);
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && listings.length === 0 && (
        <Card className="p-12 text-center">
          <svg 
            className="w-24 h-24 text-text-secondary mx-auto mb-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Nenhum anúncio encontrado
          </h3>
          <p className="text-text-secondary mb-6">
            Ajuste os filtros ou crie seu primeiro anúncio
          </p>
          <Button
            variant="primary"
            onClick={() => router.push('/listings/new')}
          >
            Criar Primeiro Anúncio
          </Button>
        </Card>
      )}

      {/* Paginação */}
      {!loading && listings.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            Anterior
          </Button>
          
          <span className="text-text-secondary">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}