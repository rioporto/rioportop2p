'use client';

import React from 'react';
import Link from 'next/link';
import { KYCBadge } from '@/components/ui/KYCBadge';
import { KYCLevel } from '@/types/kyc';

export default function DashboardPage() {
  // Mock data - será substituído por dados reais
  const stats = {
    totalTrades: 42,
    activeOffers: 3,
    completionRate: 98.5,
    volume30d: 125000,
  };

  const recentActivity = [
    { id: 1, type: 'buy', amount: 'R$ 1.000', crypto: 'BTC', status: 'completed', time: '2 horas atrás' },
    { id: 2, type: 'sell', amount: 'R$ 500', crypto: 'USDT', status: 'completed', time: '5 horas atrás' },
    { id: 3, type: 'buy', amount: 'R$ 2.500', crypto: 'ETH', status: 'pending', time: '1 dia atrás' },
  ];

  const quickActions = [
    { title: 'Comprar Crypto', href: '/dashboard/trading?action=buy', icon: 'buy', color: 'bg-secondary' },
    { title: 'Vender Crypto', href: '/dashboard/trading?action=sell', icon: 'sell', color: 'bg-danger' },
    { title: 'Criar Oferta', href: '/dashboard/trading/create', icon: 'create', color: 'bg-primary' },
    { title: 'Verificar KYC', href: '/dashboard/profile', icon: 'kyc', color: 'bg-accent' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/dashboard" className="text-primary hover:text-opacity-80 transition-colors">
              Dashboard
            </Link>
          </li>
        </ol>
      </nav>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Bem-vindo ao Rio Porto P2P
        </h1>
        <p className="text-text-secondary">
          Acompanhe suas negociações e gerencie sua conta
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="skeuomorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">{stats.totalTrades}</h3>
          <p className="text-sm text-text-secondary">Negociações Totais</p>
        </div>

        <div className="skeuomorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">{stats.activeOffers}</h3>
          <p className="text-sm text-text-secondary">Ofertas Ativas</p>
        </div>

        <div className="skeuomorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">{stats.completionRate}%</h3>
          <p className="text-sm text-text-secondary">Taxa de Conclusão</p>
        </div>

        <div className="skeuomorphic-card p-6">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-text-primary">
            R$ {stats.volume30d.toLocaleString('pt-BR')}
          </h3>
          <p className="text-sm text-text-secondary">Volume 30 dias</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="skeuomorphic-card p-6 text-center hover:scale-105 transition-transform duration-200"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                {action.icon === 'buy' && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {action.icon === 'sell' && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {action.icon === 'create' && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {action.icon === 'kyc' && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-text-primary">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="skeuomorphic-card">
        <div className="p-6 border-b border-background">
          <h2 className="text-xl font-semibold text-text-primary">Atividade Recente</h2>
        </div>
        <div className="divide-y divide-background">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-background transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${activity.type === 'buy' ? 'bg-secondary/10' : 'bg-danger/10'}`}
                  >
                    {activity.type === 'buy' ? (
                      <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {activity.type === 'buy' ? 'Compra' : 'Venda'} de {activity.crypto}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {activity.amount} • {activity.time}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${activity.status === 'completed' 
                    ? 'bg-secondary/10 text-secondary' 
                    : 'bg-accent/10 text-accent'}`}
                >
                  {activity.status === 'completed' ? 'Concluído' : 'Pendente'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-background">
          <Link 
            href="/dashboard/history"
            className="text-sm text-primary hover:underline font-medium"
          >
            Ver histórico completo →
          </Link>
        </div>
      </div>
    </div>
  );
}