import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView as useFramerInView, useAnimation as useFramerAnimation, AnimationControls } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

/* =============================================================================
   HOOKS DE ANIMAÇÃO CUSTOMIZADOS - RIO PORTO P2P
   ============================================================================= */

// =============================================================================
// useScrollAnimation - Animações baseadas em scroll
// =============================================================================
export const useScrollAnimation = (threshold = 0.1, triggerOnce = true) => {
  const ref = useRef(null);
  const isInView = useFramerInView(ref, { 
    amount: threshold,
    once: triggerOnce 
  });
  const controls = useFramerAnimation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      controls.set({ opacity: 1, y: 0 });
      return;
    }

    if (isInView) {
      controls.start({ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      });
    }
  }, [isInView, controls, prefersReducedMotion]);

  return { ref, controls, isInView };
};

// =============================================================================
// useHoverAnimation - Animações de hover com gesture
// =============================================================================
export const useHoverAnimation = (
  hoverScale = 1.05,
  tapScale = 0.95,
  duration = 0.2
) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const animationProps = prefersReducedMotion ? {} : {
    whileHover: { scale: hoverScale },
    whileTap: { scale: tapScale },
    transition: { duration, ease: 'easeOut' },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
    onTapStart: () => setIsTapped(true),
    onTapEnd: () => setIsTapped(false),
  };

  return { animationProps, isHovered, isTapped };
};

// =============================================================================
// useInView - Detecta quando elemento está visível
// =============================================================================
export const useInView = (
  options?: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  }
) => {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        
        if (inView && options?.triggerOnce && hasTriggered) {
          return;
        }

        setIsInView(inView);
        if (inView) {
          setHasTriggered(true);
        }
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options?.threshold, options?.rootMargin, options?.triggerOnce, hasTriggered]);

  return { ref, isInView };
};

// =============================================================================
// useParallax - Efeito parallax baseado em scroll
// =============================================================================
export const useParallax = (offset = 50) => {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calcula a posição relativa do elemento na viewport
      const scrollProgress = (windowHeight - elementTop) / (windowHeight + elementHeight);
      const parallaxOffset = (scrollProgress - 0.5) * offset;

      setScrollY(parallaxOffset);
    };

    const debouncedScroll = debounce(handleScroll, 10);
    
    window.addEventListener('scroll', debouncedScroll);
    handleScroll(); // Calcula posição inicial

    return () => {
      window.removeEventListener('scroll', debouncedScroll);
    };
  }, [offset, prefersReducedMotion]);

  return { ref, offset: scrollY };
};

// =============================================================================
// useCountAnimation - Anima contagem de números
// =============================================================================
export const useCountAnimation = (
  endValue: number,
  duration = 2000,
  startValue = 0
) => {
  const [count, setCount] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const startAnimation = useCallback(() => {
    if (prefersReducedMotion) {
      setCount(endValue);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const delta = endValue - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + delta * easedProgress;

      setCount(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [endValue, startValue, duration, prefersReducedMotion]);

  return { count, startAnimation, isAnimating };
};

// =============================================================================
// useTypewriter - Efeito de digitação
// =============================================================================
export const useTypewriter = (
  text: string,
  speed = 50,
  startDelay = 0
) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const startTyping = useCallback(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    setIsComplete(false);

    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        setIsComplete(true);
      }
    };

    setTimeout(typeNextChar, startDelay);
  }, [text, speed, startDelay, prefersReducedMotion]);

  const reset = useCallback(() => {
    setDisplayedText('');
    setIsTyping(false);
    setIsComplete(false);
  }, []);

  return { displayedText, isTyping, isComplete, startTyping, reset };
};

// =============================================================================
// useStaggerChildren - Anima children com delay
// =============================================================================
export const useStaggerChildren = (
  staggerDelay = 0.1,
  initialDelay = 0
) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: initialDelay,
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return { containerVariants, itemVariants };
};

// =============================================================================
// useAnimationState - Gerencia estados de animação
// =============================================================================
export const useAnimationState = (initialState = 'idle') => {
  const [state, setState] = useState(initialState);
  const controls = useFramerAnimation();

  const animateToState = useCallback(async (newState: string, animation: any) => {
    setState(newState);
    await controls.start(animation);
  }, [controls]);

  return { state, controls, animateToState };
};

// =============================================================================
// useGestureAnimation - Animações baseadas em gestos
// =============================================================================
export const useGestureAnimation = () => {
  const [gesture, setGesture] = useState<'idle' | 'dragging' | 'swiping'>('idle');
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const handleDragStart = useCallback(() => {
    setGesture('dragging');
  }, []);

  const handleDragEnd = useCallback((event: any, info: any) => {
    const { velocity } = info;
    const threshold = 500;

    if (Math.abs(velocity.x) > threshold || Math.abs(velocity.y) > threshold) {
      setGesture('swiping');
      
      if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
        setDirection(velocity.x > 0 ? 'right' : 'left');
      } else {
        setDirection(velocity.y > 0 ? 'down' : 'up');
      }
    } else {
      setGesture('idle');
      setDirection(null);
    }

    // Reset após animação
    setTimeout(() => {
      setGesture('idle');
      setDirection(null);
    }, 300);
  }, []);

  return {
    gesture,
    direction,
    dragHandlers: {
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
    },
  };
};

// =============================================================================
// useScrollProgress - Progresso de scroll
// =============================================================================
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = window.scrollY / totalHeight;
      setProgress(Math.min(Math.max(currentProgress, 0), 1));
    };

    const debouncedScroll = debounce(handleScroll, 10);
    
    window.addEventListener('scroll', debouncedScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedScroll);
    };
  }, []);

  return progress;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// =============================================================================
// useAnimationTrigger - Trigger manual de animações
// =============================================================================
export const useAnimationTrigger = () => {
  const controls = useFramerAnimation();
  const prefersReducedMotion = useReducedMotion();

  const trigger = useCallback(async (animation: any) => {
    if (prefersReducedMotion) {
      // Skip animation mas ainda atualiza o estado
      await controls.set(animation);
    } else {
      await controls.start(animation);
    }
  }, [controls, prefersReducedMotion]);

  const reset = useCallback(async (initialState: any) => {
    await controls.set(initialState);
  }, [controls]);

  return { trigger, reset, controls };
};

// =============================================================================
// useElementSize - Monitora tamanho do elemento
// =============================================================================
export const useElementSize = () => {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { ref, size };
};