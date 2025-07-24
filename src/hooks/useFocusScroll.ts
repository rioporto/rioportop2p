'use client';

import { useEffect } from 'react';

export function useFocusScroll() {
  useEffect(() => {
    // Polyfill para scrollIntoViewIfNeeded
    if (!Element.prototype.scrollIntoViewIfNeeded) {
      Element.prototype.scrollIntoViewIfNeeded = function(centerIfNeeded = true) {
        const element = this as HTMLElement;
        const parent = element.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Verifica se está fora da viewport
        if (
          elementRect.bottom > window.innerHeight ||
          elementRect.top < 0 ||
          elementRect.bottom > parentRect.bottom ||
          elementRect.top < parentRect.top
        ) {
          if (centerIfNeeded) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      };
    }

    let rafId: number;
    let lastFocusTime = 0;
    const DEBOUNCE_TIME = 100;

    const scrollToFocusedElement = (element: HTMLElement) => {
      const now = Date.now();
      if (now - lastFocusTime < DEBOUNCE_TIME) return;
      lastFocusTime = now;

      // Cancela animação anterior
      if (rafId) cancelAnimationFrame(rafId);

      // Aguarda o próximo frame para garantir que o layout está atualizado
      rafId = requestAnimationFrame(() => {
        // Tenta múltiplos métodos em ordem de preferência
        try {
          // Método 1: scrollIntoViewIfNeeded (Chrome/Edge)
          if ('scrollIntoViewIfNeeded' in element) {
            (element as any).scrollIntoViewIfNeeded(true);
            return;
          }
        } catch (e) {
          console.log('scrollIntoViewIfNeeded falhou:', e);
        }

        try {
          // Método 2: scrollIntoView com opções modernas
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          return;
        } catch (e) {
          console.log('scrollIntoView moderno falhou:', e);
        }

        // Método 3: Cálculo manual (fallback)
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Se está fora da viewport
        if (rect.top < 0 || rect.bottom > viewportHeight) {
          const targetScrollTop = scrollTop + rect.top - (viewportHeight / 2) + (rect.height / 2);
          
          window.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          });
        }
      });
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      // Verifica se é um campo de formulário
      const isFormField = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.getAttribute('role') === 'textbox' ||
        target.getAttribute('role') === 'combobox';

      if (isFormField) {
        // Adiciona delay extra para teclados virtuais
        const delay = 'ontouchstart' in window ? 300 : 100;
        
        setTimeout(() => {
          scrollToFocusedElement(target);
        }, delay);
      }
    };

    // Adiciona listeners
    document.addEventListener('focusin', handleFocus, { passive: true, capture: true });
    
    // Para dispositivos móveis, também escuta click
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        setTimeout(() => {
          if (document.activeElement === target) {
            scrollToFocusedElement(target);
          }
        }, 350);
      }
    };
    
    document.addEventListener('click', handleClick, { passive: true, capture: true });

    // Cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('click', handleClick);
    };
  }, []);
}