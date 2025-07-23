import { useContext, useCallback } from 'react';
import { NotificationContext } from '../components/notifications/NotificationProvider';
import { NotificationType, NotificationPosition } from '../components/notifications/NotificationToast';

interface NotificationOptions {
  type: NotificationType;
  title: string;
  description?: string;
  duration?: number;
  position?: NotificationPosition;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  avatar?: string;
  playSound?: boolean;
  persist?: boolean;
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  const {
    notifications,
    toasts,
    unreadCount,
    soundEnabled,
    addNotification,
    removeToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound
  } = context;

  // Helper methods for common notification types
  const notify = useCallback((options: NotificationOptions) => {
    return addNotification(options);
  }, [addNotification]);

  const notifySuccess = useCallback((title: string, description?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'success',
      title,
      description,
      ...options
    });
  }, [addNotification]);

  const notifyError = useCallback((title: string, description?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'error',
      title,
      description,
      ...options
    });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, description?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'warning',
      title,
      description,
      ...options
    });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, description?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'info',
      title,
      description,
      ...options
    });
  }, [addNotification]);

  const notifyMessage = useCallback((title: string, description?: string, avatar?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'message',
      title,
      description,
      avatar,
      ...options
    });
  }, [addNotification]);

  const notifyTransaction = useCallback((title: string, description?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'transaction',
      title,
      description,
      ...options
    });
  }, [addNotification]);

  const notifySystem = useCallback((title: string, description?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'system',
      title,
      description,
      ...options
    });
  }, [addNotification]);

  const notifyPromotion = useCallback((title: string, description?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'promotion',
      title,
      description,
      ...options
    });
  }, [addNotification]);

  // Transaction-specific notifications
  const notifyPaymentReceived = useCallback((amount: string, from: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'transaction',
      title: 'Pagamento recebido',
      description: `Você recebeu ${amount} de ${from}`,
      ...options
    });
  }, [addNotification]);

  const notifyPaymentSent = useCallback((amount: string, to: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'transaction',
      title: 'Pagamento enviado',
      description: `Você enviou ${amount} para ${to}`,
      ...options
    });
  }, [addNotification]);

  const notifyPaymentConfirmed = useCallback((transactionId: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'success',
      title: 'Pagamento confirmado',
      description: `Transação ${transactionId.slice(0, 8)}... foi confirmada`,
      ...options
    });
  }, [addNotification]);

  const notifyPaymentFailed = useCallback((reason: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'error',
      title: 'Pagamento falhou',
      description: reason,
      ...options
    });
  }, [addNotification]);

  // Chat-specific notifications
  const notifyNewMessage = useCallback((from: string, preview: string, avatar?: string, options?: Partial<NotificationOptions>) => {
    return addNotification({
      type: 'message',
      title: `Nova mensagem de ${from}`,
      description: preview,
      avatar,
      ...options
    });
  }, [addNotification]);

  return {
    // State
    notifications,
    toasts,
    unreadCount,
    soundEnabled,

    // Core methods
    notify,
    removeToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound,

    // Helper methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyMessage,
    notifyTransaction,
    notifySystem,
    notifyPromotion,

    // Transaction notifications
    notifyPaymentReceived,
    notifyPaymentSent,
    notifyPaymentConfirmed,
    notifyPaymentFailed,

    // Chat notifications
    notifyNewMessage
  };
};