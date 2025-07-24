'use client';

import React from 'react';
import { Info, Shield, Lock, CreditCard, AlertCircle } from 'lucide-react';

export const SecurityInfoDark: React.FC = () => {
  const securityItems = [
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Criptografia de Ponta',
      description: 'Todos os dados são protegidos com SSL 256-bit',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Proteção Anti-Fraude',
      description: 'Sistema de detecção de atividades suspeitas 24/7',
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Dados Financeiros Seguros',
      description: 'Conformidade com PCI DSS e regulamentações bancárias',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Cabeçalho de Segurança */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <Lock className="w-6 h-6 text-green-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-100 mb-1">Seus Dados Estão Protegidos</h3>
            <p className="text-sm text-gray-400">
              Utilizamos as melhores práticas de segurança do mercado para proteger suas informações.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Segurança */}
      <div className="grid grid-cols-1 gap-3">
        {securityItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors duration-200 backdrop-blur-sm"
          >
            <div className="text-blue-400">{item.icon}</div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-200">{item.title}</h4>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Links Importantes */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">Saiba mais sobre como protegemos você:</p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/privacy"
            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Info className="w-3 h-3 mr-1" />
            Política de Privacidade
          </a>
          <a
            href="/security"
            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Shield className="w-3 h-3 mr-1" />
            Central de Segurança
          </a>
          <a
            href="/terms"
            className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Termos de Uso
          </a>
        </div>
      </div>
    </div>
  );
};