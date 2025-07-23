'use client';

import { motion } from 'framer-motion';
import { PaymentMethod } from '@/types/listings';

interface PaymentMethodConfig {
  label: string;
  gradient: string;
  icon: string;
  shadowColor: string;
}

const paymentMethodConfigs: Record<PaymentMethod, PaymentMethodConfig> = {
  PIX: {
    label: 'PIX',
    gradient: 'from-teal-400 to-cyan-600',
    icon: '⚡',
    shadowColor: 'shadow-teal-500/30'
  },
  TED: {
    label: 'TED',
    gradient: 'from-blue-400 to-indigo-600',
    icon: '🏦',
    shadowColor: 'shadow-blue-500/30'
  },
  BANK_TRANSFER: {
    label: 'Transferência',
    gradient: 'from-purple-400 to-pink-600',
    icon: '💳',
    shadowColor: 'shadow-purple-500/30'
  }
};

interface PaymentMethodChipProps {
  method: PaymentMethod;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function PaymentMethodChip({ method, size = 'md', animated = true }: PaymentMethodChipProps) {
  const config = paymentMethodConfigs[method];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <motion.div
      initial={animated ? { scale: 0, rotateY: -180 } : undefined}
      animate={animated ? { scale: 1, rotateY: 0 } : undefined}
      whileHover={{ 
        scale: 1.05,
        rotateY: 10,
        transition: { type: 'spring', stiffness: 300 }
      }}
      whileTap={{ scale: 0.95 }}
      className="inline-block perspective-1000"
    >
      <div className={`
        relative ${sizeClasses[size]} rounded-lg font-medium text-white
        bg-gradient-to-r ${config.gradient}
        ${config.shadowColor} shadow-lg
        transform-gpu transition-all duration-200
        hover:shadow-xl
        before:absolute before:inset-0 before:rounded-lg
        before:bg-gradient-to-r before:${config.gradient}
        before:opacity-0 before:blur-xl before:transition-opacity
        hover:before:opacity-50
      `}>
        {/* 3D effect layer */}
        <div className="absolute inset-0 rounded-lg bg-black/20 transform translate-y-0.5 -z-10" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-1">
          <span className="text-base">{config.icon}</span>
          <span>{config.label}</span>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] animate-shine-slow" />
        </div>
      </div>
    </motion.div>
  );
}

interface PaymentMethodChipsProps {
  methods: PaymentMethod[];
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function PaymentMethodChips({ methods, size = 'md', animated = true }: PaymentMethodChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {methods.map((method, index) => (
        <motion.div
          key={method}
          initial={animated ? { opacity: 0, x: -20 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={animated ? { delay: index * 0.1 } : undefined}
        >
          <PaymentMethodChip method={method} size={size} animated={animated} />
        </motion.div>
      ))}
    </div>
  );
}