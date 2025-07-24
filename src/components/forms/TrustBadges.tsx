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
      bg: 'bg-green-50 hover:bg-green-100',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
    },
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`
        flex items-start space-x-3 p-4 rounded-lg border
        ${colors.bg} ${colors.border}
        transition-all duration-300 transform hover:scale-105
        cursor-pointer group
        focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500
      `}
      role="listitem"
    >
      <div className={`${colors.icon} group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold text-sm ${colors.text}`}>{title}</h4>
        <p className={`text-xs mt-1 ${colors.text} opacity-80`}>{description}</p>
      </div>
    </div>
  );
};

export const TrustBadges: React.FC = () => {
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
    <div className="space-y-3" role="region" aria-label="Informações de segurança e confiabilidade">
      {/* Header com selo de segurança */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-green-600" aria-hidden="true" />
        <h3 className="text-lg font-bold text-gray-800">Cadastro Seguro e Protegido</h3>
      </div>

      {/* Badges de confiança */}
      <div className="grid grid-cols-1 gap-3" role="list" aria-label="Benefícios de segurança">
        {badges.map((badge, index) => (
          <TrustBadge key={index} {...badge} />
        ))}
      </div>

      {/* Estatísticas de confiança */}
      <div 
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100"
        role="status"
        aria-live="polite"
        aria-label="Estatísticas de atividade"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">
              <span className="font-bold text-blue-600" aria-label="Número de cadastros hoje">4 pessoas</span> se cadastraram hoje
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span aria-label="Usuários online agora">12 online agora</span>
          </div>
        </div>
      </div>

      {/* Tempo de cadastro */}
      <div 
        className="flex items-center justify-center space-x-2 mt-4 p-3 bg-gray-50 rounded-lg"
        role="note"
        aria-label="Tempo estimado de cadastro"
      >
        <Award className="w-5 h-5 text-yellow-600" aria-hidden="true" />
        <p className="text-sm text-gray-700">
          Cadastro leva <span className="font-bold text-gray-900">menos de 60 segundos</span>
        </p>
      </div>

      {/* Depoimento rápido */}
      <article 
        className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        aria-label="Depoimento de usuário"
      >
        <div className="flex items-start space-x-3">
          <div 
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold"
            aria-label="Avatar de João S."
          >
            J
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-gray-800">João S.</span>
              <span className="text-xs text-gray-500" aria-label="Usuário verificado">• Verificado</span>
            </div>
            <blockquote className="text-xs text-gray-600 mt-1">
              "Processo super rápido e seguro. Em 2 minutos já estava negociando!"
            </blockquote>
            <div className="flex mt-2" role="img" aria-label="Avaliação 5 de 5 estrelas">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-3 h-3 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};