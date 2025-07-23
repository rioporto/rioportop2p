'use client';

import { motion } from 'framer-motion';
import { CheckIcon, SparklesIcon, ClockIcon, StarIcon, TrendingUpIcon, CrownIcon } from '@heroicons/react/24/solid';

export type BadgeType = 'verified' | 'top-trader' | 'fast-response' | 'new' | 'trending' | 'premium';

interface BadgeConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  bgGradient: string;
  iconColor: string;
  animation: string;
}

const badgeConfigs: Record<BadgeType, BadgeConfig> = {
  verified: {
    icon: CheckIcon,
    label: 'Verificado',
    bgGradient: 'from-blue-400 to-blue-600',
    iconColor: 'text-white',
    animation: 'animate-pulse'
  },
  'top-trader': {
    icon: StarIcon,
    label: 'Top Trader',
    bgGradient: 'from-yellow-400 to-orange-500',
    iconColor: 'text-white',
    animation: 'animate-spin-slow'
  },
  'fast-response': {
    icon: ClockIcon,
    label: 'Resposta Rápida',
    bgGradient: 'from-green-400 to-emerald-600',
    iconColor: 'text-white',
    animation: 'animate-bounce'
  },
  new: {
    icon: SparklesIcon,
    label: 'Novo',
    bgGradient: 'from-purple-400 to-pink-600',
    iconColor: 'text-white',
    animation: 'animate-pulse'
  },
  trending: {
    icon: TrendingUpIcon,
    label: 'Em Alta',
    bgGradient: 'from-red-400 to-rose-600',
    iconColor: 'text-white',
    animation: 'animate-bounce'
  },
  premium: {
    icon: CrownIcon,
    label: 'Premium',
    bgGradient: 'from-indigo-400 via-purple-500 to-pink-500',
    iconColor: 'text-white',
    animation: 'animate-shimmer'
  }
};

interface ListingBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ListingBadge({ type, size = 'md', showLabel = true }: ListingBadgeProps) {
  const config = badgeConfigs[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-6 text-xs',
    md: 'h-8 text-sm',
    lg: 'h-10 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        bg-gradient-to-r ${config.bgGradient}
        ${sizeClasses[size]}
        shadow-lg shadow-black/20
        relative overflow-hidden
        ${type === 'premium' ? 'animate-gradient-x' : ''}
      `}
    >
      {/* Shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine" />
      
      <Icon className={`${iconSizes[size]} ${config.iconColor} ${config.animation} relative z-10`} />
      
      {showLabel && (
        <span className="font-semibold text-white relative z-10">
          {config.label}
        </span>
      )}
    </motion.div>
  );
}

interface ListingBadgesProps {
  badges: BadgeType[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function ListingBadges({ badges, size = 'md', showLabels = true }: ListingBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <motion.div
          key={badge}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ListingBadge type={badge} size={size} showLabel={showLabels} />
        </motion.div>
      ))}
    </div>
  );
}

// Componente para status de transação
interface TransactionStatusBadgeProps {
  type: 'buy' | 'sell';
  pulse?: boolean;
}

export function TransactionStatusBadge({ type, pulse = true }: TransactionStatusBadgeProps) {
  const config = {
    buy: {
      label: 'COMPRA',
      gradient: 'from-green-400 to-emerald-600',
      shadow: 'shadow-green-500/50'
    },
    sell: {
      label: 'VENDA',
      gradient: 'from-blue-400 to-indigo-600',
      shadow: 'shadow-blue-500/50'
    }
  };

  const { label, gradient, shadow } = config[type];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        relative inline-flex items-center justify-center
        px-4 py-2 rounded-lg font-bold text-white
        bg-gradient-to-r ${gradient}
        ${shadow} shadow-lg
        ${pulse ? 'animate-pulse' : ''}
      `}
    >
      {/* 3D effect */}
      <div className={`
        absolute inset-0 rounded-lg
        bg-gradient-to-r ${gradient}
        blur-md opacity-50 -z-10
        ${pulse ? 'animate-pulse' : ''}
      `} />
      
      <span className="relative z-10">{label}</span>
    </motion.div>
  );
}