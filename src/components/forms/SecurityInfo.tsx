'use client';

import React, { useState } from 'react';
import { Info, HelpCircle, Shield, Lock, Phone, CreditCard, AlertCircle, X } from 'lucide-react';

interface TooltipProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ title, content, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
        aria-label={`Saiba mais sobre ${title}`}
        aria-expanded={isOpen}
        aria-controls={`tooltip-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {icon || <HelpCircle className="w-4 h-4" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip content */}
          <div 
            id={`tooltip-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="absolute z-50 bottom-full right-0 mb-2 w-72 p-4 bg-white rounded-lg shadow-xl border border-gray-200 transform transition-all duration-200"
            role="tooltip"
            aria-live="polite"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" aria-hidden="true" />
                {title}
              </h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                aria-label="Fechar tooltip"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{content}</p>
            
            {/* Arrow */}
            <div className="absolute top-full right-4 -mt-px">
              <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface SecurityInfoFieldProps {
  fieldName: string;
  tooltipTitle: string;
  tooltipContent: string;
  icon?: React.ReactNode;
}

export const SecurityInfoField: React.FC<SecurityInfoFieldProps> = ({
  fieldName,
  tooltipTitle,
  tooltipContent,
  icon,
}) => {
  // Se fieldName estiver vazio, retorna apenas o Tooltip
  if (!fieldName) {
    return <Tooltip title={tooltipTitle} content={tooltipContent} icon={icon} />;
  }
  
  return (
    <div className="flex items-center justify-between">
      <label className="block text-sm font-medium text-gray-700">
        {fieldName}
      </label>
      <Tooltip title={tooltipTitle} content={tooltipContent} icon={icon} />
    </div>
  );
};

export const SecurityInfo: React.FC = () => {
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
    <div className="space-y-4" role="region" aria-label="Informações de segurança e privacidade">
      {/* Cabeçalho de Segurança */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-start space-x-3">
          <Lock className="w-6 h-6 text-green-600 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Seus Dados Estão Protegidos</h3>
            <p className="text-sm text-gray-600">
              Utilizamos as melhores práticas de segurança do mercado para proteger suas informações.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Segurança */}
      <ul className="grid grid-cols-1 gap-3" role="list">
        {securityItems.map((item, index) => (
          <li
            key={index}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="text-blue-600" aria-hidden="true">{item.icon}</div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>
              <p className="text-xs text-gray-600">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Links Importantes */}
      <nav className="pt-4 border-t border-gray-200" aria-label="Links de segurança e privacidade">
        <p className="text-xs text-gray-600 mb-2">Saiba mais sobre como protegemos você:</p>
        <ul className="flex flex-wrap gap-3" role="list">
          <li>
            <a
              href="/privacy"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
            >
              <Info className="w-3 h-3 mr-1" aria-hidden="true" />
              Política de Privacidade
            </a>
          </li>
          <li>
            <a
              href="/security"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
            >
              <Shield className="w-3 h-3 mr-1" aria-hidden="true" />
              Central de Segurança
            </a>
          </li>
          <li>
            <a
              href="/terms"
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
            >
              <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />
              Termos de Uso
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// Tooltips pré-configurados para campos específicos
export const securityTooltips = {
  whatsapp: {
    title: 'Por que precisamos do WhatsApp?',
    content: 'Usamos o WhatsApp para notificações instantâneas de transações, confirmações de segurança e suporte rápido. Seu número nunca será compartilhado com outros usuários sem sua autorização.',
    icon: <Phone className="w-4 h-4" />,
  },
  password: {
    title: 'Como protegemos sua senha',
    content: 'Sua senha é criptografada usando bcrypt com salt único. Nem mesmo nossa equipe tem acesso à sua senha original. Recomendamos usar senhas únicas e fortes.',
    icon: <Lock className="w-4 h-4" />,
  },
  cpf: {
    title: 'Proteção do CPF',
    content: 'Seu CPF é usado apenas para verificação de identidade e prevenção de fraudes. É armazenado de forma criptografada e nunca é compartilhado com terceiros.',
    icon: <Shield className="w-4 h-4" />,
  },
  email: {
    title: 'Segurança do Email',
    content: 'Seu email é usado para login, recuperação de conta e notificações importantes. Implementamos verificação em duas etapas para maior segurança.',
    icon: <Info className="w-4 h-4" />,
  },
};