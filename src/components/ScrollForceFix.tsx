'use client';

import { useEffect } from 'react';

export function ScrollForceFix() {
  useEffect(() => {
    // Força configurações de scroll no carregamento
    const forceScrollSettings = () => {
      // Remove qualquer smooth scroll que possa estar interferindo
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      
      // Garante overflow correto
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
      
      // Adiciona classe para identificar
      document.body.classList.add('scroll-fix-active');
      
      // Reaplica smooth scroll após um delay
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.style.scrollBehavior = 'smooth';
      }, 100);
    };
    
    // Aplica imediatamente
    forceScrollSettings();
    
    // Reaplica após carregamento completo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', forceScrollSettings);
    }
    
    // Reaplica em mudanças de rota
    window.addEventListener('popstate', forceScrollSettings);
    
    return () => {
      document.removeEventListener('DOMContentLoaded', forceScrollSettings);
      window.removeEventListener('popstate', forceScrollSettings);
      document.body.classList.remove('scroll-fix-active');
    };
  }, []);
  
  // Também injeta CSS inline crítico
  return (
    <style jsx global>{`
      html, body {
        overflow-x: hidden !important;
      }
      
      html {
        overflow-y: auto !important;
        scroll-behavior: smooth !important;
        scroll-padding: 150px 0 !important;
      }
      
      body {
        overflow-y: visible !important;
        min-height: 100vh !important;
      }
      
      .register-page main {
        padding-bottom: 300px !important;
      }
      
      @media (max-width: 768px) {
        html {
          scroll-padding: 200px 0 !important;
        }
        
        .register-page main {
          padding-bottom: 400px !important;
        }
      }
    `}</style>
  );
}