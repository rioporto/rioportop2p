/**
 * Constantes do Sistema de Design - Rio Porto P2P
 * Design Premium Skeumórfico
 */

// =============================================================================
// CORES
// =============================================================================

export const colors = {
  // Gradientes Principais
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    luxury: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
    metal: 'linear-gradient(135deg, #C0C5CE 0%, #E5E8ED 50%, #C0C5CE 100%)',
    dark: 'linear-gradient(135deg, #434B5C 0%, #1E3A5F 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },

  // Cores Sólidas
  solid: {
    primary: '#667eea',
    primaryDark: '#5a67d8',
    primaryLight: '#7c8ff0',
    
    secondary: '#f093fb',
    secondaryDark: '#e876f5',
    secondaryLight: '#f4a8fc',
    
    success: '#4facfe',
    successDark: '#2196f3',
    successLight: '#6fbfff',
    
    warning: '#fa709a',
    warningDark: '#f74c7b',
    warningLight: '#fb8fae',
    
    danger: '#f5576c',
    dangerDark: '#e91e63',
    dangerLight: '#f77086',
    
    info: '#00f2fe',
    infoDark: '#00bcd4',
    infoLight: '#4dd0e1',
  },

  // Neutros
  neutrals: {
    white: '#ffffff',
    black: '#000000',
    gray50: '#fafbfc',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
  },

  // Cores Especiais (Legacy)
  special: {
    azulCofre: '#1E3A5F',
    prataMetal: '#C0C5CE',
    douradoReal: '#FFD700',
    verdeCedula: '#2E7D32',
    azulBancario: '#0047AB',
    cinzaSeguro: '#434B5C',
  },
} as const;

// =============================================================================
// SOMBRAS
// =============================================================================

export const shadows = {
  // Sombras Externas
  soft: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
  hard: '0 8px 32px rgba(0, 0, 0, 0.16), 0 4px 16px rgba(0, 0, 0, 0.10)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.20), 0 8px 24px rgba(0, 0, 0, 0.12)',

  // Sombras Internas
  innerSoft: 'inset 0 2px 4px rgba(0, 0, 0, 0.08)',
  innerMedium: 'inset 0 4px 8px rgba(0, 0, 0, 0.12)',
  innerHard: 'inset 0 6px 12px rgba(0, 0, 0, 0.16)',

  // Sombras Coloridas
  primary: '0 4px 16px rgba(102, 126, 234, 0.25)',
  secondary: '0 4px 16px rgba(240, 147, 251, 0.25)',
  success: '0 4px 16px rgba(79, 172, 254, 0.25)',
  warning: '0 4px 16px rgba(250, 112, 154, 0.25)',
  danger: '0 4px 16px rgba(245, 87, 108, 0.25)',

  // Sombras Skeumórficas
  skeuomorphic: {
    raised: `
      0 1px 2px rgba(0, 0, 0, 0.07),
      0 2px 4px rgba(0, 0, 0, 0.07),
      0 4px 8px rgba(0, 0, 0, 0.07),
      0 8px 16px rgba(0, 0, 0, 0.07),
      0 16px 32px rgba(0, 0, 0, 0.07),
      0 32px 64px rgba(0, 0, 0, 0.07)
    `,
    pressed: `
      inset 0 1px 2px rgba(0, 0, 0, 0.1),
      inset 0 2px 4px rgba(0, 0, 0, 0.1),
      inset 0 4px 8px rgba(0, 0, 0, 0.1)
    `,
    floating: `
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04)
    `,
  },
} as const;

// =============================================================================
// TIPOGRAFIA
// =============================================================================

export const typography = {
  // Famílias de Fontes
  fontFamily: {
    sans: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    mono: "'Roboto Mono', 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
    display: "'Bebas Neue', Impact, 'Arial Black', sans-serif",
  },

  // Tamanhos de Fonte
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem',    // 128px
  },

  // Pesos de Fonte
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Altura de Linha
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Espaçamento entre Letras
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// ESPAÇAMENTO
// =============================================================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

// =============================================================================
// BORDAS E RAIOS
// =============================================================================

export const borders = {
  // Larguras
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },

  // Raios
  radius: {
    none: '0px',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },
} as const;

// =============================================================================
// TRANSIÇÕES E ANIMAÇÕES
// =============================================================================

export const transitions = {
  // Durações
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Funções de Tempo
  timing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  60: 60,
  70: 70,
  80: 80,
  90: 90,
  100: 100,
  modal: 1000,
  dropdown: 1100,
  sticky: 1200,
  fixed: 1300,
  modalBackdrop: 1400,
  tooltip: 1500,
  notification: 1600,
} as const;

// =============================================================================
// OPACIDADES
// =============================================================================

export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// EFEITOS
// =============================================================================

export const effects = {
  // Blur
  blur: {
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },

  // Saturação
  saturate: {
    0: 0,
    50: 0.5,
    100: 1,
    150: 1.5,
    200: 2,
  },
} as const;

// =============================================================================
// FUNÇÕES UTILITÁRIAS
// =============================================================================

/**
 * Retorna uma classe CSS de gradiente
 */
export const getGradientClass = (type: keyof typeof colors.gradients) => {
  return `bg-gradient-${type}`;
};

/**
 * Retorna uma classe CSS de sombra
 */
export const getShadowClass = (type: keyof typeof shadows) => {
  return `shadow-${type}`;
};

/**
 * Retorna uma classe CSS de animação
 */
export const getAnimationClass = (animation: string) => {
  return `animate-${animation}`;
};

/**
 * Combina classes condicionalmente
 */
export const clsx = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

// =============================================================================
// TEMA COMPLETO
// =============================================================================

export const theme = {
  colors,
  shadows,
  typography,
  spacing,
  borders,
  transitions,
  zIndex,
  opacity,
  breakpoints,
  effects,
} as const;

export type Theme = typeof theme;

// Export default
export default theme;