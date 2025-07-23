'use client';

import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { useInView, useParallax } from '@/hooks/useAnimation';

/* =============================================================================
   SCROLL REVEAL COMPONENTS - RIO PORTO P2P
   
   Sistema completo de animações ativadas por scroll
   ============================================================================= */

// =============================================================================
// FADE UP ON SCROLL
// =============================================================================

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function FadeUp({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  once = true 
}: FadeUpProps) {
  const { ref, isInView } = useInView({ 
    threshold: 0.1, 
    triggerOnce: once 
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ 
        duration, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// SCALE ON SCROLL
// =============================================================================

interface ScaleOnScrollProps {
  children: ReactNode;
  from?: number;
  to?: number;
  className?: string;
}

export function ScaleOnScroll({ 
  children, 
  from = 0.8, 
  to = 1,
  className = ''
}: ScaleOnScrollProps) {
  const { ref, isInView } = useInView({ threshold: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: from, opacity: 0 }}
      animate={isInView ? { scale: to, opacity: 1 } : { scale: from, opacity: 0 }}
      transition={{ 
        duration: 0.6,
        ease: [0.175, 0.885, 0.32, 1.275]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// ROTATE ON SCROLL
// =============================================================================

interface RotateOnScrollProps {
  children: ReactNode;
  from?: number;
  to?: number;
  className?: string;
}

export function RotateOnScroll({ 
  children, 
  from = -15, 
  to = 0,
  className = ''
}: RotateOnScrollProps) {
  const { ref, isInView } = useInView({ threshold: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ rotate: from, opacity: 0 }}
      animate={isInView ? { rotate: to, opacity: 1 } : { rotate: from, opacity: 0 }}
      transition={{ 
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// PARALLAX SCROLL
// =============================================================================

interface ParallaxScrollProps {
  children: ReactNode;
  offset?: number;
  className?: string;
  speed?: 'slow' | 'medium' | 'fast';
}

export function ParallaxScroll({ 
  children, 
  offset = 50,
  className = '',
  speed = 'medium'
}: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const speedMultiplier = {
    slow: 0.5,
    medium: 1,
    fast: 1.5
  };

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [offset * speedMultiplier[speed], -offset * speedMultiplier[speed]]
  );

  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{ y: smoothY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// PROGRESS INDICATOR
// =============================================================================

interface ProgressIndicatorProps {
  height?: number;
  color?: string;
  position?: 'top' | 'bottom';
  showPercentage?: boolean;
}

export function ProgressIndicator({ 
  height = 4,
  color = 'var(--primary)',
  position = 'top',
  showPercentage = false
}: ProgressIndicatorProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const percentage = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <>
      <motion.div
        style={{ 
          scaleX,
          height: `${height}px`,
          backgroundColor: color,
          transformOrigin: "left"
        }}
        className={`fixed left-0 right-0 z-50 ${
          position === 'top' ? 'top-0' : 'bottom-0'
        }`}
      />
      {showPercentage && (
        <motion.div
          className={`fixed right-4 z-50 text-sm font-medium ${
            position === 'top' ? 'top-6' : 'bottom-6'
          }`}
        >
          <motion.span>{percentage.get().toFixed(0)}%</motion.span>
        </motion.div>
      )}
    </>
  );
}

// =============================================================================
// STICKY SCROLL
// =============================================================================

interface StickyScrollProps {
  children: ReactNode;
  className?: string;
  offset?: number;
}

export function StickyScroll({ 
  children, 
  className = '',
  offset = 100 
}: StickyScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsSticky(latest > offset);
    });
  }, [scrollY, offset]);

  return (
    <motion.div
      ref={ref}
      animate={{ 
        position: isSticky ? 'fixed' : 'relative',
        top: isSticky ? 0 : 'auto'
      }}
      transition={{ duration: 0.3 }}
      className={`${className} ${isSticky ? 'shadow-lg' : ''}`}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// SCROLL TRIGGERED COUNTER
// =============================================================================

interface ScrollCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function ScrollCounter({ 
  from = 0,
  to,
  duration = 2,
  className = '',
  suffix = '',
  prefix = ''
}: ScrollCounterProps) {
  const { ref, isInView } = useInView({ triggerOnce: true });
  const count = useMotionValue(from);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, to, { duration });
      return animation.stop;
    }
  }, [isInView, count, to, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  );
}

// =============================================================================
// SCROLL REVEAL CONTAINER
// =============================================================================

interface ScrollRevealContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
}

export function ScrollRevealContainer({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  threshold = 0.1
}: ScrollRevealContainerProps) {
  const { ref, isInView } = useInView({ 
    threshold, 
    triggerOnce: true 
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }
            }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// =============================================================================
// SCROLL ZOOM
// =============================================================================

interface ScrollZoomProps {
  children: ReactNode;
  className?: string;
  maxScale?: number;
}

export function ScrollZoom({ 
  children, 
  className = '',
  maxScale = 1.5
}: ScrollZoomProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, maxScale, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// SCROLL BLUR
// =============================================================================

interface ScrollBlurProps {
  children: ReactNode;
  className?: string;
  maxBlur?: number;
}

export function ScrollBlur({ 
  children, 
  className = '',
  maxBlur = 10
}: ScrollBlurProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const blur = useTransform(
    scrollYProgress, 
    [0, 0.3, 0.7, 1], 
    [0, maxBlur, maxBlur, 0]
  );

  return (
    <motion.div
      ref={ref}
      style={{ 
        filter: useTransform(blur, (value) => `blur(${value}px)`)
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// UTILITIES
// =============================================================================

import { animate, useMotionValue } from 'framer-motion';
import React, { useEffect, useState } from 'react';

// Hook para usar com qualquer transform baseado em scroll
export function useScrollTransform(
  inputRange: number[],
  outputRange: number[],
  options?: { clamp?: boolean }
) {
  const { scrollY } = useScroll();
  return useTransform(scrollY, inputRange, outputRange, options);
}