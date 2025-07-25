'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ClockIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { IListing } from '@/types/listings';
import { Button } from '@/components/ui/Button';
import { 
  BitcoinIcon, 
  EthereumIcon, 
  USDTIcon, 
  BNBIcon 
} from '@/components/icons/crypto';
import { ListingBadges, TransactionStatusBadge, BadgeType } from './ListingBadges';
import { PaymentMethodChips } from './PaymentMethodChip';
import { LimitProgressBar } from './LimitProgressBar';
import { Sparkline } from './Sparkline';
import dynamic from 'next/dynamic';

// Lazy load the hover card component
const ListingCardHover = dynamic(() => import('./ListingCardHover').then(mod => mod.ListingCardHover), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl h-96" />
});

interface IListingCardProps {
  listing: IListing;
  onSelect?: (listing: IListing) => void;
  showActions?: boolean;
  index?: number;
}

// Memoized constants
const cryptoIcons: Record<string, React.ComponentType<any>> = {
  BTC: BitcoinIcon,
  ETH: EthereumIcon,
  USDT: USDTIcon,
  BNB: BNBIcon
};

const cryptoColors: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  USDT: '#26A17B',
  BNB: '#F3BA2F'
};

const cryptoGradients: Record<string, string> = {
  BTC: 'gradient-btc',
  ETH: 'gradient-eth',
  USDT: 'gradient-usdt',
  BNB: 'gradient-bnb'
};

function ListingCardComponent({ listing, onSelect, showActions = true, index = 0 }: IListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showExpandedView, setShowExpandedView] = useState(false);

  // Memoize expensive calculations
  const formatCurrency = useMemo(() => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: listing.fiatCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return (value: number) => formatter.format(value);
  }, [listing.fiatCurrency]);

  const CryptoIcon = useMemo(() => 
    cryptoIcons[listing.cryptocurrency] || BitcoinIcon,
    [listing.cryptocurrency]
  );

  const cryptoColor = useMemo(() => 
    cryptoColors[listing.cryptocurrency] || '#666',
    [listing.cryptocurrency]
  );

  const cryptoGradient = useMemo(() => 
    cryptoGradients[listing.cryptocurrency] || 'gradient-primary',
    [listing.cryptocurrency]
  );

  // Memoize sparkline data
  const sparklineData = useMemo(() => 
    Array.from({ length: 10 }, () => 
      listing.pricePerUnit * (0.95 + Math.random() * 0.1)
    ),
    [listing.pricePerUnit]
  );

  // Memoize user badges
  const userBadges = useMemo<BadgeType[]>(() => {
    const badges: BadgeType[] = [];
    if (listing.user?.reputation && listing.user.reputation >= 4.8) {
      badges.push('top-trader');
    }
    if (listing.user?.completedTrades && listing.user.completedTrades > 100) {
      badges.push('verified');
    }
    if (Math.random() > 0.7) badges.push('fast-response');
    if (listing.user?.completedTrades === 0) badges.push('new');
    return badges;
  }, [listing.user?.reputation, listing.user?.completedTrades]);

  // Memoize handlers
  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(prev => !prev);
  }, []);

  const handleCardClick = useCallback(() => {
    setShowExpandedView(true);
  }, []);

  const handleAction = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(listing);
  }, [onSelect, listing]);

  const handleExpandedAction = useCallback((action: string) => {
    if (action === 'trade') {
      onSelect?.(listing);
    }
    setShowExpandedView(false);
  }, [onSelect, listing]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.1,
          type: 'spring',
          stiffness: 100
        }}
        whileHover={{ 
          scale: 1.02,
          rotateY: 5,
          rotateX: -2,
          transition: { type: 'spring', stiffness: 300 }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleCardClick}
        className="relative perspective-1000 cursor-pointer"
      >
        <div className={`
          relative p-6 rounded-2xl transform-3d
          bg-white dark:bg-gray-800
          shadow-xl hover:shadow-2xl
          transition-all duration-300
          border border-gray-100 dark:border-gray-700
          overflow-hidden
          ${isHovered ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' : ''}
        `}>
          {/* Animated background effect */}
          <div className={`
            absolute inset-0 opacity-10
            ${cryptoGradient}
            ${isHovered ? 'animate-gradient-x' : ''}
          `} />

          {/* Card content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <TransactionStatusBadge type={listing.type === 'BUY' ? 'buy' : 'sell'} />
                  
                  <motion.div
                    animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <CryptoIcon size="lg" className="relative z-10" />
                    {/* Glow effect */}
                    <div 
                      className="absolute inset-0 rounded-full blur-lg opacity-50"
                      style={{ backgroundColor: cryptoColor }}
                    />
                  </motion.div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {listing.cryptocurrency}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {listing.cryptocurrency} / {listing.fiatCurrency}
                    </p>
                  </div>
                </div>

                {/* Price with animation */}
                <motion.div
                  animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                  className="mb-2"
                >
                  <div className={`
                    text-3xl font-bold bg-gradient-to-r ${cryptoGradient} 
                    bg-clip-text text-transparent
                  `}>
                    {formatCurrency(listing.pricePerUnit)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    por {listing.cryptocurrency}
                  </div>
                </motion.div>

                {/* Sparkline chart */}
                <div className="h-12 mb-3">
                  <Sparkline 
                    data={sparklineData} 
                    color={cryptoColor}
                    height={48}
                    animated={isHovered}
                  />
                </div>
              </div>

              {/* User info and favorite button */}
              <div className="text-right">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleFavorite}
                  className="mb-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isFavorited ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500 animate-heart-burst" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" />
                  )}
                </motion.button>

                {listing.user && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        text-white font-bold text-sm
                        ${cryptoGradient}
                        shadow-lg
                      `}>
                        {listing.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                          {listing.user.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="text-yellow-500">★</span>
                          <span>{listing.user.reputation?.toFixed(1) || '5.0'}</span>
                          <span>•</span>
                          <span>{listing.user.completedTrades || 0} trades</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* User badges */}
            {userBadges.length > 0 && (
              <div className="mb-4">
                <ListingBadges badges={userBadges} size="sm" showLabels={false} />
              </div>
            )}

            {/* Limits progress bar */}
            <div className="mb-4">
              <LimitProgressBar 
                min={listing.minAmount} 
                max={listing.maxAmount}
                currency={listing.fiatCurrency}
                animated={isHovered}
              />
            </div>

            {/* Payment methods */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                Métodos de pagamento
              </div>
              <PaymentMethodChips 
                methods={listing.paymentMethods} 
                size="sm"
                animated={isHovered}
              />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">Tempo</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">~5min</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">Online</div>
                <div className="text-sm font-bold text-green-500">Agora</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">Taxa</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">0%</div>
              </motion.div>
            </div>

            {/* Terms preview */}
            {listing.terms && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {listing.terms}
                </p>
              </div>
            )}

            {/* Action button */}
            {showActions && (
              <Button
                onClick={handleAction}
                className={`
                  w-full relative overflow-hidden group
                  ${listing.type === 'BUY' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                  }
                  text-white font-bold
                  transition-all duration-300
                  ripple-container
                `}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  {listing.type === 'BUY' ? 'Vender' : 'Comprar'} {listing.cryptocurrency}
                </span>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700">
                  <div className="h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                </div>
              </Button>
            )}
          </div>

          {/* 3D shadow effect */}
          <div className={`
            absolute -bottom-2 -right-2 w-full h-full rounded-2xl -z-10
            ${cryptoGradient} opacity-20 blur-xl
            ${isHovered ? 'scale-105' : 'scale-100'}
            transition-transform duration-300
          `} />
        </div>
      </motion.div>

      {showExpandedView && (
        <ListingCardHover
          listing={listing}
          isOpen={showExpandedView}
          onClose={() => setShowExpandedView(false)}
          onAction={handleExpandedAction}
        />
      )}
    </>
  );
}

// Export memoized component
export const ListingCard = React.memo(ListingCardComponent, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.listing.id === nextProps.listing.id &&
    prevProps.listing.pricePerUnit === nextProps.listing.pricePerUnit &&
    prevProps.listing.updatedAt === nextProps.listing.updatedAt &&
    prevProps.showActions === nextProps.showActions
  );
});