// Utilitários para ícones

import { iconSizes } from './types';

export const getIconSize = (size: 'sm' | 'md' | 'lg' | 'xl' | number): number => {
  if (typeof size === 'number') return size;
  return iconSizes[size];
};