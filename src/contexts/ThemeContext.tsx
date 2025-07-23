"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Tipos de tema disponíveis
export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// Temas customizados para o futuro
export type CustomTheme = 'blue' | 'purple' | 'green' | 'contrast';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  // Features avançadas
  autoThemeEnabled: boolean;
  setAutoThemeEnabled: (enabled: boolean) => void;
  customTheme?: CustomTheme;
  setCustomTheme: (theme: CustomTheme | undefined) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Storage key
const THEME_STORAGE_KEY = 'rioporto-theme';
const AUTO_THEME_STORAGE_KEY = 'rioporto-auto-theme';
const CUSTOM_THEME_STORAGE_KEY = 'rioporto-custom-theme';

// Horários para tema automático
const AUTO_THEME_CONFIG = {
  darkStart: 18, // 18:00 (6 PM)
  darkEnd: 6,    // 06:00 (6 AM)
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [autoThemeEnabled, setAutoThemeEnabledState] = useState(false);
  const [customTheme, setCustomThemeState] = useState<CustomTheme | undefined>();

  // Detecta o tema do sistema
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Detecta o tema baseado no horário
  const getTimeBasedTheme = useCallback((): ResolvedTheme => {
    const hour = new Date().getHours();
    const { darkStart, darkEnd } = AUTO_THEME_CONFIG;
    
    if (darkStart > darkEnd) {
      // Dark mode cruza meia-noite
      return hour >= darkStart || hour < darkEnd ? 'dark' : 'light';
    } else {
      // Dark mode durante o dia (caso improvável)
      return hour >= darkStart && hour < darkEnd ? 'dark' : 'light';
    }
  }, []);

  // Resolve o tema final
  const resolveTheme = useCallback((currentTheme: Theme): ResolvedTheme => {
    if (autoThemeEnabled) {
      return getTimeBasedTheme();
    }
    
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    
    return currentTheme as ResolvedTheme;
  }, [autoThemeEnabled, getSystemTheme, getTimeBasedTheme]);

  // Aplica o tema no documento
  const applyTheme = useCallback((resolvedTheme: ResolvedTheme, withTransition = true) => {
    const root = document.documentElement;
    
    // Adiciona classe de transição se necessário
    if (withTransition && !isLoading) {
      root.classList.add('theme-transition');
    }
    
    // Aplica o tema
    root.setAttribute('data-theme', resolvedTheme);
    
    // Aplica tema customizado se existir
    if (customTheme) {
      root.setAttribute('data-custom-theme', customTheme);
    } else {
      root.removeAttribute('data-custom-theme');
    }
    
    // Remove classe de transição após a animação
    if (withTransition && !isLoading) {
      setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
    }
    
    // Atualiza meta theme-color para mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0a0b0d' : '#ffffff');
    }
  }, [isLoading, customTheme]);

  // Salva preferências no localStorage
  const savePreferences = useCallback((
    theme: Theme,
    autoTheme: boolean,
    customTheme?: CustomTheme
  ) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(AUTO_THEME_STORAGE_KEY, JSON.stringify(autoTheme));
      if (customTheme) {
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, customTheme);
      } else {
        localStorage.removeItem(CUSTOM_THEME_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Erro ao salvar preferências de tema:', error);
    }
  }, []);

  // Carrega preferências do localStorage
  const loadPreferences = useCallback(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      const savedAutoTheme = localStorage.getItem(AUTO_THEME_STORAGE_KEY);
      const savedCustomTheme = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) as CustomTheme | null;
      
      return {
        theme: savedTheme || 'system',
        autoTheme: savedAutoTheme ? JSON.parse(savedAutoTheme) : false,
        customTheme: savedCustomTheme || undefined,
      };
    } catch (error) {
      console.error('Erro ao carregar preferências de tema:', error);
      return {
        theme: 'system' as Theme,
        autoTheme: false,
        customTheme: undefined,
      };
    }
  }, []);

  // Função para mudar o tema
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    savePreferences(newTheme, autoThemeEnabled, customTheme);
  }, [resolveTheme, applyTheme, savePreferences, autoThemeEnabled, customTheme]);

  // Função para alternar entre temas
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Função para ativar/desativar tema automático
  const setAutoThemeEnabled = useCallback((enabled: boolean) => {
    setAutoThemeEnabledState(enabled);
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    savePreferences(theme, enabled, customTheme);
  }, [theme, resolveTheme, applyTheme, savePreferences, customTheme]);

  // Função para definir tema customizado
  const setCustomTheme = useCallback((newCustomTheme: CustomTheme | undefined) => {
    setCustomThemeState(newCustomTheme);
    applyTheme(resolvedTheme);
    savePreferences(theme, autoThemeEnabled, newCustomTheme);
  }, [theme, resolvedTheme, autoThemeEnabled, applyTheme, savePreferences]);

  // Inicialização
  useEffect(() => {
    const { theme: savedTheme, autoTheme, customTheme: savedCustomTheme } = loadPreferences();
    
    setThemeState(savedTheme);
    setAutoThemeEnabledState(autoTheme);
    setCustomThemeState(savedCustomTheme);
    
    const resolved = resolveTheme(savedTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved, false);
    
    setIsLoading(false);
  }, []);

  // Listener para mudanças no tema do sistema
  useEffect(() => {
    if (theme !== 'system' || autoThemeEnabled) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, autoThemeEnabled, getSystemTheme, applyTheme]);

  // Verificação periódica para tema automático baseado em horário
  useEffect(() => {
    if (!autoThemeEnabled) return;

    const checkTimeBasedTheme = () => {
      const currentResolved = resolveTheme(theme);
      if (currentResolved !== resolvedTheme) {
        setResolvedTheme(currentResolved);
        applyTheme(currentResolved);
      }
    };

    // Verifica a cada minuto
    const interval = setInterval(checkTimeBasedTheme, 60000);
    
    // Verifica imediatamente
    checkTimeBasedTheme();

    return () => clearInterval(interval);
  }, [autoThemeEnabled, theme, resolvedTheme, resolveTheme, applyTheme]);

  // Sincronização entre abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        setThemeState(newTheme);
        const resolved = resolveTheme(newTheme);
        setResolvedTheme(resolved);
        applyTheme(resolved, false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [resolveTheme, applyTheme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isLoading,
    autoThemeEnabled,
    setAutoThemeEnabled,
    customTheme,
    setCustomTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para usar o tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

// Componente para prevenir FOUC (Flash of Unstyled Content)
export function ThemeScript() {
  const script = `
    (function() {
      try {
        const savedTheme = localStorage.getItem('${THEME_STORAGE_KEY}') || 'system';
        const savedAutoTheme = localStorage.getItem('${AUTO_THEME_STORAGE_KEY}');
        const autoThemeEnabled = savedAutoTheme ? JSON.parse(savedAutoTheme) : false;
        
        let resolvedTheme = savedTheme;
        
        if (autoThemeEnabled) {
          const hour = new Date().getHours();
          resolvedTheme = (hour >= ${AUTO_THEME_CONFIG.darkStart} || hour < ${AUTO_THEME_CONFIG.darkEnd}) ? 'dark' : 'light';
        } else if (savedTheme === 'system') {
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        
        const savedCustomTheme = localStorage.getItem('${CUSTOM_THEME_STORAGE_KEY}');
        if (savedCustomTheme) {
          document.documentElement.setAttribute('data-custom-theme', savedCustomTheme);
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}