'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IListing } from '@/types/listings';
import { Button } from '@/components/ui/Button';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  StarIcon, 
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface ListingCardHoverProps {
  listing: IListing;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (action: 'trade' | 'message' | 'favorite') => void;
}

export function ListingCardHover({ listing, isOpen, onClose, onAction }: ListingCardHoverProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onAction?.('favorite');
  };

  // Mock data for demonstration
  const priceHistory = [
    { date: '1h', price: listing.pricePerUnit * 0.98 },
    { date: '6h', price: listing.pricePerUnit * 0.99 },
    { date: '12h', price: listing.pricePerUnit * 0.97 },
    { date: '24h', price: listing.pricePerUnit * 1.01 },
    { date: 'Agora', price: listing.pricePerUnit }
  ];

  const reviews = [
    { user: 'João S.', rating: 5, comment: 'Excelente trader, muito rápido!' },
    { user: 'Maria L.', rating: 5, comment: 'Confiável e eficiente.' },
    { user: 'Pedro R.', rating: 4, comment: 'Boa experiência, recomendo.' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Expanded Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto z-50"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
              {/* Gradient header */}
              <div className={`
                h-32 bg-gradient-to-br relative overflow-hidden
                ${listing.type === 'BUY' 
                  ? 'from-green-400 via-emerald-500 to-teal-600' 
                  : 'from-blue-400 via-indigo-500 to-purple-600'
                }
              `}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse" />
                  <div className="absolute top-8 -left-8 w-32 h-32 bg-white rounded-full animate-pulse delay-75" />
                  <div className="absolute -bottom-4 right-16 w-20 h-20 bg-white rounded-full animate-pulse delay-150" />
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Favorite button */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleFavorite}
                  className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors"
                >
                  {isFavorited ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              </div>

              <div className="p-6 -mt-16 relative">
                {/* Main info card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {listing.cryptocurrency} / {listing.fiatCurrency}
                      </h3>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        R$ {listing.pricePerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    {listing.user && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {listing.user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {listing.user.name}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                              <span>{listing.user.reputation?.toFixed(1) || '5.0'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-500 dark:text-gray-400">Completadas</div>
                      <div className="font-bold">{listing.user?.completedTrades || 0}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-500 dark:text-gray-400">Tempo médio</div>
                      <div className="font-bold">5 min</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-500 dark:text-gray-400">Volume 24h</div>
                      <div className="font-bold">R$ 125k</div>
                    </div>
                  </div>

                  {/* Price chart */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Histórico de Preço
                    </h4>
                    <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-end justify-between h-full">
                        {priceHistory.map((data, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-gradient-to-t from-blue-400 to-purple-600 rounded-t"
                              style={{ 
                                height: `${(data.price / Math.max(...priceHistory.map(d => d.price))) * 100}%`,
                                minHeight: '20%'
                              }}
                            />
                            <div className="text-xs text-gray-500 mt-2">{data.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  {listing.terms && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Termos do Anúncio
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {listing.terms}
                      </p>
                    </div>
                  )}

                  {/* Recent reviews */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Avaliações Recentes
                    </h4>
                    <div className="space-y-3">
                      {reviews.map((review, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {review.user.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{review.user}</span>
                              <div className="flex">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                  <StarIcon key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {review.comment}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => onAction?.('trade')}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                    >
                      {listing.type === 'BUY' ? 'Vender' : 'Comprar'} {listing.cryptocurrency}
                    </Button>
                    <Button
                      onClick={() => onAction?.('message')}
                      variant="secondary"
                      className="px-4"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}