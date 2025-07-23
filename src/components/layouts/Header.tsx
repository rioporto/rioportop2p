'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IUser, KYCLevel } from '@/types/kyc';
import { KYCBadge } from '@/components/ui/KYCBadge';
import { ThemeToggleMini } from '@/components/ui/ThemeToggle';

interface IHeaderProps {
  user: IUser;
}

export const Header: React.FC<IHeaderProps> = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, message: 'Sua verificação de KYC foi aprovada!', time: '2 horas atrás', read: false },
    { id: 2, message: 'Nova oferta de compra disponível', time: '5 horas atrás', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-surface elevation-2 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center skeuomorphic-button">
                <span className="text-white font-bold text-xl">RP</span>
              </div>
              <span className="text-xl font-bold text-text-primary hidden sm:block">
                Rio Porto P2P
              </span>
            </Link>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggleMini />
            
            {/* Notificações */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-background transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-danger text-white text-xs 
                                   rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown de Notificações */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-surface rounded-lg elevation-3 overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-background">
                    <h3 className="font-semibold text-text-primary">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`p-4 border-b border-background hover:bg-background transition-colors
                                   ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <p className="text-sm text-text-primary">{notification.message}</p>
                        <p className="text-xs text-text-secondary mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4">
                    <Link 
                      href="/notifications"
                      className="text-sm text-primary hover:underline"
                    >
                      Ver todas as notificações
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil do Usuário */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-text-primary">{user.name}</p>
                    <p className="text-xs text-text-secondary">{user.email}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </button>

              {/* Dropdown do Perfil */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-64 bg-surface rounded-lg elevation-3 overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-background">
                    <p className="font-medium text-text-primary">{user.name}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                    <div className="mt-2">
                      <KYCBadge level={user.kycLevel} showDescription size="sm" />
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Link 
                      href="/profile"
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-background rounded-md transition-colors"
                    >
                      Meu Perfil
                    </Link>
                    <Link 
                      href="/settings"
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-background rounded-md transition-colors"
                    >
                      Configurações
                    </Link>
                    <hr className="my-2 border-background" />
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-background rounded-md transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};