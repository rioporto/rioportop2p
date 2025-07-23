import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, Info, Zap, Building2, CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  popularity: number;
  instantaneous: boolean;
  fee: string;
}

interface PaymentMethodFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'PIX',
    name: 'PIX',
    description: 'Transferência instantânea 24/7',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-cyan-400 to-teal-500',
    popularity: 95,
    instantaneous: true,
    fee: 'Sem taxas'
  },
  {
    id: 'TED',
    name: 'TED',
    description: 'Transferência no mesmo dia',
    icon: <Building2 className="w-5 h-5" />,
    color: 'from-blue-400 to-blue-600',
    popularity: 70,
    instantaneous: false,
    fee: 'R$ 5-10'
  },
  {
    id: 'DEBIT',
    name: 'Cartão de Débito',
    description: 'Débito instantâneo',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'from-purple-400 to-purple-600',
    popularity: 60,
    instantaneous: true,
    fee: '1.5% - 2.5%'
  },
  {
    id: 'CREDIT',
    name: 'Cartão de Crédito',
    description: 'Parcelamento disponível',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'from-pink-400 to-pink-600',
    popularity: 50,
    instantaneous: true,
    fee: '2.5% - 3.5%'
  },
  {
    id: 'PICPAY',
    name: 'PicPay',
    description: 'Carteira digital',
    icon: <Smartphone className="w-5 h-5" />,
    color: 'from-green-400 to-green-600',
    popularity: 40,
    instantaneous: true,
    fee: 'Sem taxas'
  },
  {
    id: 'MERCADOPAGO',
    name: 'Mercado Pago',
    description: 'Carteira digital completa',
    icon: <Smartphone className="w-5 h-5" />,
    color: 'from-yellow-400 to-yellow-600',
    popularity: 45,
    instantaneous: true,
    fee: 'Sem taxas'
  }
];

const PaymentMethodFilter: React.FC<PaymentMethodFilterProps> = ({ selected, onChange }) => {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const toggleMethod = (methodId: string) => {
    if (selected.includes(methodId)) {
      onChange(selected.filter(id => id !== methodId));
    } else {
      onChange([...selected, methodId]);
    }
  };

  const selectAll = () => {
    onChange(paymentMethods.map(m => m.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Métodos populares primeiro</span>
          <TrendingUp className="w-4 h-4 text-gray-500" />
        </div>
        
        <div className="flex items-center gap-3">
          {selected.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 bg-green-500/20 text-green-400 text-sm rounded-full"
            >
              {selected.length} selecionado{selected.length > 1 ? 's' : ''}
            </motion.span>
          )}
          <button
            onClick={selectAll}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Selecionar todos
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {paymentMethods
            .sort((a, b) => b.popularity - a.popularity)
            .map((method, index) => {
              const isSelected = selected.includes(method.id);
              const isHovered = hoveredMethod === method.id;

              return (
                <motion.div
                  key={method.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMethod(method.id)}
                    onMouseEnter={() => setHoveredMethod(method.id)}
                    onMouseLeave={() => setHoveredMethod(null)}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 
                             relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-green-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {/* Background Animation */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${method.color} opacity-0`}
                      animate={{
                        opacity: isHovered ? 0.1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Flip Animation Container */}
                    <motion.div
                      className="relative z-10"
                      animate={{
                        rotateY: isSelected ? 180 : 0
                      }}
                      transition={{ duration: 0.6, type: 'spring' }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front Side */}
                      <div className="flex items-start gap-3" style={{ backfaceVisibility: 'hidden' }}>
                        <motion.div
                          className={`p-2.5 rounded-lg bg-gradient-to-r ${method.color}`}
                          animate={{
                            rotate: isHovered ? 360 : 0
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {method.icon}
                        </motion.div>

                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{method.name}</h4>
                            {method.instantaneous && (
                              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 
                                           text-[10px] rounded-full flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Instantâneo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{method.description}</p>
                          
                          {/* Popularity Bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${method.popularity}%` }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500">{method.popularity}%</span>
                          </div>
                        </div>

                        {/* Info Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltip(showTooltip === method.id ? null : method.id);
                          }}
                          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Info className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* Back Side (Selected State) */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 text-green-400"
                        >
                          <Check className="w-5 h-5" />
                          <span className="font-medium">Selecionado</span>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-green-500 
                                   rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {showTooltip === method.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 right-0 mb-2 p-3 
                                 bg-gray-800 border border-gray-700 rounded-lg 
                                 shadow-xl z-20"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Taxa:</span>
                            <span className="text-xs text-white font-medium">{method.fee}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Popularidade:</span>
                            <div className="flex items-center gap-1">
                              <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                  style={{ width: `${method.popularity}%` }}
                                />
                              </div>
                              <span className="text-xs text-white">{method.popularity}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentMethodFilter;