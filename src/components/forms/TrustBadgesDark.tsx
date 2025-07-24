'use client';

import React from 'react';
import { Shield, Lock, CheckCircle, TrendingUp, Award, Eye } from 'lucide-react';

interface TrustBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'green' | 'blue';
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ icon, title, description, color }) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-500/10 hover:bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: 'text-green-500',
    },
    blue: {
      bg: 'bg-blue-500/10 hover:bg-blue-500/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'text-blue-500',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`
        flex items-start space-x-3 p-4 rounded-lg border
        ${colors.bg} ${colors.border}
        transition-all duration-300 transform hover:scale-105
        cursor-pointer group backdrop-blur-sm
      `}
    >
      <div className={`${colors.icon} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold text-sm ${colors.text}`}>{title}</h4>
        <p className={`text-xs mt-1 ${colors.text} opacity-80`}>{description}</p>
      </div>
    </div>
  );
};

export const TrustBadgesDark: React.FC = () => {
  const badges = [
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Cadastro 100% Seguro',
      description: 'Seus dados são criptografados com SSL de 256 bits',
      color: 'green' as const,
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Privacidade Garantida',
      description: 'Nunca compartilhamos seus dados com terceiros',
      color: 'blue' as const,
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Plataforma Verificada',
      description: 'Certificada por órgãos de segurança digital',
      color: 'green' as const,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header com selo de segurança */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-green-500" />
        <h3 className="text-lg font-bold text-gray-100">Cadastro Seguro e Protegido</h3>
      </div>

      {/* Badges de confiança */}
      <div className="grid grid-cols-1 gap-3">
        {badges.map((badge, index) => (
          <TrustBadge key={index} {...badge} />
        ))}
      </div>

      {/* Estatísticas de confiança */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              <span className="font-bold text-blue-400">4 pessoas</span> se cadastraram hoje
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Eye className="w-4 h-4" />
            <span>12 online agora</span>
          </div>
        </div>
      </div>

      {/* Tempo de cadastro */}
      <div className="flex items-center justify-center space-x-2 mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <Award className="w-5 h-5 text-yellow-500" />
        <p className="text-sm text-gray-300">
          Cadastro leva <span className="font-bold text-gray-100">menos de 60 segundos</span>
        </p>
      </div>

      {/* Depoimento rápido */}
      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 shadow-sm backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            J
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-gray-200">João S.</span>
              <span className="text-xs text-gray-400">• Verificado</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              "Processo super rápido e seguro. Em 2 minutos já estava negociando!"
            </p>
            <div className="flex mt-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-3 h-3 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};