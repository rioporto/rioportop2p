'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sobre */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Sobre a Rio Porto
              </h3>
              <p className="text-sm text-text-secondary">
                Plataforma P2P com sistema de KYC em níveis, 
                oferecendo segurança e flexibilidade para traders brasileiros.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Links Rápidos
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/trading" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    P2P Trading
                  </Link>
                </li>
                <li>
                  <Link href="/wallet" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    Carteira
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    Verificação KYC
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    Central de Ajuda
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/aml" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    Política AML
                  </Link>
                </li>
                <li>
                  <Link href="/fees" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    Taxas e Limites
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Contato
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  suporte@rioporto.com.br
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  0800 123 4567
                </li>
              </ul>
              
              {/* Redes Sociais */}
              <div className="flex gap-3 mt-4">
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="mt-8 pt-8 border-t border-background">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-text-secondary">
                © {currentYear} Rio Porto P2P. Todos os direitos reservados.
              </p>
              
              <div className="flex items-center gap-6">
                <span className="text-sm text-text-secondary">
                  Desenvolvido com segurança e transparência
                </span>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-text-secondary">SSL Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};