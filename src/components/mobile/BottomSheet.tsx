import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useKeyboardHeight, useHaptic } from '@/hooks/useResponsive';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  maxHeight?: string;
  onSnapChange?: (snapIndex: number) => void;
  backdropOpacity?: number;
  preventScroll?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.25, 0.5, 0.9],
  initialSnap = 1,
  showHandle = true,
  showCloseButton = true,
  maxHeight = '90vh',
  onSnapChange,
  backdropOpacity = 0.5,
  preventScroll = true,
}) => {
  const { theme } = useTheme();
  const keyboardHeight = useKeyboardHeight();
  const haptic = useHaptic();
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [sheetHeight, setSheetHeight] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Motion values
  const y = useMotionValue(0);
  const dragProgress = useTransform(
    y,
    [0, window.innerHeight],
    [0, 100]
  );
  
  // Spring animation for smoother drag
  const springY = useSpring(y, {
    stiffness: 400,
    damping: 40,
    mass: 0.5,
  });

  // Calculate sheet height based on snap point
  useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight - keyboardHeight;
      const snapHeight = windowHeight * snapPoints[currentSnap];
      setSheetHeight(snapHeight);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, [currentSnap, snapPoints, keyboardHeight]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen && preventScroll) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, preventScroll]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    haptic.light();
    onClose();
  }, [onClose, haptic]);

  // Handle drag end with velocity and distance checks
  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const distance = info.offset.y;
    const windowHeight = window.innerHeight;
    
    // Fechar se arrastar rápido para baixo ou mais de 40% da altura
    if (velocity > 500 || distance > windowHeight * 0.4) {
      haptic.medium();
      onClose();
      return;
    }

    // Encontrar o snap point mais próximo
    const currentY = info.point.y;
    const snapHeights = snapPoints.map(point => windowHeight * (1 - point));
    const closestSnap = snapHeights.reduce((prev, curr) => {
      return Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev;
    });
    
    const newSnapIndex = snapHeights.indexOf(closestSnap);
    
    // Feedback tátil ao mudar de snap
    if (newSnapIndex !== currentSnap) {
      haptic.light();
    }
    
    setCurrentSnap(newSnapIndex);
    onSnapChange?.(newSnapIndex);
  }, [snapPoints, currentSnap, onClose, haptic, onSnapChange]);

  // Monitorar progresso do drag para feedback
  useEffect(() => {
    const unsubscribe = dragProgress.onChange(value => {
      // Feedback tátil em pontos específicos do drag
      if (value > 25 && value < 30) haptic.light();
      if (value > 50 && value < 55) haptic.light();
      if (value > 75 && value < 80) haptic.medium();
    });

    return () => unsubscribe();
  }, [dragProgress, haptic]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop com blur e opacidade dinâmica */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: backdropOpacity }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="
              fixed inset-0 z-40
              bg-black backdrop-blur-sm
              transition-opacity duration-300
            "
            style={{
              opacity: useTransform(dragProgress, [0, 100], [backdropOpacity, 0])
            }}
          />

          {/* Sheet com animações suaves */}
          <motion.div
            ref={sheetRef}
            style={{
              y: springY,
              maxHeight,
              touchAction: 'none',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0, height: sheetHeight }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 40,
              stiffness: 400,
              mass: 1,
            }}
            drag="y"
            dragElastic={0.2}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
            onDragEnd={handleDragEnd}
            className={`
              fixed bottom-0 left-0 right-0 z-50
              rounded-t-3xl overflow-hidden
              ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
              shadow-2xl
              transition-shadow duration-300
              ${dragProgress.get() > 50 ? 'shadow-xl' : 'shadow-2xl'}
            `}
          >
            {/* Handle com feedback visual */}
            {showHandle && (
              <motion.div 
                className="flex justify-center p-3 cursor-grab active:cursor-grabbing"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`
                    w-12 h-1 rounded-full
                    ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}
                  `}
                  animate={{
                    scale: [1, 1.1, 1],
                    transition: { duration: 2, repeat: Infinity }
                  }}
                />
              </motion.div>
            )}

            {/* Header com animação */}
            {(title || showCloseButton) && (
              <motion.div 
                className="flex items-center justify-between px-6 pb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold">
                  {title}
                </h3>
                {showCloseButton && (
                  <motion.button
                    onClick={() => {
                      haptic.light();
                      onClose();
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${theme === 'dark'
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-100'
                      }
                    `}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Content com scroll suave */}
            <motion.div
              ref={contentRef}
              className="px-6 pb-6 overflow-y-auto"
              style={{
                maxHeight: `calc(${sheetHeight}px - ${showHandle ? '48px' : '0px'} - ${title || showCloseButton ? '60px' : '0px'})`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>

            {/* Keyboard spacer com animação */}
            {keyboardHeight > 0 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: keyboardHeight }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Action Sheet variant
interface ActionSheetOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  onSelect: (optionId: string) => void;
  title?: string;
  message?: string;
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  options,
  onSelect,
  title,
  message,
  cancelLabel = 'Cancelar',
}) => {
  const { theme } = useTheme();
  const haptic = useHaptic();

  const handleSelect = (option: ActionSheetOption) => {
    if (!option.disabled) {
      haptic.light();
      onSelect(option.id);
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[1]}
      initialSnap={0}
      showHandle={false}
      showCloseButton={false}
    >
      {/* Header */}
      {(title || message) && (
        <div className="text-center mb-4">
          {title && (
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </h3>
          )}
          {message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
          )}
        </div>
      )}

      {/* Options */}
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            disabled={option.disabled}
            className={`
              w-full flex items-center justify-center gap-3
              py-3 px-4 rounded-xl
              transition-all duration-200
              ${option.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'active:scale-95'
              }
              ${option.destructive
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                : theme === 'dark'
                ? 'hover:bg-gray-800'
                : 'hover:bg-gray-100'
              }
            `}
          >
            {option.icon && (
              <span className="w-5 h-5">{option.icon}</span>
            )}
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Cancel button */}
      <button
        onClick={() => {
          haptic.light();
          onClose();
        }}
        className={`
          w-full mt-4 py-3 px-4 rounded-xl
          font-medium transition-all duration-200
          active:scale-95
          ${theme === 'dark'
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-gray-100 hover:bg-gray-200'
          }
        `}
      >
        {cancelLabel}
      </button>
    </BottomSheet>
  );
};