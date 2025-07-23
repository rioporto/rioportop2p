import { Variants } from 'framer-motion';

/* =============================================================================
   FRAMER MOTION VARIANTS - RIO PORTO P2P
   
   Sistema completo de variants organizados para animações consistentes
   ============================================================================= */

// =============================================================================
// PAGE TRANSITIONS
// =============================================================================

export const pageVariants = {
  // Fade Transition
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },

  // Slide Transitions
  slideRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  slideLeft: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },

  // Scale Transitions
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
  },

  // Flip Transition
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },

  // Zoom Transition
  zoom: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }
  }
} as const;

// =============================================================================
// STAGGER CHILDREN
// =============================================================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.5
    }
  }
};

export const listItem: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

// =============================================================================
// HOVER & TAP VARIANTS
// =============================================================================

export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeOut' }
  }
};

export const hoverLift: Variants = {
  initial: { 
    y: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  hover: { 
    y: -4,
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  tap: { 
    y: 0,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.1 }
  }
};

export const hoverGlow: Variants = {
  initial: { 
    boxShadow: '0 0 0 0 rgba(var(--primary-rgb), 0)'
  },
  hover: { 
    boxShadow: '0 0 20px 5px rgba(var(--primary-rgb), 0.3)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const hoverRotate: Variants = {
  initial: { rotate: 0 },
  hover: { 
    rotate: 5,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// =============================================================================
// DRAG ANIMATIONS
// =============================================================================

export const dragConstraints = {
  top: -50,
  left: -50,
  right: 50,
  bottom: 50,
};

export const draggable: Variants = {
  drag: {
    scale: 1.1,
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
    transition: { duration: 0.2 }
  }
};

// =============================================================================
// SCROLL-LINKED ANIMATIONS
// =============================================================================

export const scrollFadeIn: Variants = {
  initial: { 
    opacity: 0,
    y: 50
  },
  whileInView: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  viewport: { 
    once: true, 
    amount: 0.3 
  }
};

export const scrollScale: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.8
  },
  whileInView: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.175, 0.885, 0.32, 1.275]
    }
  },
  viewport: { 
    once: true, 
    amount: 0.5 
  }
};

export const scrollRotate: Variants = {
  initial: { 
    opacity: 0,
    rotate: -10,
    x: -50
  },
  whileInView: { 
    opacity: 1,
    rotate: 0,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  viewport: { 
    once: true, 
    amount: 0.3 
  }
};

// =============================================================================
// EXIT ANIMATIONS
// =============================================================================

export const exitScale: Variants = {
  initial: { 
    scale: 1,
    opacity: 1
  },
  exit: { 
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

export const exitSlide: Variants = {
  initial: { 
    x: 0,
    opacity: 1
  },
  exit: { 
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1]
    }
  }
};

export const exitFade: Variants = {
  initial: { 
    opacity: 1
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

// =============================================================================
// MODAL VARIANTS
// =============================================================================

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const modalContent: Variants = {
  initial: { 
    scale: 0.9,
    opacity: 0,
    y: 20
  },
  animate: { 
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.175, 0.885, 0.32, 1.275]
    }
  },
  exit: { 
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

// =============================================================================
// NOTIFICATION VARIANTS
// =============================================================================

export const notificationSlide: Variants = {
  initial: { 
    x: '100%',
    opacity: 0
  },
  animate: { 
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

export const notificationBounce: Variants = {
  initial: { 
    scale: 0,
    opacity: 0
  },
  animate: { 
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25
    }
  },
  exit: { 
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// =============================================================================
// CARD VARIANTS
// =============================================================================

export const cardHover3D: Variants = {
  initial: { 
    rotateX: 0,
    rotateY: 0,
    scale: 1
  },
  hover: { 
    rotateX: -5,
    rotateY: 5,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

export const cardFlip: Variants = {
  initial: { rotateY: 0 },
  flipped: { 
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const buttonPulse: Variants = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

export const buttonShake: Variants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

// =============================================================================
// LOADING VARIANTS
// =============================================================================

export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

export const dotsPulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.5, 1],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

export const dotsWave: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

// =============================================================================
// CHART VARIANTS
// =============================================================================

export const chartDraw: Variants = {
  initial: { pathLength: 0 },
  animate: {
    pathLength: 1,
    transition: {
      duration: 2,
      ease: 'easeOut'
    }
  }
};

export const chartFill: Variants = {
  initial: { scaleY: 0 },
  animate: {
    scaleY: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
      delay: 0.2
    }
  }
};

// =============================================================================
// TEXT VARIANTS
// =============================================================================

export const textReveal: Variants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

export const textTypewriter: Variants = {
  initial: { width: 0 },
  animate: {
    width: '100%',
    transition: {
      duration: 2,
      ease: 'linear'
    }
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Função para criar variants customizados com spring
export const createSpringVariant = (
  property: string,
  from: any,
  to: any,
  stiffness = 400,
  damping = 30
): Variants => ({
  initial: { [property]: from },
  animate: { 
    [property]: to,
    transition: {
      type: 'spring',
      stiffness,
      damping
    }
  }
});

// Função para criar variants com delay
export const createDelayedVariant = (
  baseVariant: Variants,
  delay: number
): Variants => ({
  ...baseVariant,
  animate: {
    ...baseVariant.animate,
    transition: {
      ...((baseVariant.animate as any).transition || {}),
      delay
    }
  }
});

// Função para criar variants responsivos
export const createResponsiveVariant = (
  mobileVariant: Variants,
  desktopVariant: Variants
): Variants => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return isMobile ? mobileVariant : desktopVariant;
};

// =============================================================================
// PARALLAX VARIANTS
// =============================================================================

export const parallaxY = (offset: number = 50): Variants => ({
  initial: { y: -offset },
  animate: { 
    y: offset,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
});

export const parallaxX = (offset: number = 50): Variants => ({
  initial: { x: -offset },
  animate: { 
    x: offset,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
});