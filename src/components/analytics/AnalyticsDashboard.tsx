'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface DashboardData {
  period: string;
  totalEvents: number;
  uniqueSessions: number;
  avgEventsPerSession: number;
  conversionRate: number;
  topPages: Array<{ path: string; views: number }>;
  userFlow: Array<{ from: string; to: string; count: number }>;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<'realtime' | 'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);
  
  // Simulated data for mockup
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData({
        period,
        totalEvents: period === 'realtime' ? 234 : period === 'today' ? 5678 : period === 'week' ? 39450 : 167890,
        uniqueSessions: period === 'realtime' ? 45 : period === 'today' ? 1234 : period === 'week' ? 8765 : 35678,
        avgEventsPerSession: 4.6,
        conversionRate: period === 'realtime' ? 12.5 : period === 'today' ? 8.7 : period === 'week' ? 10.2 : 11.3,
        topPages: [
          { path: '/', views: period === 'realtime' ? 23 : 567 },
          { path: '/register', views: period === 'realtime' ? 12 : 234 },
          { path: '/listings', views: period === 'realtime' ? 8 : 189 },
          { path: '/kyc', views: period === 'realtime' ? 5 : 123 },
          { path: '/dashboard', views: period === 'realtime' ? 4 : 98 },
        ],
        userFlow: [
          { from: '/', to: '/register', count: period === 'realtime' ? 8 : 145 },
          { from: '/register', to: '/verify', count: period === 'realtime' ? 6 : 98 },
          { from: '/verify', to: '/kyc', count: period === 'realtime' ? 4 : 67 },
          { from: '/kyc', to: '/dashboard', count: period === 'realtime' ? 3 : 45 },
          { from: '/dashboard', to: '/listings', count: period === 'realtime' ? 2 : 34 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [period]);
  
  // Conversion funnel data
  const funnelData = [
    { stage: 'Visita', value: 100, color: 'bg-blue-500' },
    { stage: 'Engajamento', value: 68, color: 'bg-purple-500' },
    { stage: 'Cadastro', value: 34, color: 'bg-pink-500' },
    { stage: 'KYC', value: 21, color: 'bg-orange-500' },
    { stage: '1ª Transação', value: 11, color: 'bg-green-500' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe o desempenho da landing page em tempo real
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {(['realtime', 'today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p === 'realtime' ? 'Tempo Real' : 
               p === 'today' ? 'Hoje' :
               p === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Visitantes Únicos"
            value={data?.uniqueSessions || 0}
            change="+12.5%"
            icon="👥"
            loading={loading}
          />
          <StatsCard
            title="Taxa de Conversão"
            value={`${data?.conversionRate || 0}%`}
            change="+2.3%"
            icon="📈"
            loading={loading}
          />
          <StatsCard
            title="Eventos por Sessão"
            value={data?.avgEventsPerSession.toFixed(1) || '0'}
            change="+0.5"
            icon="⚡"
            loading={loading}
          />
          <StatsCard
            title="Total de Eventos"
            value={data?.totalEvents || 0}
            change="+18.7%"
            icon="📊"
            loading={loading}
          />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversion Funnel */}
          <Card variant="glass" className="lg:col-span-2 p-6" theme="light">
            <h2 className="text-xl font-semibold mb-4">Funil de Conversão</h2>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-gray-600">{stage.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`${stage.color} h-8 rounded-full flex items-center justify-end pr-3`}
                    >
                      <span className="text-white text-xs font-medium">
                        {period === 'realtime' ? 
                          Math.floor(stage.value * 0.45) : 
                          Math.floor(stage.value * 12.34)
                        }
                      </span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Real-time Visitors */}
          <Card variant="glass" className="p-6" theme="light">
            <h2 className="text-xl font-semibold mb-4">Visitantes em Tempo Real</h2>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {period === 'realtime' ? '45' : '234'}
              </div>
              <p className="text-gray-600 text-sm">usuários ativos agora</p>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Desktop</span>
                  <span className="font-medium">62%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mobile</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tablet</span>
                  <span className="font-medium">3%</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Top Pages */}
          <Card variant="glass" className="p-6" theme="light">
            <h2 className="text-xl font-semibold mb-4">Páginas Mais Visitadas</h2>
            <div className="space-y-3">
              {data?.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium">{page.path}</span>
                  </div>
                  <span className="text-sm text-gray-600">{page.views} views</span>
                </div>
              ))}
            </div>
          </Card>
          
          {/* User Flow */}
          <Card variant="glass" className="lg:col-span-2 p-6" theme="light">
            <h2 className="text-xl font-semibold mb-4">Fluxo de Usuários</h2>
            <div className="space-y-3">
              {data?.userFlow.map((flow, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="font-medium">{flow.from}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="font-medium">{flow.to}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{flow.count} usuários</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: string;
  loading?: boolean;
}

function StatsCard({ title, value, change, icon, loading }: StatsCardProps) {
  return (
    <Card variant="glass" className="p-6" theme="light">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          )}
          <p className={`text-sm mt-2 ${
            change.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {change} vs período anterior
          </p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </Card>
  );
}