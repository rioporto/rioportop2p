import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, TrendingUp, Star } from 'lucide-react';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  color: string;
  popularity: number;
  trending?: boolean;
}

interface CryptoSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelection?: number;
}

const cryptos: Crypto[] = [
  { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'from-orange-400 to-orange-600', popularity: 95, trending: true },
  { id: 'ETH', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'from-blue-400 to-blue-600', popularity: 85, trending: true },
  { id: 'USDT', symbol: 'USDT', name: 'Tether', icon: '₮', color: 'from-green-400 to-green-600', popularity: 90 },
  { id: 'BNB', symbol: 'BNB', name: 'Binance Coin', icon: 'B', color: 'from-yellow-400 to-yellow-600', popularity: 75 },
  { id: 'SOL', symbol: 'SOL', name: 'Solana', icon: 'S', color: 'from-purple-400 to-purple-600', popularity: 70, trending: true },
  { id: 'ADA', symbol: 'ADA', name: 'Cardano', icon: '₳', color: 'from-blue-500 to-indigo-600', popularity: 65 },
  { id: 'DOGE', symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', color: 'from-amber-400 to-amber-600', popularity: 60 },
  { id: 'MATIC', symbol: 'MATIC', name: 'Polygon', icon: 'M', color: 'from-violet-400 to-violet-600', popularity: 55 },
  { id: 'DOT', symbol: 'DOT', name: 'Polkadot', icon: '•', color: 'from-pink-400 to-pink-600', popularity: 50 },
  { id: 'AVAX', symbol: 'AVAX', name: 'Avalanche', icon: 'A', color: 'from-red-400 to-red-600', popularity: 45 }
];

const CryptoSelector: React.FC<CryptoSelectorProps> = ({ 
  selected, 
  onChange,
  maxSelection = 10 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'name'>('popularity');
  const [hoveredCrypto, setHoveredCrypto] = useState<string | null>(null);

  const filteredAndSortedCryptos = useMemo(() => {
    let filtered = cryptos;
    
    if (searchQuery) {
      filtered = cryptos.filter(crypto => 
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'popularity') {
        return b.popularity - a.popularity;
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, sortBy]);

  const toggleCrypto = (cryptoId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      if (selected.includes(cryptoId)) {
        onChange(selected.filter(id => id !== cryptoId));
      } else if (selected.length < maxSelection) {
        onChange([...selected, cryptoId]);
      }
    } else {
      // Single select
      if (selected.includes(cryptoId)) {
        onChange(selected.filter(id => id !== cryptoId));
      } else {
        onChange([cryptoId]);
      }
    }
  };

  const selectAll = () => {
    const allIds = filteredAndSortedCryptos.map(c => c.id).slice(0, maxSelection);
    onChange(allIds);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar criptomoeda..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 
                     rounded-lg text-white placeholder-gray-500
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 
                     transition-all"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy('popularity')}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                sortBy === 'popularity'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Popular
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                sortBy === 'name'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              A-Z
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selected.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-sm rounded-full"
              >
                {selected.length} selecionada{selected.length > 1 ? 's' : ''}
              </motion.span>
            )}
            <button
              onClick={selectAll}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Selecionar tudo
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Crypto Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedCryptos.map((crypto, index) => {
            const isSelected = selected.includes(crypto.id);
            const isHovered = hoveredCrypto === crypto.id;

            return (
              <motion.button
                key={crypto.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: 0.2,
                  delay: index * 0.02
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => toggleCrypto(crypto.id, e)}
                onMouseEnter={() => setHoveredCrypto(crypto.id)}
                onMouseLeave={() => setHoveredCrypto(null)}
                className={`relative p-4 rounded-xl border transition-all duration-200 
                         transform perspective-1000 ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
                style={{
                  transform: isHovered 
                    ? 'rotateY(-5deg) rotateX(5deg) translateZ(10px)' 
                    : 'rotateY(0) rotateX(0) translateZ(0)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Glow Effect */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-50"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.5)',
                        '0 0 40px rgba(59, 130, 246, 0.3)',
                        '0 0 20px rgba(59, 130, 246, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Trending Badge */}
                {crypto.trending && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 
                             text-white text-[10px] px-1.5 py-0.5 rounded-full
                             flex items-center gap-0.5"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Hot
                  </motion.div>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <motion.div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${crypto.color} 
                             flex items-center justify-center text-white font-bold text-xl
                             shadow-lg`}
                    animate={{
                      rotate: isHovered ? 360 : 0,
                      scale: isHovered ? 1.1 : 1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {crypto.icon}
                  </motion.div>
                  
                  <div className="text-center">
                    <div className="font-medium text-white">{crypto.symbol}</div>
                    <div className="text-xs text-gray-400">{crypto.name}</div>
                  </div>

                  {/* Popularity Bar */}
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${crypto.popularity}%` }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                    />
                  </div>

                  {/* Selection Indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="absolute top-2 left-2 w-6 h-6 bg-blue-500 
                                 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Multi-select Hint */}
      <div className="text-center text-xs text-gray-500">
        Segure <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl</kbd> ou{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Cmd</kbd> para selecionar várias
      </div>
    </div>
  );
};

export default CryptoSelector;