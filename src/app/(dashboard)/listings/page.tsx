'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ListingGrid, EmptyListings } from '@/components/marketplace/ListingGrid';
import { ListingSkeleton } from '@/components/marketplace/ListingSkeleton';
import { FilterSidebar, FilterState } from '@/components/marketplace/FilterSidebar';
import { SortOptions, SortOptionsMobile, SortOption } from '@/components/marketplace/SortOptions';
import { FunnelIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/cn';
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
    rating?: number;
    totalTrades?: number;
    isVerified?: boolean;
  };
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<IListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    cryptocurrencies: [],
    priceRange: [0, 999999],
    paymentMethods: [],
    verifiedOnly: false
  });

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.cryptocurrencies.length > 0) {
        filters.cryptocurrencies.forEach(crypto => params.append('crypto', crypto));
      }
      if (filters.priceRange[0] > 0) params.append('minPrice', filters.priceRange[0].toString());
      if (filters.priceRange[1] < 999999) params.append('maxPrice', filters.priceRange[1].toString());
      if (filters.paymentMethods.length > 0) {
        filters.paymentMethods.forEach(method => params.append('payment', method));
      }
      if (filters.verifiedOnly) params.append('verified', 'true');
      params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        // Adicionar dados mock para demonstração visual
        const mockEnhancedListings = (data.listings || []).map((listing: IListing) => ({
          ...listing,
          user: {
            ...listing.user,
            rating: listing.user.rating || (Math.random() * 2 + 3),
            totalTrades: listing.user.totalTrades || Math.floor(Math.random() * 500),
            isVerified: listing.user.isVerified || Math.random() > 0.5
          }
        }));
        
        setListings(mockEnhancedListings);
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
  }, [filters, sortBy, currentPage]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleCreateListing = () => {
    router.push('/listings/new');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
                Dashboard
              </Link>
            </li>
            <li className="text-gray-400">
              <span className="mx-2">/</span>
              Marketplace P2P
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Marketplace P2P
            </h1>
            <p className="text-gray-600">
              Compre e venda criptomoedas diretamente com outros usuários
            </p>
          </div>
          
          <Button
            variant="gradient"
            size="md"
            onClick={handleCreateListing}
            className="shadow-skeuo-md hover:shadow-skeuo-lg transition-all duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Criar Anúncio
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Anúncios Ativos', value: listings.length, color: 'text-blue-600' },
            { label: 'Volume 24h', value: 'R$ 1.2M', color: 'text-green-600' },
            { label: 'Usuários Online', value: '234', color: 'text-purple-600' },
            { label: 'Taxa Média', value: '2.3%', color: 'text-orange-600' }
          ].map((stat, index) => (
            <div 
              key={index}
              className={cn(
                "bg-white rounded-xl p-4",
                "border border-gray-200",
                "shadow-skeuo-sm hover:shadow-skeuo-md",
                "transition-all duration-200",
                "animate-in fade-in slide-in-from-bottom-2"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={cn("text-2xl font-bold mt-1", stat.color)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
            />
          </div>

          {/* Listings Area */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & Sort */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setShowMobileFilters(true)}
                className={cn(
                  "lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-white border border-gray-300",
                  "shadow-skeuo-sm hover:shadow-skeuo-md",
                  "transition-all duration-200"
                )}
              >
                <FunnelIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Filtros</span>
                {(filters.cryptocurrencies.length > 0 || 
                  filters.paymentMethods.length > 0 || 
                  filters.verifiedOnly ||
                  filters.type !== 'all') && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {filters.cryptocurrencies.length + 
                     filters.paymentMethods.length + 
                     (filters.verifiedOnly ? 1 : 0) +
                     (filters.type !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Sort Options */}
              <div className="flex-1 max-w-xs">
                <div className="hidden sm:block">
                  <SortOptions value={sortBy} onChange={handleSortChange} />
                </div>
                <div className="block sm:hidden">
                  <SortOptionsMobile value={sortBy} onChange={handleSortChange} />
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <ListingSkeleton count={12} />
            ) : listings.length > 0 ? (
              <>
                <ListingGrid listings={listings} />
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <Button
                      variant="secondary"
                      size="md"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="shadow-skeuo-sm"
                    >
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNumber = index + 1;
                        const isActive = pageNumber === currentPage;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={cn(
                              "w-10 h-10 rounded-lg font-medium",
                              "transition-all duration-200",
                              isActive
                                ? "bg-blue-600 text-white shadow-skeuo-md"
                                : "bg-white text-gray-700 border border-gray-300 shadow-skeuo-sm hover:shadow-skeuo-md"
                            )}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={cn(
                              "w-10 h-10 rounded-lg font-medium",
                              "bg-white text-gray-700 border border-gray-300",
                              "shadow-skeuo-sm hover:shadow-skeuo-md",
                              "transition-all duration-200"
                            )}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="md"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="shadow-skeuo-sm"
                    >
                      Próximo
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyListings onCreateListing={handleCreateListing} />
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            
            {/* Drawer */}
            <div className={cn(
              "absolute inset-y-0 left-0 w-full max-w-sm",
              "bg-white shadow-elevation-3",
              "animate-in slide-in-from-left duration-300"
            )}>
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                isMobile
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}