'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pageVariants } from '@/lib/animations/variants';

/* =============================================================================
   PAGE TRANSITION COMPONENT - RIO PORTO P2P
   
   Componente para transições suaves entre páginas
   ============================================================================= */

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof pageVariants;
  duration?: number;
}

export default function PageTransition({
  children,
  className = '',
  variant = 'fade',
  duration
}: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Detecta tipo de transição baseado na rota
  const getTransitionVariant = () => {
    // Dashboard -> outras páginas: slide right
    if (pathname.startsWith('/dashboard') && !pathname.includes('/dashboard')) {
      return 'slideRight';
    }
    
    // Login/Register: scale
    if (pathname.includes('/login') || pathname.includes('/register')) {
      return 'scale';
    }
    
    // Trading/Wallet: slide up
    if (pathname.includes('/trading') || pathname.includes('/wallet')) {
      return 'slideUp';
    }
    
    // Messages: slide left
    if (pathname.includes('/messages')) {
      return 'slideLeft';
    }

    return variant;
  };

  const selectedVariant = pageVariants[getTransitionVariant()];

  // Custom duration override
  const transitionConfig = duration
    ? { ...selectedVariant.transition, duration }
    : selectedVariant.transition;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={transitionConfig}
        className={className}
      >
        {/* Loading overlay durante transição */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="animate-spinner w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </motion.div>
        )}
        
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// =============================================================================
// PAGE TRANSITION PROVIDER
// =============================================================================

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    // Preserva scroll position
    const scrollPositions: Record<string, number> = {};
    
    // Salva posição atual
    scrollPositions[prevPathname] = window.scrollY;
    
    // Restaura posição se existir
    if (scrollPositions[pathname] !== undefined) {
      window.scrollTo(0, scrollPositions[pathname]);
    } else {
      window.scrollTo(0, 0);
    }
    
    setPrevPathname(pathname);
  }, [pathname]);

  return <>{children}</>;
}

// =============================================================================
// ROUTE TRANSITION
// =============================================================================

interface RouteTransitionProps {
  children: React.ReactNode;
  direction?: 'forward' | 'backward' | 'auto';
}

export function RouteTransition({ 
  children, 
  direction = 'auto' 
}: RouteTransitionProps) {
  const pathname = usePathname();
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [history, setHistory] = useState<string[]>([pathname]);

  useEffect(() => {
    if (direction === 'auto') {
      // Determina direção baseado no histórico
      const currentIndex = history.indexOf(pathname);
      
      if (currentIndex === -1) {
        // Nova página
        setTransitionDirection('forward');
        setHistory([...history, pathname]);
      } else if (currentIndex < history.length - 1) {
        // Voltando
        setTransitionDirection('backward');
        setHistory(history.slice(0, currentIndex + 1));
      }
    } else {
      setTransitionDirection(direction);
    }
  }, [pathname, direction, history]);

  const variant = transitionDirection === 'forward' ? 'slideLeft' : 'slideRight';

  return (
    <PageTransition variant={variant}>
      {children}
    </PageTransition>
  );
}

// =============================================================================
// MOBILE SWIPE TRANSITIONS
// =============================================================================

interface SwipeTransitionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function SwipeTransition({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100
}: SwipeTransitionProps) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(event, info) => {
        if (info.offset.x > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (info.offset.x < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// SECTION TRANSITION
// =============================================================================

interface SectionTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function SectionTransition({ 
  children, 
  delay = 0,
  className = ''
}: SectionTransitionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.4, 0, 0.2, 1] 
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// =============================================================================
// ANIMATED OUTLET (para layouts)
// =============================================================================

interface AnimatedOutletProps {
  children: React.ReactNode;
  preserveScroll?: boolean;
}

export function AnimatedOutlet({ 
  children, 
  preserveScroll = false 
}: AnimatedOutletProps) {
  const pathname = usePathname();
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    if (preserveScroll) {
      // Salva posição de scroll atual
      setScrollPositions(prev => ({
        ...prev,
        [pathname]: window.scrollY
      }));
    }
  }, [pathname, preserveScroll]);

  useEffect(() => {
    if (preserveScroll && scrollPositions[pathname] !== undefined) {
      // Restaura posição de scroll
      window.scrollTo(0, scrollPositions[pathname]);
    } else if (!preserveScroll) {
      // Scroll para o topo
      window.scrollTo(0, 0);
    }
  }, [pathname, preserveScroll, scrollPositions]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}