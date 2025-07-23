'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import {
  Check,
  X,
  MessageCircle,
  AlertTriangle,
  Unlock,
  RefreshCw,
  FileText,
  Download,
  Share2,
  Eye,
  Clock,
  Shield,
  Ban,
  ThumbsUp,
  Loader2
} from 'lucide-react';

type TransactionStatus = 
  | 'pending'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'escrow_locked'
  | 'completed'
  | 'disputed'
  | 'cancelled';

interface ActionButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

interface ITransactionActionsProps {
  status: TransactionStatus;
  role: 'buyer' | 'seller';
  onConfirmPayment?: () => void;
  onReleaseEscrow?: () => void;
  onOpenDispute?: () => void;
  onCancelTransaction?: () => void;
  onOpenChat?: () => void;
  onViewDetails?: () => void;
  onDownloadReceipt?: () => void;
  onShareTransaction?: () => void;
  onRateUser?: () => void;
  messageCount?: number;
  className?: string;
  loading?: {
    confirmPayment?: boolean;
    releaseEscrow?: boolean;
    openDispute?: boolean;
    cancel?: boolean;
  };
}

export function TransactionActions({
  status,
  role,
  onConfirmPayment,
  onReleaseEscrow,
  onOpenDispute,
  onCancelTransaction,
  onOpenChat,
  onViewDetails,
  onDownloadReceipt,
  onShareTransaction,
  onRateUser,
  messageCount = 0,
  className,
  loading = {}
}: ITransactionActionsProps) {
  const [animatingAction, setAnimatingAction] = useState<string | null>(null);

  const handleAction = (actionId: string, callback?: () => void) => {
    setAnimatingAction(actionId);
    setTimeout(() => {
      callback?.();
      setAnimatingAction(null);
    }, 300);
  };

  const getActions = (): ActionButton[] => {
    const actions: ActionButton[] = [];

    // Common actions
    if (onOpenChat) {
      actions.push({
        id: 'chat',
        label: 'Chat',
        icon: <MessageCircle className="w-4 h-4" />,
        variant: 'secondary',
        onClick: () => handleAction('chat', onOpenChat),
      });
    }

    if (onViewDetails) {
      actions.push({
        id: 'details',
        label: 'Detalhes',
        icon: <Eye className="w-4 h-4" />,
        variant: 'secondary',
        onClick: () => handleAction('details', onViewDetails),
      });
    }

    // Status-specific actions
    switch (status) {
      case 'awaiting_payment':
        if (role === 'buyer' && onConfirmPayment) {
          actions.unshift({
            id: 'confirm_payment',
            label: 'Confirmar Pagamento',
            icon: loading.confirmPayment ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            ),
            variant: 'success',
            onClick: () => handleAction('confirm_payment', onConfirmPayment),
            loading: loading.confirmPayment,
            tooltip: 'Confirme após realizar o pagamento'
          });
        }
        if (onCancelTransaction) {
          actions.push({
            id: 'cancel',
            label: 'Cancelar',
            icon: <X className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => handleAction('cancel', onCancelTransaction),
            loading: loading.cancel,
          });
        }
        break;

      case 'payment_confirmed':
      case 'escrow_locked':
        if (role === 'seller' && onReleaseEscrow) {
          actions.unshift({
            id: 'release_escrow',
            label: 'Liberar Fundos',
            icon: loading.releaseEscrow ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Unlock className="w-4 h-4" />
            ),
            variant: 'primary',
            onClick: () => handleAction('release_escrow', onReleaseEscrow),
            loading: loading.releaseEscrow,
            tooltip: 'Libere os fundos após receber o pagamento'
          });
        }
        if (onOpenDispute) {
          actions.push({
            id: 'dispute',
            label: 'Abrir Disputa',
            icon: loading.openDispute ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            ),
            variant: 'warning',
            onClick: () => handleAction('dispute', onOpenDispute),
            loading: loading.openDispute,
          });
        }
        break;

      case 'completed':
        if (onDownloadReceipt) {
          actions.push({
            id: 'download',
            label: 'Baixar Recibo',
            icon: <Download className="w-4 h-4" />,
            variant: 'secondary',
            onClick: () => handleAction('download', onDownloadReceipt),
          });
        }
        if (onShareTransaction) {
          actions.push({
            id: 'share',
            label: 'Compartilhar',
            icon: <Share2 className="w-4 h-4" />,
            variant: 'secondary',
            onClick: () => handleAction('share', onShareTransaction),
          });
        }
        if (onRateUser) {
          actions.unshift({
            id: 'rate',
            label: 'Avaliar',
            icon: <ThumbsUp className="w-4 h-4" />,
            variant: 'primary',
            onClick: () => handleAction('rate', onRateUser),
            tooltip: 'Avalie sua experiência'
          });
        }
        break;

      case 'disputed':
        actions.push({
          id: 'dispute_info',
          label: 'Em Disputa',
          icon: <Shield className="w-4 h-4" />,
          variant: 'warning',
          onClick: () => {},
          disabled: true,
        });
        break;

      case 'cancelled':
        actions.push({
          id: 'cancelled_info',
          label: 'Cancelada',
          icon: <Ban className="w-4 h-4" />,
          variant: 'secondary',
          onClick: () => {},
          disabled: true,
        });
        break;
    }

    return actions;
  };

  const actions = getActions();

  const getButtonStyles = (variant: ActionButton['variant'], disabled?: boolean) => {
    const base = 'relative overflow-hidden font-semibold transition-all duration-300';
    
    if (disabled) {
      return cn(base, 'bg-gray-100 text-gray-400 cursor-not-allowed');
    }

    switch (variant) {
      case 'primary':
        return cn(
          base,
          'bg-gradient-to-r from-blue-600 to-indigo-600',
          'hover:from-blue-700 hover:to-indigo-700',
          'text-white shadow-lg hover:shadow-xl'
        );
      case 'success':
        return cn(
          base,
          'bg-gradient-to-r from-green-600 to-emerald-600',
          'hover:from-green-700 hover:to-emerald-700',
          'text-white shadow-lg hover:shadow-xl'
        );
      case 'danger':
        return cn(
          base,
          'bg-gradient-to-r from-red-600 to-pink-600',
          'hover:from-red-700 hover:to-pink-700',
          'text-white shadow-lg hover:shadow-xl'
        );
      case 'warning':
        return cn(
          base,
          'bg-gradient-to-r from-yellow-600 to-orange-600',
          'hover:from-yellow-700 hover:to-orange-700',
          'text-white shadow-lg hover:shadow-xl'
        );
      case 'secondary':
        return cn(
          base,
          'bg-white border-2 border-gray-200',
          'hover:border-gray-300 hover:bg-gray-50',
          'text-gray-700 shadow-sm hover:shadow-md'
        );
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      <AnimatePresence>
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            {/* Tooltip */}
            {action.tooltip && (
              <motion.div
                className="absolute -top-10 left-1/2 transform -translate-x-1/2 
                          bg-gray-900 text-white text-xs px-3 py-1 rounded
                          opacity-0 pointer-events-none group-hover:opacity-100
                          transition-opacity duration-200 whitespace-nowrap z-10"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0, y: 0 }}
                whileHover={{ opacity: 1, y: -5 }}
              >
                {action.tooltip}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 
                              translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
              </motion.div>
            )}

            <motion.button
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              className={cn(
                getButtonStyles(action.variant, action.disabled || action.loading),
                'px-4 py-2 rounded-lg flex items-center gap-2 group'
              )}
              whileHover={{ scale: action.disabled ? 1 : 1.05 }}
              whileTap={{ scale: action.disabled ? 1 : 0.95 }}
              animate={animatingAction === action.id ? {
                scale: [1, 1.1, 1],
              } : {}}
            >
              {/* Button Content */}
              <span className="relative z-10 flex items-center gap-2">
                {action.icon}
                {action.label}
                
                {/* Message Badge */}
                {action.id === 'chat' && messageCount > 0 && (
                  <motion.span
                    className="ml-1 bg-red-500 text-white text-xs rounded-full 
                             w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {messageCount > 9 ? '9+' : messageCount}
                  </motion.span>
                )}
              </span>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                initial={false}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
              />

              {/* Click Ripple */}
              <AnimatePresence>
                {animatingAction === action.id && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-lg"
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Status Indicator */}
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Status: <strong className="capitalize">{status.replace('_', ' ')}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}