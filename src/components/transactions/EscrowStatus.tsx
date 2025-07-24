'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { EscrowStatus as EscrowStatusType } from '@/types/database';
import { Shield, Lock, Unlock, RotateCcw, CheckCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface IEscrowStatusProps {
  status: EscrowStatusType;
  amount: string | number;
  cryptocurrency: string;
  releasedAt?: Date | string | null;
  className?: string;
  showDetails?: boolean;
}

export function EscrowStatus({ 
  status, 
  amount, 
  cryptocurrency,
  releasedAt,
  className,
  showDetails = true
}: IEscrowStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'LOCKED':
        return {
          icon: <Lock className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          title: 'Fundos em Custódia',
          description: 'Os fundos estão seguros no escrow até a confirmação do pagamento',
        };
      case 'RELEASED':
        return {
          icon: <Unlock className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          title: 'Fundos Liberados',
          description: releasedAt 
            ? `Liberado em ${new Date(releasedAt).toLocaleString('pt-BR')}` 
            : 'Os fundos foram liberados com sucesso',
        };
      case 'REFUNDED':
        return {
          icon: <RotateCcw className="w-5 h-5" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          title: 'Fundos Reembolsados',
          description: 'Os fundos foram devolvidos ao vendedor',
        };
      default:
        return {
          icon: <Shield className="w-5 h-5" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          title: 'Status Desconhecido',
          description: '',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-200',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon Container */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'bg-white shadow-sm',
            config.iconColor
          )}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{config.title}</h4>
            <StatusBadge status={status} type="escrow" size="sm" showIcon={false} />
          </div>
          
          {showDetails && (
            <>
              <p className="text-sm text-gray-600 mb-2">{config.description}</p>
              
              {/* Amount Display */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Valor:</span>
                <span className="text-sm font-bold text-gray-900">
                  {amount} {cryptocurrency}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress Indicator for LOCKED status */}
      {status === 'LOCKED' && (
        <div className="mt-3 pt-3 border-t border-blue-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">
              Aguardando confirmação do pagamento para liberação
            </span>
          </div>
        </div>
      )}
    </div>
  );
}