'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { TransactionStatus, EscrowStatus } from '@prisma/client';
import { 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Send, 
  Check, 
  X, 
  AlertTriangle,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react';

interface IStatusBadgeProps {
  status: TransactionStatus | EscrowStatus;
  type: 'transaction' | 'escrow';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
}

export function StatusBadge({ 
  status, 
  type, 
  size = 'md', 
  showIcon = true,
  animated = false 
}: IStatusBadgeProps) {
  const getTransactionConfig = (status: TransactionStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          variant: 'warning' as const,
          label: 'Pendente',
          icon: <Clock className="w-3.5 h-3.5" />,
          animated: true,
        };
      case 'AWAITING_PAYMENT':
        return {
          variant: 'warning' as const,
          label: 'Aguardando Pagamento',
          icon: <CreditCard className="w-3.5 h-3.5" />,
          animated: true,
        };
      case 'PAYMENT_CONFIRMED':
        return {
          variant: 'primary' as const,
          label: 'Pagamento Confirmado',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'RELEASING_CRYPTO':
        return {
          variant: 'primary' as const,
          label: 'Liberando Cripto',
          icon: <Send className="w-3.5 h-3.5" />,
          animated: true,
        };
      case 'COMPLETED':
        return {
          variant: 'success' as const,
          label: 'Concluída',
          icon: <Check className="w-3.5 h-3.5" />,
        };
      case 'CANCELLED':
        return {
          variant: 'secondary' as const,
          label: 'Cancelada',
          icon: <X className="w-3.5 h-3.5" />,
        };
      case 'DISPUTED':
        return {
          variant: 'danger' as const,
          label: 'Em Disputa',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          animated: true,
        };
      default:
        return {
          variant: 'default' as const,
          label: status,
          icon: null,
        };
    }
  };

  const getEscrowConfig = (status: EscrowStatus) => {
    switch (status) {
      case 'LOCKED':
        return {
          variant: 'primary' as const,
          label: 'Bloqueado',
          icon: <Lock className="w-3.5 h-3.5" />,
        };
      case 'RELEASED':
        return {
          variant: 'success' as const,
          label: 'Liberado',
          icon: <Unlock className="w-3.5 h-3.5" />,
        };
      case 'REFUNDED':
        return {
          variant: 'secondary' as const,
          label: 'Reembolsado',
          icon: <RotateCcw className="w-3.5 h-3.5" />,
        };
      default:
        return {
          variant: 'default' as const,
          label: status,
          icon: null,
        };
    }
  };

  const config = type === 'transaction' 
    ? getTransactionConfig(status as TransactionStatus)
    : getEscrowConfig(status as EscrowStatus);

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={showIcon ? config.icon : undefined}
      animated={animated || config.animated}
      dot={config.animated}
    >
      {config.label}
    </Badge>
  );
}