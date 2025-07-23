import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Save, RefreshCw } from 'lucide-react';
import PriceRangeSlider from './PriceRangeSlider';
import CryptoSelector from './CryptoSelector';
import PaymentMethodFilter from './PaymentMethodFilter';
import FilterChips from './FilterChips';
import { useSearchParams } from 'react-router-dom';

interface FilterState {
  priceRange: { min: number; max: number };
  cryptos: string[];
  paymentMethods: string[];
  offerType: 'buy' | 'sell' | 'all';
  verifiedOnly: boolean;
}

interface FilterPanelProps {
  onFiltersChange: (filters: FilterState) => void;
  resultCount?: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange, resultCount = 0 }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expanded, setExpanded] = useState({
    price: true,
    crypto: true,
    payment: false,
    advanced: false
  });

  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 100000 },
    cryptos: [],
    paymentMethods: [],
    offerType: 'all',
    verifiedOnly: false
  });

  const [savedPresets, setSavedPresets] = useState<Array<{ name: string; filters: FilterState }>>([
    {
      name: 'Quick Buy BTC',
      filters: {
        priceRange: { min: 100, max: 5000 },
        cryptos: ['BTC'],
        paymentMethods: ['PIX'],
        offerType: 'buy',
        verifiedOnly: true
      }
    }
  ]);

  useEffect(() => {
    // Sync filters with URL
    const params = Object.fromEntries(searchParams);
    if (params.minPrice || params.maxPrice) {
      setFilters(prev => ({
        ...prev,
        priceRange: {
          min: Number(params.minPrice) || 0,
          max: Number(params.maxPrice) || 100000
        }
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    if (filters.priceRange.min > 0) params.set('minPrice', filters.priceRange.min.toString());
    if (filters.priceRange.max < 100000) params.set('maxPrice', filters.priceRange.max.toString());
    if (filters.cryptos.length > 0) params.set('cryptos', filters.cryptos.join(','));
    if (filters.paymentMethods.length > 0) params.set('payment', filters.paymentMethods.join(','));
    if (filters.offerType !== 'all') params.set('type', filters.offerType);
    if (filters.verifiedOnly) params.set('verified', 'true');
    
    setSearchParams(params);
    onFiltersChange(filters);
  }, [filters]);

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (range: { min: number; max: number }) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
  };

  const handleCryptoChange = (cryptos: string[]) => {
    setFilters(prev => ({ ...prev, cryptos }));
  };

  const handlePaymentChange = (methods: string[]) => {
    setFilters(prev => ({ ...prev, paymentMethods: methods }));
  };

  const removeFilter = (type: string, value?: string) => {
    if (type === 'price') {
      setFilters(prev => ({ ...prev, priceRange: { min: 0, max: 100000 } }));
    } else if (type === 'crypto' && value) {
      setFilters(prev => ({ ...prev, cryptos: prev.cryptos.filter(c => c !== value) }));
    } else if (type === 'payment' && value) {
      setFilters(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter(p => p !== value) }));
    } else if (type === 'type') {
      setFilters(prev => ({ ...prev, offerType: 'all' }));
    } else if (type === 'verified') {
      setFilters(prev => ({ ...prev, verifiedOnly: false }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 100000 },
      cryptos: [],
      paymentMethods: [],
      offerType: 'all',
      verifiedOnly: false
    });
  };

  const loadPreset = (preset: { name: string; filters: FilterState }) => {
    setFilters(preset.filters);
  };

  const activeFilterCount = 
    (filters.priceRange.min > 0 || filters.priceRange.max < 100000 ? 1 : 0) +
    filters.cryptos.length +
    filters.paymentMethods.length +
    (filters.offerType !== 'all' ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0);

  return (
    <motion.div 
      className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Filtros Avançados</h3>
              <p className="text-gray-400 text-sm">
                {activeFilterCount > 0 && `${activeFilterCount} filtros ativos • `}
                {resultCount} resultados
              </p>
            </div>
          </div>
          
          {activeFilterCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllFilters}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 
                       hover:bg-red-500/10 rounded-lg transition-colors
                       flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpar tudo
            </motion.button>
          )}
        </div>

        {/* Filter Chips */}
        <FilterChips 
          filters={filters}
          onRemove={removeFilter}
        />
      </div>

      {/* Filter Presets */}
      {savedPresets.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Save className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filtros salvos</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedPresets.map((preset, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadPreset(preset)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 
                         text-gray-300 text-sm rounded-lg transition-colors"
              >
                {preset.name}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="border-b border-gray-800">
        <button
          onClick={() => toggleSection('price')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        >
          <span className="text-white font-medium">Faixa de Preço</span>
          <motion.div
            animate={{ rotate: expanded.price ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {expanded.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0">
                <PriceRangeSlider
                  min={0}
                  max={100000}
                  value={filters.priceRange}
                  onChange={handlePriceChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Crypto Selector */}
      <div className="border-b border-gray-800">
        <button
          onClick={() => toggleSection('crypto')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        >
          <span className="text-white font-medium">Criptomoedas</span>
          <div className="flex items-center gap-2">
            {filters.cryptos.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {filters.cryptos.length}
              </span>
            )}
            <motion.div
              animate={{ rotate: expanded.crypto ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </button>
        
        <AnimatePresence>
          {expanded.crypto && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0">
                <CryptoSelector
                  selected={filters.cryptos}
                  onChange={handleCryptoChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Methods */}
      <div className="border-b border-gray-800">
        <button
          onClick={() => toggleSection('payment')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        >
          <span className="text-white font-medium">Métodos de Pagamento</span>
          <div className="flex items-center gap-2">
            {filters.paymentMethods.length > 0 && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                {filters.paymentMethods.length}
              </span>
            )}
            <motion.div
              animate={{ rotate: expanded.payment ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </button>
        
        <AnimatePresence>
          {expanded.payment && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0">
                <PaymentMethodFilter
                  selected={filters.paymentMethods}
                  onChange={handlePaymentChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters */}
      <div>
        <button
          onClick={() => toggleSection('advanced')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        >
          <span className="text-white font-medium">Filtros Avançados</span>
          <motion.div
            animate={{ rotate: expanded.advanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {expanded.advanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {/* Offer Type */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Tipo de Oferta</label>
                  <div className="flex gap-2">
                    {(['all', 'buy', 'sell'] as const).map(type => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFilters(prev => ({ ...prev, offerType: type }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          filters.offerType === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {type === 'all' ? 'Todos' : type === 'buy' ? 'Compra' : 'Venda'}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Verified Only */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                    className="w-4 h-4 bg-gray-800 border-gray-700 rounded 
                             text-blue-500 focus:ring-blue-500/20"
                  />
                  <span className="text-gray-300">Apenas vendedores verificados</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Apply Button */}
      <div className="p-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                   text-white font-medium rounded-lg relative overflow-hidden
                   group"
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
          <span className="relative flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Aplicar Filtros
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FilterPanel;