'use client';

import { useEffect } from 'react';

export function useScrollToFocus() {
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastFocusedElement: HTMLElement | null = null;
    
    const scrollToElement = (element: HTMLElement) => {
      // Cancelar scroll anterior
      clearTimeout(scrollTimeout);
      
      // Aguardar um pouco mais para garantir que o DOM esteja estável
      scrollTimeout = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        
        // Verificar se o elemento está fora da viewport
        const isAboveViewport = elementTop < 0;
        const isBelowViewport = elementBottom > viewportHeight;
        
        if (isAboveViewport || isBelowViewport) {
          // Calcular offset para centralizar o elemento
          const offset = elementTop + window.pageYOffset - (viewportHeight / 2) + (rect.height / 2);
          
          // Tentar primeiro o método mais moderno
          try {
            // Se o navegador suportar scrollTo com opções
            if ('scrollTo' in window && typeof window.scrollTo === 'function') {
              window.scrollTo({
                top: Math.max(0, offset),
                left: 0,
                behavior: 'smooth'
              });
            } else {
              // Fallback para navegadores mais antigos
              window.scrollTo(0, Math.max(0, offset));
            }
          } catch (e) {
            // Último fallback
            window.scrollTo(0, Math.max(0, offset));
          }
        }
      }, 300);
    };
    
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      
      // Verificar se é um elemento de formulário
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.getAttribute('role') === 'textbox'
      ) {
        lastFocusedElement = target;
        scrollToElement(target);
      }
    };
    
    const handleWindowResize = () => {
      // Quando o teclado virtual aparecer/desaparecer, reposicionar o elemento focado
      if (lastFocusedElement && document.activeElement === lastFocusedElement) {
        scrollToElement(lastFocusedElement);
      }
    };
    
    // Adicionar listeners
    document.addEventListener('focusin', handleFocusIn, { passive: true });
    window.addEventListener('resize', handleWindowResize, { passive: true });
    
    // Adicionar listener para orientação (mobile)
    window.addEventListener('orientationchange', () => {
      setTimeout(handleWindowResize, 500);
    });
    
    return () => {
      clearTimeout(scrollTimeout);
      document.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
    };
  }, []);
}