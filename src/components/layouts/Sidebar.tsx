'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IUser } from '@/types/kyc';
import { NAVIGATION_ITEMS } from '@/types/navigation';

interface ISidebarProps {
  user: IUser;
  isOpen: boolean;
  onClose: () => void;
}

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  exchange: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  wallet: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  history: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

export const Sidebar: React.FC<ISidebarProps> = ({ user, isOpen, onClose }) => {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const canAccessItem = (minLevel: number) => {
    return user.kycLevel >= minLevel;
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          flex flex-col h-full elevation-2
        `}
      >
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const canAccess = canAccessItem(item.minKYCLevel);
              const isActive = isItemActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={canAccess ? item.href : '#'}
                  onClick={(e) => {
                    if (!canAccess) {
                      e.preventDefault();
                    } else {
                      onClose();
                    }
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : canAccess
                        ? 'text-text-primary hover:bg-background hover:shadow-sm'
                        : 'text-text-secondary opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <span className={isActive ? 'text-white' : ''}>
                    {icons[item.icon]}
                  </span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && !canAccess && (
                    <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* KYC Upgrade Prompt */}
          {user.kycLevel < 3 && (
            <div className="mt-8 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Desbloqueie mais recursos!</h4>
              <p className="text-xs text-text-secondary mb-3">
                Faça upgrade do seu KYC para acessar todas as funcionalidades.
              </p>
              <Link 
                href="/profile"
                className="block w-full text-center px-3 py-2 bg-primary text-white text-sm rounded-md
                         hover:bg-opacity-90 transition-colors skeuomorphic-button"
              >
                Fazer Upgrade
              </Link>
            </div>
          )}
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <Link 
                href="/help"
                className="text-sm font-medium text-text-primary hover:text-primary transition-colors"
              >
                Central de Ajuda
              </Link>
              <p className="text-xs text-text-secondary">
                Suporte 24/7
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};