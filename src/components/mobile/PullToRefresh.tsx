import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useHaptic } from '@/hooks/useResponsive';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 70,
  maxPull = 150,
  disabled = false,
  className = '',
}) => {
  const { theme } = useTheme();
  const haptic = useHaptic();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshState, setRefreshState] = useState<'idle' | 'pulling' | 'releasing' | 'refreshing' | 'complete'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);

  // Calculate pull progress
  const pullProgress = Math.min(pullDistance / threshold, 1);
  const isPullThresholdReached = pullDistance >= threshold;

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    startY.current = touch.clientY;
    isDragging.current = true;
    
    // Check if we're at the top of the scrollable area
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0) {
      setRefreshState('pulling');
    }
  }, [disabled, isRefreshing]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const diff = currentY - startY.current;
    
    // Only allow pull down when at the top
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0 && diff > 0) {
      e.preventDefault();
      
      // Apply resistance
      const resistance = 0.5;
      const resistedDiff = diff * resistance;
      const distance = Math.min(resistedDiff, maxPull);
      
      setPullDistance(distance);
      
      // Haptic feedback at threshold
      if (distance >= threshold && pullDistance < threshold) {
        haptic.light();
      }
    }
  }, [disabled, isRefreshing, pullDistance, threshold, maxPull, haptic]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    isDragging.current = false;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setRefreshState('releasing');
      setIsRefreshing(true);
      haptic.success();
      
      // Keep the loader visible during refresh
      setPullDistance(threshold);
      
      try {
        setRefreshState('refreshing');
        await onRefresh();
        setRefreshState('complete');
        haptic.medium();
        
        // Show complete state briefly
        setTimeout(() => {
          setPullDistance(0);
          setRefreshState('idle');
          setIsRefreshing(false);
        }, 500);
      } catch (error) {
        haptic.error();
        setPullDistance(0);
        setRefreshState('idle');
        setIsRefreshing(false);
      }
    } else {
      // Snap back
      setPullDistance(0);
      setRefreshState('idle');
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh, haptic]);

  // iOS-style rubber band effect
  const getTransform = () => {
    if (pullDistance > 0) {
      return `translateY(${pullDistance}px)`;
    }
    return 'translateY(0)';
  };

  // Loader icon rotation
  const getLoaderRotation = () => {
    if (refreshState === 'refreshing') {
      return 'animate-spin';
    }
    return '';
  };

  // Loader scale based on pull progress
  const getLoaderScale = () => {
    if (refreshState === 'complete') return 1.2;
    if (refreshState === 'refreshing') return 1;
    return 0.5 + (pullProgress * 0.5);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 10 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: pullProgress,
              scale: getLoaderScale(),
            }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center z-50"
            style={{
              transform: `translateY(${Math.max(pullDistance - 40, 10)}px)`,
            }}
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                shadow-lg
              `}
            >
              <ArrowPathIcon
                className={`
                  w-6 h-6 transition-all duration-300
                  ${getLoaderRotation()}
                  ${isPullThresholdReached || isRefreshing
                    ? 'text-primary-500'
                    : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-600'
                  }
                  ${refreshState === 'complete' ? 'text-green-500' : ''}
                `}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-full overflow-y-auto"
        style={{
          transform: getTransform(),
          transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Custom loading indicator component
interface RefreshIndicatorProps {
  progress: number;
  isRefreshing: boolean;
  theme: 'light' | 'dark';
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  progress,
  isRefreshing,
  theme,
}) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className="transform transition-transform"
      style={{
        transform: `rotate(${progress * 180}deg)`,
      }}
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
        strokeWidth="2"
      />
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray={`${progress * 113} 113`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        className={isRefreshing ? 'animate-pulse' : ''}
      />
    </svg>
  );
};

// Simplified pull to refresh hook
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const haptic = useHaptic();

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    haptic.medium();
    
    try {
      await onRefresh();
      haptic.success();
    } catch (error) {
      haptic.error();
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh, haptic]);

  return {
    isRefreshing,
    refresh,
  };
};