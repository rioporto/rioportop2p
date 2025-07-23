// Tipos compartilhados para todos os ícones

export interface IconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  className?: string;
  animate?: boolean;
}

export const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

export type IconSize = keyof typeof iconSizes;