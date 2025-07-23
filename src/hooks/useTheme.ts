"use client";

import { useTheme as useThemeContext } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

// Re-export do hook do contexto
export { useTheme } from '@/contexts/ThemeContext';

// Hooks adicionais para funcionalidades específicas

/**
 * Hook para detectar se está em modo escuro
 */
export function useIsDark() {
  const { resolvedTheme } = useThemeContext();
  return resolvedTheme === 'dark';
}

/**
 * Hook para obter cores do tema atual
 */
export function useThemeColors() {
  const { resolvedTheme } = useThemeContext();
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computedStyle = getComputedStyle(document.documentElement);
    
    const themeColors = {
      // Cores principais
      primary: computedStyle.getPropertyValue('--color-primary').trim(),
      secondary: computedStyle.getPropertyValue('--color-secondary').trim(),
      success: computedStyle.getPropertyValue('--color-success').trim(),
      warning: computedStyle.getPropertyValue('--color-warning').trim(),
      danger: computedStyle.getPropertyValue('--color-danger').trim(),
      
      // Backgrounds
      backgroundPrimary: computedStyle.getPropertyValue('--color-background-primary').trim(),
      backgroundSecondary: computedStyle.getPropertyValue('--color-background-secondary').trim(),
      
      // Textos
      textPrimary: computedStyle.getPropertyValue('--color-text-primary').trim(),
      textSecondary: computedStyle.getPropertyValue('--color-text-secondary').trim(),
      
      // Crypto
      bitcoin: computedStyle.getPropertyValue('--color-bitcoin').trim(),
      ethereum: computedStyle.getPropertyValue('--color-ethereum').trim(),
      usdt: computedStyle.getPropertyValue('--color-usdt').trim(),
    };

    setColors(themeColors);
  }, [resolvedTheme]);

  return colors;
}

/**
 * Hook para detectar preferência de movimento reduzido
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook para detectar alto contraste
 */
export function usePrefersHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

/**
 * Hook para aplicar classes condicionais baseadas no tema
 */
export function useThemeClasses(lightClasses: string, darkClasses: string) {
  const isDark = useIsDark();
  return isDark ? darkClasses : lightClasses;
}

/**
 * Hook para obter variáveis CSS do tema
 */
export function useThemeVariable(variableName: string) {
  const { resolvedTheme } = useThemeContext();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const computedStyle = getComputedStyle(document.documentElement);
    const cssValue = computedStyle.getPropertyValue(`--${variableName}`).trim();
    setValue(cssValue);
  }, [variableName, resolvedTheme]);

  return value;
}

/**
 * Hook para detectar se o tema está carregando
 */
export function useThemeLoading() {
  const { isLoading } = useThemeContext();
  return isLoading;
}

/**
 * Hook para sincronizar com localStorage
 */
export function useThemeSync() {
  const { theme, setTheme } = useThemeContext();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rioporto-theme' && e.newValue) {
        setTheme(e.newValue as 'light' | 'dark' | 'system');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setTheme]);

  return theme;
}

/**
 * Hook para aplicar tema baseado em horário
 */
export function useTimeBasedTheme(
  darkStartHour = 18,
  darkEndHour = 6
) {
  const { setTheme, autoThemeEnabled } = useThemeContext();
  const [currentTimeTheme, setCurrentTimeTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (!autoThemeEnabled) return;

    const checkTime = () => {
      const hour = new Date().getHours();
      
      let shouldBeDark: boolean;
      if (darkStartHour > darkEndHour) {
        // Dark mode cruza meia-noite
        shouldBeDark = hour >= darkStartHour || hour < darkEndHour;
      } else {
        // Dark mode durante o dia
        shouldBeDark = hour >= darkStartHour && hour < darkEndHour;
      }

      const newTheme = shouldBeDark ? 'dark' : 'light';
      setCurrentTimeTheme(newTheme);
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, [darkStartHour, darkEndHour, autoThemeEnabled]);

  return currentTimeTheme;
}

/**
 * Hook para criar transições suaves entre temas
 */
export function useThemeTransition(duration = 300) {
  const { resolvedTheme } = useThemeContext();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [resolvedTheme, duration]);

  return isTransitioning;
}