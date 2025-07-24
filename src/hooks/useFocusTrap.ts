'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook para implementar focus trap em elementos
 * Mantém o foco dentro do elemento especificado, útil para modais e formulários
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean = true) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // Encontrar todos os elementos focáveis
    const getFocusableElements = () => {
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      
      return container.querySelectorAll<HTMLElement>(selectors.join(','));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(getFocusableElements());
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // Se Shift+Tab no primeiro elemento, vai para o último
      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
        return;
      }

      // Se Tab no último elemento, vai para o primeiro
      if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
        return;
      }
    };

    // Adicionar listener
    container.addEventListener('keydown', handleKeyDown);

    // Focar no primeiro elemento ao ativar
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Pequeno delay para garantir que o DOM está pronto
      setTimeout(() => {
        focusableElements[0].focus();
      }, 100);
    }

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook auxiliar para gerenciar navegação por teclado
 */
export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc para fechar modais/dropdowns
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        
        // Se estiver em um dropdown ou modal, fecha
        const dropdown = activeElement.closest('[role="dialog"], [role="tooltip"]');
        if (dropdown) {
          const closeButton = dropdown.querySelector('[aria-label*="fechar"], [aria-label*="close"]') as HTMLElement;
          closeButton?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * Hook para anunciar mudanças para screen readers
 */
export function useScreenReaderAnnouncement() {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Criar elemento para anúncios se não existir
    if (!announcementRef.current) {
      const div = document.createElement('div');
      div.className = 'sr-only';
      div.setAttribute('role', 'status');
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-atomic', 'true');
      document.body.appendChild(div);
      announcementRef.current = div;
    }

    return () => {
      // Limpar ao desmontar
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, []);

  const announce = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      // Limpar após anúncio
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return announce;
}