import React, { useRef, useState } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useHaptic } from '@/hooks/useResponsive';
import { TrashIcon, ArchiveBoxIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';

interface SwipeAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeComplete?: (direction: 'left' | 'right') => void;
  swipeThreshold?: number;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeComplete,
  swipeThreshold = 100,
  className = '',
}) => {
  const { theme } = useTheme();
  const haptic = useHaptic();
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
    haptic.light();
  };

  const handleDrag = (_: any, info: PanInfo) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Determine if swipe is complete
    if (Math.abs(offset) > swipeThreshold || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'right' : 'left';
      const actions = direction === 'left' ? rightActions : leftActions;
      
      if (actions.length > 0) {
        haptic.medium();
        // Execute the first action
        actions[0].onAction();
        onSwipeComplete?.(direction);
      }
    } else {
      // Snap back
      setDragX(0);
    }
  };

  // Calculate action reveal
  const getActionReveal = (direction: 'left' | 'right') => {
    if (direction === 'left' && dragX < 0) {
      return Math.min(Math.abs(dragX), 200);
    }
    if (direction === 'right' && dragX > 0) {
      return Math.min(dragX, 200);
    }
    return 0;
  };

  const leftReveal = getActionReveal('right');
  const rightReveal = getActionReveal('left');

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center"
          style={{
            width: leftReveal,
            opacity: leftReveal / 200,
          }}
        >
          {leftActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => {
                haptic.medium();
                action.onAction();
              }}
              className="flex-1 h-full flex flex-col items-center justify-center p-4"
              style={{
                backgroundColor: action.bgColor,
                color: action.color,
              }}
            >
              <div className="w-6 h-6 mb-1">{action.icon}</div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center"
          style={{
            width: rightReveal,
            opacity: rightReveal / 200,
          }}
        >
          {rightActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => {
                haptic.medium();
                action.onAction();
              }}
              className="flex-1 h-full flex flex-col items-center justify-center p-4"
              style={{
                backgroundColor: action.bgColor,
                color: action.color,
              }}
            >
              <div className="w-6 h-6 mb-1">{action.icon}</div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Card content */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragElastic={0.2}
        dragConstraints={{ left: -200, right: 200 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{
          x: isDragging ? dragX : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className={`
          relative z-10
          ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        style={{
          touchAction: 'pan-y',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Common swipe actions
export const commonSwipeActions = {
  delete: (onDelete: () => void): SwipeAction => ({
    id: 'delete',
    icon: <TrashIcon />,
    label: 'Excluir',
    color: '#ffffff',
    bgColor: '#ef4444',
    onAction: onDelete,
  }),
  
  archive: (onArchive: () => void): SwipeAction => ({
    id: 'archive',
    icon: <ArchiveBoxIcon />,
    label: 'Arquivar',
    color: '#ffffff',
    bgColor: '#f59e0b',
    onAction: onArchive,
  }),
  
  favorite: (onFavorite: () => void): SwipeAction => ({
    id: 'favorite',
    icon: <HeartIcon />,
    label: 'Favoritar',
    color: '#ffffff',
    bgColor: '#ec4899',
    onAction: onFavorite,
  }),
  
  share: (onShare: () => void): SwipeAction => ({
    id: 'share',
    icon: <ShareIcon />,
    label: 'Compartilhar',
    color: '#ffffff',
    bgColor: '#3b82f6',
    onAction: onShare,
  }),
};

// Swipeable list item component
interface SwipeableListItemProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  onFavorite?: () => void;
  className?: string;
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  onDelete,
  onArchive,
  onFavorite,
  className = '',
}) => {
  const leftActions: SwipeAction[] = [];
  const rightActions: SwipeAction[] = [];

  if (onFavorite) {
    leftActions.push(commonSwipeActions.favorite(onFavorite));
  }

  if (onArchive) {
    rightActions.push(commonSwipeActions.archive(onArchive));
  }

  if (onDelete) {
    rightActions.push(commonSwipeActions.delete(onDelete));
  }

  return (
    <SwipeableCard
      leftActions={leftActions}
      rightActions={rightActions}
      className={className}
    >
      {children}
    </SwipeableCard>
  );
};

// Tinder-style swipeable card
interface TinderCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const TinderCard: React.FC<TinderCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}) => {
  const haptic = useHaptic();
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      setExitX(offset > 0 ? 500 : -500);
      setExitY(info.offset.y);
      haptic.success();
      
      if (offset > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        animate={{ x: 0, y: 0 }}
        exit={{
          x: exitX,
          y: exitY,
          opacity: 0,
          transition: { duration: 0.3 },
        }}
        whileDrag={{ scale: 1.05 }}
        className={`absolute inset-0 cursor-grab active:cursor-grabbing ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};