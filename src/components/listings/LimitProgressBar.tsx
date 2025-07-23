'use client';

import { motion } from 'framer-motion';

interface LimitProgressBarProps {
  min: number;
  max: number;
  current?: number;
  currency?: string;
  animated?: boolean;
}

export function LimitProgressBar({ 
  min, 
  max, 
  current,
  currency = 'BRL',
  animated = true 
}: LimitProgressBarProps) {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate percentage for current position
  const currentPercentage = current 
    ? ((current - min) / (max - min)) * 100 
    : null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-gray-600 dark:text-gray-400">
          Mín: {formatValue(min)}
        </span>
        {current && (
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-blue-600 dark:text-blue-400"
          >
            Atual: {formatValue(current)}
          </motion.span>
        )}
        <span className="text-gray-600 dark:text-gray-400">
          Máx: {formatValue(max)}
        </span>
      </div>
      
      <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 opacity-50" />
        
        {/* Progress bar */}
        <motion.div
          initial={animated ? { width: 0 } : undefined}
          animate={animated ? { width: '100%' } : undefined}
          transition={animated ? { duration: 1, ease: 'easeOut' } : undefined}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"
          style={{ width: '100%' }}
        >
          {/* Animated stripes */}
          <div className="absolute inset-0 bg-stripes opacity-20 animate-slide" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
        </motion.div>
        
        {/* Current position indicator */}
        {currentPercentage !== null && (
          <motion.div
            initial={animated ? { left: 0 } : undefined}
            animate={animated ? { left: `${currentPercentage}%` } : undefined}
            transition={animated ? { duration: 1, ease: 'easeOut', delay: 0.5 } : undefined}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${currentPercentage}%` }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-4 h-4 bg-white dark:bg-gray-900 border-2 border-blue-500 rounded-full shadow-lg shadow-blue-500/50"
            />
          </motion.div>
        )}
        
        {/* Min/Max markers */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full" />
      </div>
    </div>
  );
}