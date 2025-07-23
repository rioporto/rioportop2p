import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'primary';
  animate?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  animate = true,
}) => {
  const gradientClasses = {
    default: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
    success: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
    warning: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
    primary: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
  };

  const iconBgClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    success: 'bg-green-200 dark:bg-green-800',
    warning: 'bg-amber-200 dark:bg-amber-800',
    primary: 'bg-blue-200 dark:bg-blue-800',
  };

  return (
    <Card
      variant="glass"
      className={cn(
        'group hover:scale-[1.02] transition-all duration-300',
        animate && 'animate-fadeIn'
      )}
      interactive
    >
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50',
        gradientClasses[variant]
      )} />
      
      <CardContent className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className="mt-2 flex items-baseline">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {animate && typeof value === 'number' ? (
                  <span className="animate-count">{value}</span>
                ) : (
                  value
                )}
              </h3>
              {trend && (
                <span className={cn(
                  'ml-2 text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className={cn(
            'p-3 rounded-lg transition-all duration-300',
            iconBgClasses[variant],
            'group-hover:scale-110'
          )}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsGridProps {
  stats: {
    balance: number;
    totalTransactions: number;
    buyTransactions: number;
    sellTransactions: number;
    reputation: number;
    totalRatings: number;
    successRate: number;
    activeListings: number;
    monthlyProfit?: number;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(stats.balance || 0);

  const formattedProfit = stats.monthlyProfit
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Math.abs(stats.monthlyProfit))
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Saldo Total */}
      <StatCard
        title="Saldo Total"
        value={formattedBalance}
        icon="💰"
        variant="primary"
        animate
      />

      {/* Transações */}
      <StatCard
        title="Transações"
        value={stats.totalTransactions}
        subtitle={`${stats.buyTransactions} compras, ${stats.sellTransactions} vendas`}
        icon="📊"
        variant="default"
        animate
      />

      {/* Reputação */}
      <StatCard
        title="Reputação"
        value={stats.reputation.toFixed(1)}
        subtitle={`${stats.totalRatings} avaliações`}
        icon="⭐"
        variant="success"
        trend={stats.reputation >= 4.5 ? { value: 12, isPositive: true } : undefined}
        animate
      />

      {/* Taxa de Sucesso */}
      <StatCard
        title="Taxa de Sucesso"
        value={`${stats.successRate}%`}
        icon="✅"
        variant={stats.successRate >= 90 ? 'success' : 'warning'}
        animate
      />

      {/* Lucro/Prejuízo do Mês */}
      {formattedProfit && (
        <StatCard
          title="Resultado do Mês"
          value={formattedProfit}
          icon={stats.monthlyProfit! >= 0 ? "📈" : "📉"}
          variant={stats.monthlyProfit! >= 0 ? 'success' : 'warning'}
          trend={{
            value: 23,
            isPositive: stats.monthlyProfit! >= 0
          }}
          animate
        />
      )}

      {/* Anúncios Ativos */}
      <StatCard
        title="Anúncios Ativos"
        value={stats.activeListings}
        subtitle="Publicados"
        icon="📝"
        variant="default"
        animate
      />
    </div>
  );
};

// Progress Bar Component
export const SuccessRateBar: React.FC<{ rate: number }> = ({ rate }) => {
  const getColorClass = () => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Taxa de Sucesso
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {rate}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-out rounded-full',
            getColorClass(),
            'animate-scaleX'
          )}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
};