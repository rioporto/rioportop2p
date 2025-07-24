'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para auto-scroll suave entre campos do formulário
 * Garante que o campo ativo fique sempre visível acima do teclado
 */
export const useAutoScroll = () => {
  const scrollToElement = useCallback((element: HTMLElement) => {
    // Aguarda o teclado abrir
    setTimeout(() => {
      const elementRect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const keyboardHeight = window.innerHeight - document.documentElement.clientHeight;
      
      // Calcula se o elemento está oculto pelo teclado
      const isHidden = elementRect.bottom > (viewportHeight - keyboardHeight - 50);
      
      if (isHidden) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 300);
  }, []);

  const handleFocus = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      scrollToElement(target);
    }
  }, [scrollToElement]);

  useEffect(() => {
    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, [handleFocus]);

  return { scrollToElement };
};

/**
 * Hook para otimização do teclado virtual
 * Ajusta viewport e previne comportamentos indesejados
 */
export const useKeyboardOptimization = () => {
  const originalViewportContent = useRef<string>('');

  useEffect(() => {
    // Salva o viewport original
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      originalViewportContent.current = viewport.getAttribute('content') || '';
    }

    // Função para ajustar viewport quando o teclado abre
    const handleFocusIn = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        );
      }

      // Adiciona classe para ajustes de layout
      document.body.classList.add('keyboard-open');
    };

    // Função para restaurar viewport quando o teclado fecha
    const handleFocusOut = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport && originalViewportContent.current) {
        viewport.setAttribute('content', originalViewportContent.current);
      }

      // Remove classe de ajustes
      setTimeout(() => {
        document.body.classList.remove('keyboard-open');
      }, 300);
    };

    // iOS specific - detecta mudanças na altura da viewport
    let lastHeight = window.innerHeight;
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      if (Math.abs(currentHeight - lastHeight) > 100) {
        if (currentHeight < lastHeight) {
          handleFocusIn();
        } else {
          handleFocusOut();
        }
        lastHeight = currentHeight;
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
};

/**
 * Hook para garantir targets de toque de no mínimo 44px
 * Adiciona padding e ajustes visuais para melhor usabilidade
 */
export const useTouchTargets = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Garante tamanho mínimo de 44px para todos os elementos interativos */
      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="password"],
      input[type="number"],
      textarea,
      select,
      button {
        min-height: 44px;
        touch-action: manipulation; /* Previne delay de 300ms no tap */
      }

      /* Aumenta área de toque para checkboxes e radios */
      input[type="checkbox"],
      input[type="radio"] {
        width: 20px;
        height: 20px;
        margin: 12px;
        cursor: pointer;
      }

      /* Melhora espaçamento entre elementos do formulário em mobile */
      @media (max-width: 640px) {
        form > * + * {
          margin-top: 1.25rem;
        }
      }

      /* Previne zoom ao focar inputs no iOS */
      input, textarea, select {
        font-size: 16px !important;
      }

      /* Ajustes quando o teclado está aberto */
      body.keyboard-open {
        position: fixed;
        width: 100%;
      }

      /* Safe areas para iPhones com notch */
      @supports (padding: env(safe-area-inset-bottom)) {
        body {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .fixed-bottom-button {
          bottom: env(safe-area-inset-bottom);
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
};

/**
 * Hook para feedback tátil (vibração sutil)
 * Funciona apenas em dispositivos que suportam Vibration API
 */
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const addHapticToElement = useCallback((element: HTMLElement) => {
    const handleTouch = () => vibrate();
    element.addEventListener('touchstart', handleTouch);
    return () => element.removeEventListener('touchstart', handleTouch);
  }, [vibrate]);

  return { vibrate, addHapticToElement };
};

/**
 * Hook principal que combina todas as otimizações mobile
 */
export const useMobileOptimizations = () => {
  // Desabilitado useAutoScroll pois estava causando problemas de scroll indesejado
  // const { scrollToElement } = useAutoScroll();
  useKeyboardOptimization();
  useTouchTargets();
  const { vibrate, addHapticToElement } = useHapticFeedback();

  return {
    scrollToElement: () => {}, // Função vazia para manter compatibilidade
    vibrate,
    addHapticToElement,
  };
};

/**
 * Componente de Bottom Sheet para termos e políticas
 */
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const { vibrate } = useHapticFeedback();

  useEffect(() => {
    if (isOpen) {
      vibrate();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, vibrate]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={handleBackdropClick}
    >
      <div 
        ref={sheetRef}
        className="bg-white w-full rounded-t-2xl max-h-[85vh] animate-slide-up"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
};

// CSS para animação do bottom sheet
const bottomSheetStyles = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;

// Adiciona os estilos ao documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = bottomSheetStyles;
  document.head.appendChild(styleElement);
}