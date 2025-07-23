'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { 
  QrCode, 
  Building2, 
  Bitcoin, 
  CreditCard,
  CheckCircle2,
  Info,
  Zap,
  Clock,
  Shield
} from 'lucide-react';

export type PaymentMethodType = 'PIX' | 'TED' | 'CRYPTO' | 'CARD';

interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  features: string[];
  processingTime: string;
  fee?: string;
  popular?: boolean;
}

interface IPaymentMethodsProps {
  selectedMethod?: PaymentMethodType;
  onSelect?: (method: PaymentMethodType) => void;
  availableMethods?: PaymentMethodType[];
  showDetails?: boolean;
  className?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'PIX',
    name: 'PIX',
    description: 'Transferência instantânea 24/7',
    icon: <QrCode className="w-8 h-8" />,
    color: 'from-teal-500 to-cyan-600',
    gradient: 'from-teal-50 to-cyan-50',
    features: ['Instantâneo', 'Sem taxas', 'QR Code'],
    processingTime: 'Imediato',
    popular: true
  },
  {
    id: 'TED',
    name: 'TED/DOC',
    description: 'Transferência bancária tradicional',
    icon: <Building2 className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-600',
    gradient: 'from-blue-50 to-indigo-50',
    features: ['Seguro', 'Comprovante', 'Todos os bancos'],
    processingTime: '1-2 dias úteis',
    fee: 'Taxa bancária'
  },
  {
    id: 'CRYPTO',
    name: 'Cripto',
    description: 'Bitcoin e outras criptomoedas',
    icon: <Bitcoin className="w-8 h-8" />,
    color: 'from-orange-500 to-amber-600',
    gradient: 'from-orange-50 to-amber-50',
    features: ['Descentralizado', 'Global', 'Anônimo'],
    processingTime: '10-60 min',
    fee: 'Taxa de rede'
  },
  {
    id: 'CARD',
    name: 'Cartão',
    description: 'Crédito ou débito',
    icon: <CreditCard className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-600',
    gradient: 'from-purple-50 to-pink-50',
    features: ['Rápido', 'Parcelamento', 'Proteção'],
    processingTime: 'Imediato',
    fee: '2.5%'
  }
];

export function PaymentMethods({
  selectedMethod,
  onSelect,
  availableMethods,
  showDetails = true,
  className
}: IPaymentMethodsProps) {
  const [hoveredMethod, setHoveredMethod] = useState<PaymentMethodType | null>(null);

  const methods = paymentMethods.filter(
    method => !availableMethods || availableMethods.includes(method.id)
  );

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method, index) => {
          const isSelected = selectedMethod === method.id;
          const isHovered = hoveredMethod === method.id;

          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredMethod(method.id)}
              onHoverEnd={() => setHoveredMethod(null)}
              onClick={() => onSelect?.(method.id)}
              className={cn(
                'relative cursor-pointer group',
                'transform transition-all duration-300',
                isSelected && 'scale-[1.02]'
              )}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Popular Badge */}
              {method.popular && (
                <motion.div
                  className="absolute -top-2 -right-2 z-20"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    <Zap className="w-3 h-3 inline mr-1" />
                    Popular
                  </div>
                </motion.div>
              )}

              {/* Card */}
              <div
                className={cn(
                  'relative overflow-hidden rounded-2xl',
                  'border-2 transition-all duration-300',
                  'bg-white shadow-lg hover:shadow-2xl',
                  isSelected
                    ? 'border-transparent ring-4 ring-blue-500 ring-opacity-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div
                    className={cn('absolute inset-0 bg-gradient-to-br', method.color)}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
                    }}
                    animate={{
                      x: isHovered ? [0, 35] : 0,
                    }}
                    transition={{
                      duration: 2,
                      repeat: isHovered ? Infinity : 0,
                      ease: 'linear',
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className={cn(
                        'p-3 rounded-xl bg-gradient-to-br',
                        method.gradient,
                        'shadow-inner'
                      )}
                      animate={{
                        rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className={cn('bg-gradient-to-br', method.color, 'bg-clip-text text-transparent')}>
                        {method.icon}
                      </div>
                    </motion.div>

                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Method Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{method.description}</p>

                  {/* Features */}
                  {showDetails && (
                    <div className="space-y-2">
                      {/* Processing Time */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Processamento: <strong>{method.processingTime}</strong>
                        </span>
                      </div>

                      {/* Fee */}
                      {method.fee && (
                        <div className="flex items-center gap-2 text-sm">
                          <Info className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Taxa: <strong>{method.fee}</strong>
                          </span>
                        </div>
                      )}

                      {/* Feature Pills */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {method.features.map((feature, idx) => (
                          <motion.span
                            key={idx}
                            className={cn(
                              'px-3 py-1 text-xs font-medium rounded-full',
                              'bg-gradient-to-r',
                              method.gradient,
                              'text-gray-700'
                            )}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                          >
                            {feature}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                <motion.div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0',
                    method.color,
                    'pointer-events-none'
                  )}
                  animate={{
                    opacity: isHovered ? 0.05 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Note */}
      {showDetails && (
        <motion.div
          className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Todos os métodos de pagamento são processados com segurança através do nosso sistema de escrow protegido.
          </p>
        </motion.div>
      )}
    </div>
  );
}