"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";

interface IVolumeData {
  month: string;
  volume: number;
}

interface IBadge {
  name: string;
  icon: string;
  description: string;
  earnedAt?: Date;
}

interface IUserStatsProps {
  userId: string;
  stats: {
    totalTransactions: number;
    successRate: number;
    averageResponseTime: number; // em minutos
    totalVolume: number;
    volumeByMonth?: IVolumeData[];
    transactionsByType: {
      purchases: number;
      sales: number;
    };
    topCryptocurrencies: Array<{
      crypto: string;
      volume: number;
      percentage: number;
    }>;
  };
  badges: IBadge[];
  className?: string;
}

export const UserStats: React.FC<IUserStatsProps> = ({
  userId,
  stats,
  badges,
  className,
}) => {
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Formatar tempo de resposta
  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}min` : ""}`;
  };

  // Calcular volume máximo para o gráfico
  const maxVolume = Math.max(...(stats.volumeByMonth?.map(d => d.volume) || [1]));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Grid de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Transações */}
        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Transações</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalTransactions}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-600">
                  ↑ {stats.transactionsByType.purchases} compras
                </span>
                <span className="text-blue-600">
                  ↓ {stats.transactionsByType.sales} vendas
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Taxa de Sucesso */}
        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.successRate.toFixed(1)}%
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      stats.successRate >= 95
                        ? "bg-green-500"
                        : stats.successRate >= 80
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${stats.successRate}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Tempo de Resposta */}
        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Tempo de Resposta</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatResponseTime(stats.averageResponseTime)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Média</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Volume Total */}
        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Volume Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalVolume)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Histórico</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de Volume e Criptomoedas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Volume Mensal */}
        {stats.volumeByMonth && stats.volumeByMonth.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Volume Mensal
            </h3>
            <div className="space-y-3">
              {stats.volumeByMonth.slice(-6).map((data, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{data.month}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(data.volume)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                      style={{
                        width: `${(data.volume / maxVolume) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Criptomoedas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Criptomoedas Mais Negociadas
          </h3>
          <div className="space-y-4">
            {stats.topCryptocurrencies.map((crypto, index) => (
              <div key={crypto.crypto} className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                    index === 0 && "bg-gradient-to-br from-yellow-400 to-yellow-600",
                    index === 1 && "bg-gradient-to-br from-gray-400 to-gray-600",
                    index === 2 && "bg-gradient-to-br from-orange-400 to-orange-600",
                    index > 2 && "bg-gradient-to-br from-blue-400 to-blue-600"
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      {crypto.crypto}
                    </span>
                    <span className="text-sm text-gray-600">
                      {crypto.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                        style={{ width: `${crypto.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Badges Conquistados */}
      {badges.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Conquistas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-xl border-2 text-center",
                  "hover:shadow-lg transition-all duration-300 hover:scale-105",
                  "cursor-pointer",
                  badge.earnedAt
                    ? "border-blue-200 bg-gradient-to-b from-blue-50 to-white"
                    : "border-gray-200 bg-gray-50 opacity-50"
                )}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="font-semibold text-sm text-gray-900">
                  {badge.name}
                </h4>
                <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                {badge.earnedAt && (
                  <p className="text-xs text-blue-600 mt-2">
                    {new Date(badge.earnedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Componente de estatística individual para uso em outros lugares
interface IStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "amber" | "red";
  className?: string;
}

export const StatCard: React.FC<IStatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = "blue",
  className,
}) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Card className={cn("p-4 hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm mt-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", colors[color])}>{icon}</div>
      </div>
    </Card>
  );
};