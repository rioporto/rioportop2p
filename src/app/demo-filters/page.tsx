'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterPanel from '@/components/filters/FilterPanel';
import { ListingCard } from '@/components/listings';
import { Filter, Sparkles, TrendingUp, Shield } from 'lucide-react';

// Mock data com ofertas premium
const mockListings = [
  {
    id: '1',
    type: 'SELL' as const,
    user: {
      name: 'CryptoKing',
      avatar: '👑',
      rating: 4.9,
      completedTrades: 523,
      responseTime: '< 5 min',
      isVerified: true,
      isPremium: true,
      badges: ['super_trader', 'quick_release', 'trusted_seller'],
      kycLevel: 3
    },
    cryptocurrency: {
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: '₿',
      currentPrice: 234567.89,
      priceChange24h: 2.34
    },
    price: 235000,
    limits: {
      min: 100,
      max: 50000
    },
    paymentMethods: [
      { id: 'PIX', name: 'PIX', icon: '⚡', processingTime: 'Instantâneo' },
      { id: 'TED', name: 'TED', icon: '🏦', processingTime: '1 hora' }
    ],
    completionRate: 98.5,
    avgCompletionTime: '12 min',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    escrowProtection: true,
    instantRelease: true,
    featured: true
  },
  {
    id: '2',
    type: 'BUY' as const,
    user: {
      name: 'BitTrader Pro',
      avatar: '🚀',
      rating: 4.8,
      completedTrades: 892,
      responseTime: '< 2 min',
      isVerified: true,
      isPremium: true,
      badges: ['power_trader', 'kyc_verified', 'quick_release'],
      kycLevel: 3
    },
    cryptocurrency: {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'Ξ',
      currentPrice: 3456.78,
      priceChange24h: -1.23
    },
    price: 3500,
    limits: {
      min: 200,
      max: 100000
    },
    paymentMethods: [
      { id: 'PIX', name: 'PIX', icon: '⚡', processingTime: 'Instantâneo' }
    ],
    completionRate: 99.2,
    avgCompletionTime: '8 min',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    escrowProtection: true,
    instantRelease: true,
    featured: true
  },
  {
    id: '3',
    type: 'SELL' as const,
    user: {
      name: 'FastCrypto',
      avatar: '⚡',
      rating: 4.7,
      completedTrades: 1250,
      responseTime: '< 1 min',
      isVerified: true,
      isPremium: false,
      badges: ['trusted_seller', 'high_volume'],
      kycLevel: 2
    },
    cryptocurrency: {
      symbol: 'USDT',
      name: 'Tether',
      icon: '₮',
      currentPrice: 5.32,
      priceChange24h: 0.05
    },
    price: 5.35,
    limits: {
      min: 500,
      max: 200000
    },
    paymentMethods: [
      { id: 'PIX', name: 'PIX', icon: '⚡', processingTime: 'Instantâneo' },
      { id: 'TED', name: 'TED', icon: '🏦', processingTime: '1 hora' },
      { id: 'DEBIT', name: 'Cartão Débito', icon: '💳', processingTime: '5 min' }
    ],
    completionRate: 97.8,
    avgCompletionTime: '15 min',
    lastSeen: new Date(Date.now() - 10 * 60 * 1000),
    escrowProtection: true,
    instantRelease: false,
    featured: false
  },
  {
    id: '4',
    type: 'BUY' as const,
    user: {
      name: 'CryptoWhale',
      avatar: '🐋',
      rating: 5.0,
      completedTrades: 2341,
      responseTime: '< 3 min',
      isVerified: true,
      isPremium: true,
      badges: ['whale_trader', 'perfect_score', 'vip'],
      kycLevel: 3
    },
    cryptocurrency: {
      symbol: 'BNB',
      name: 'Binance Coin',
      icon: 'B',
      currentPrice: 1789.45,
      priceChange24h: 3.67
    },
    price: 1800,
    limits: {
      min: 1000,
      max: 500000
    },
    paymentMethods: [
      { id: 'PIX', name: 'PIX', icon: '⚡', processingTime: 'Instantâneo' }
    ],
    completionRate: 99.9,
    avgCompletionTime: '5 min',
    lastSeen: new Date(Date.now() - 1 * 60 * 1000),
    escrowProtection: true,
    instantRelease: true,
    featured: true
  },
  {
    id: '5',
    type: 'SELL' as const,
    user: {
      name: 'SafeTrader',
      avatar: '🛡️',
      rating: 4.6,
      completedTrades: 678,
      responseTime: '< 10 min',
      isVerified: true,
      isPremium: false,
      badges: ['secure_trader', 'kyc_verified'],
      kycLevel: 2
    },
    cryptocurrency: {
      symbol: 'SOL',
      name: 'Solana',
      icon: 'S',
      currentPrice: 456.78,
      priceChange24h: -2.45
    },
    price: 460,
    limits: {
      min: 50,
      max: 20000
    },
    paymentMethods: [
      { id: 'PIX', name: 'PIX', icon: '⚡', processingTime: 'Instantâneo' },
      { id: 'PICPAY', name: 'PicPay', icon: '📱', processingTime: '2 min' }
    ],
    completionRate: 96.5,
    avgCompletionTime: '20 min',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    escrowProtection: true,
    instantRelease: false,
    featured: false
  },
  {
    id: '6',
    type: 'BUY' as const,
    user: {
      name: 'QuickBuy',
      avatar: '🎯',
      rating: 4.5,
      completedTrades: 445,
      responseTime: '< 15 min',
      isVerified: false,
      isPremium: false,
      badges: ['active_trader'],
      kycLevel: 1
    },
    cryptocurrency: {
      symbol: 'DOGE',
      name: 'Dogecoin',
      icon: 'Ð',
      currentPrice: 0.45,
      priceChange24h: 5.23
    },
    price: 0.46,
    limits: {
      min: 100,
      max: 10000
    },
    paymentMethods: [
      { id: 'PIX', name: 'PIX', icon: '⚡', processingTime: 'Instantâneo' }
    ],
    completionRate: 94.2,
    avgCompletionTime: '25 min',
    lastSeen: new Date(Date.now() - 45 * 60 * 1000),
    escrowProtection: true,
    instantRelease: false,
    featured: false
  }
];

export default function DemoFiltersPage() {
  const [filteredListings, setFilteredListings] = useState(mockListings);
  const [isFiltering, setIsFiltering] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});

  const handleFiltersChange = (filters: any) => {
    setIsFiltering(true);
    setAppliedFilters(filters);
    
    // Simulate filtering delay
    setTimeout(() => {
      let filtered = [...mockListings];

      // Filter by price range
      if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) {
        filtered = filtered.filter(listing => {
          const totalMin = listing.limits.min;
          const totalMax = listing.limits.max;
          return totalMax >= filters.priceRange.min && totalMin <= filters.priceRange.max;
        });
      }

      // Filter by cryptocurrencies
      if (filters.cryptos.length > 0) {
        filtered = filtered.filter(listing => 
          filters.cryptos.includes(listing.cryptocurrency.symbol)
        );
      }

      // Filter by payment methods
      if (filters.paymentMethods.length > 0) {
        filtered = filtered.filter(listing => 
          listing.paymentMethods.some(pm => 
            filters.paymentMethods.includes(pm.id)
          )
        );
      }

      // Filter by offer type
      if (filters.offerType !== 'all') {
        filtered = filtered.filter(listing => 
          listing.type.toLowerCase() === filters.offerType
        );
      }

      // Filter by verified only
      if (filters.verifiedOnly) {
        filtered = filtered.filter(listing => listing.user.isVerified);
      }

      setFilteredListings(filtered);
      setIsFiltering(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
              <Filter className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
                         bg-clip-text text-transparent">
              Sistema de Filtros Premium
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experimente nosso sistema de filtros com visual e UX excepcionais. 
            Encontre as melhores ofertas com animações suaves e interações intuitivas.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Sparkles, label: 'Ofertas Premium', value: filteredListings.filter(l => l.featured).length, color: 'from-yellow-400 to-orange-400' },
            { icon: Shield, label: 'Verificados', value: filteredListings.filter(l => l.user.isVerified).length, color: 'from-green-400 to-emerald-400' },
            { icon: TrendingUp, label: 'Taxa Média', value: '2.3%', color: 'from-blue-400 to-purple-400' },
            { icon: Filter, label: 'Filtros Ativos', value: Object.keys(appliedFilters).length, color: 'from-purple-400 to-pink-400' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel 
              onFiltersChange={handleFiltersChange}
              resultCount={filteredListings.length}
            />
          </div>

          {/* Listings */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {isFiltering ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-[400px] bg-gray-900 rounded-xl animate-pulse" />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="listings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {filteredListings.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400">
                          {filteredListings.length} ofertas encontradas
                        </p>
                        <motion.div
                          key={filteredListings.length}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                                   rounded-full text-blue-400 text-sm"
                        >
                          Atualizado
                        </motion.div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredListings.map((listing, idx) => (
                          <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="transform transition-all duration-200"
                          >
                            <ListingCard listing={listing} />
                          </motion.div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-20"
                    >
                      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 
                                    max-w-md mx-auto">
                        <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Nenhuma oferta encontrada
                        </h3>
                        <p className="text-gray-400">
                          Tente ajustar os filtros para encontrar mais ofertas
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}