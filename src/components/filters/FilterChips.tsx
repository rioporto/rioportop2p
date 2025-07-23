import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Coins, CreditCard, Shield, Filter } from 'lucide-react';

interface FilterChipsProps {
  filters: {
    priceRange: { min: number; max: number };
    cryptos: string[];
    paymentMethods: string[];
    offerType: 'buy' | 'sell' | 'all';
    verifiedOnly: boolean;
  };
  onRemove: (type: string, value?: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ filters, onRemove }) => {
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const chips: Array<{
    id: string;
    type: string;
    value?: string;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [];

  // Price Range Chip
  if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) {
    chips.push({
      id: 'price',
      type: 'price',
      label: `${formatPrice(filters.priceRange.min)} - ${formatPrice(filters.priceRange.max)}`,
      icon: <DollarSign className="w-3 h-3" />,
      color: 'from-green-500 to-emerald-500'
    });
  }

  // Crypto Chips
  filters.cryptos.forEach(crypto => {
    chips.push({
      id: `crypto-${crypto}`,
      type: 'crypto',
      value: crypto,
      label: crypto,
      icon: <Coins className="w-3 h-3" />,
      color: 'from-blue-500 to-purple-500'
    });
  });

  // Payment Method Chips
  filters.paymentMethods.forEach(method => {
    chips.push({
      id: `payment-${method}`,
      type: 'payment',
      value: method,
      label: method,
      icon: <CreditCard className="w-3 h-3" />,
      color: 'from-purple-500 to-pink-500'
    });
  });

  // Offer Type Chip
  if (filters.offerType !== 'all') {
    chips.push({
      id: 'type',
      type: 'type',
      label: filters.offerType === 'buy' ? 'Compra' : 'Venda',
      icon: <Filter className="w-3 h-3" />,
      color: filters.offerType === 'buy' ? 'from-blue-500 to-cyan-500' : 'from-orange-500 to-red-500'
    });
  }

  // Verified Only Chip
  if (filters.verifiedOnly) {
    chips.push({
      id: 'verified',
      type: 'verified',
      label: 'Verificados',
      icon: <Shield className="w-3 h-3" />,
      color: 'from-green-500 to-teal-500'
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence mode="popLayout">
        {chips.map((chip, index) => (
          <motion.div
            key={chip.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 500,
                damping: 25,
                delay: index * 0.05
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              y: 10,
              transition: {
                duration: 0.2
              }
            }}
            whileHover={{ scale: 1.05 }}
            className="group relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${chip.color} 
                         rounded-full opacity-20 group-hover:opacity-30 
                         blur-sm transition-opacity`} />
            
            <div className="relative flex items-center gap-2 px-3 py-1.5 
                         bg-gray-800 border border-gray-700 rounded-full
                         group-hover:border-gray-600 transition-all">
              <div className={`bg-gradient-to-r ${chip.color} bg-clip-text text-transparent`}>
                {chip.icon}
              </div>
              
              <span className="text-sm text-gray-300">{chip.label}</span>
              
              <motion.button
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(chip.type, chip.value);
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-red-500/20 
                         transition-colors group"
              >
                <X className="w-3 h-3 text-gray-400 group-hover:text-red-400 
                           transition-colors" />
              </motion.button>
            </div>

            {/* Remove Animation Effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${chip.color} 
                       rounded-full pointer-events-none`}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0 }}
              whileHover={{ scale: 1.5, opacity: 0.2 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Active Filter Count Badge */}
      {chips.length > 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center px-2 py-1 bg-gray-800 
                   border border-gray-700 rounded-full"
        >
          <span className="text-xs text-gray-400">+{chips.length - 3} mais</span>
        </motion.div>
      )}
    </div>
  );
};

export default FilterChips;