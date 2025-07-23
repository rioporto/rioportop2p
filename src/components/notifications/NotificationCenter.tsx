import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Filter, 
  CheckCheck, 
  Trash2, 
  Bell,
  BellOff,
  Inbox
} from 'lucide-react';
import { NotificationType } from './NotificationToast';
import { useNotifications } from '../../hooks/useNotifications';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onClose?: () => void;
  isDropdown?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onClose,
  isDropdown = false
}) => {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    soundEnabled,
    toggleSound 
  } = useNotifications();

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const filtered = filter === 'all' 
      ? notifications 
      : notifications.filter(n => n.type === filter);

    const groups: Record<string, Notification[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filtered.forEach(notification => {
      const date = new Date(notification.timestamp);
      let groupKey: string;

      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ontem';
      } else {
        groupKey = date.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [notifications, filter]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const typeColors = {
    success: 'text-green-400 bg-green-500/20',
    error: 'text-red-400 bg-red-500/20',
    warning: 'text-yellow-400 bg-yellow-500/20',
    info: 'text-blue-400 bg-blue-500/20',
    message: 'text-purple-400 bg-purple-500/20',
    transaction: 'text-orange-400 bg-orange-500/20',
    system: 'text-gray-400 bg-gray-500/20',
    promotion: 'text-pink-400 bg-pink-500/20',
    all: 'text-gray-400 bg-gray-500/20'
  };

  const typeLabels = {
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Aviso',
    info: 'Informação',
    message: 'Mensagem',
    transaction: 'Transação',
    system: 'Sistema',
    promotion: 'Promoção',
    all: 'Todas'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        ${isDropdown 
          ? 'rounded-2xl shadow-2xl' 
          : 'fixed inset-0 md:inset-auto md:right-4 md:top-4 md:w-96 md:h-[600px] md:rounded-2xl'
        }
        bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
        border border-gray-700/50
        backdrop-blur-xl
        overflow-hidden
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" />
            Notificações
          </h3>
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSound}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? (
                <Bell className="w-4 h-4 text-gray-400" />
              ) : (
                <BellOff className="w-4 h-4 text-gray-500" />
              )}
            </motion.button>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-400" />
            </motion.button>

            {onClose && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                {(['all', 'transaction', 'message', 'success', 'error', 'warning', 'info', 'system', 'promotion'] as const).map((type) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(type)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${filter === type 
                        ? typeColors[type]
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                      }
                      transition-all duration-200
                    `}
                  >
                    {typeLabels[type]}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions Bar */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {notifications.filter(n => !n.read).length} não lidas
          </span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              Marcar todas como lidas
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAll}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Limpar tudo
            </motion.button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full p-8"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -5, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-4"
            >
              <Inbox className="w-16 h-16 text-gray-600" />
            </motion.div>
            <h4 className="text-lg font-medium text-gray-400 mb-2">
              Nenhuma notificação
            </h4>
            <p className="text-sm text-gray-500 text-center">
              Você está em dia! Novas notificações aparecerão aqui.
            </p>
          </motion.div>
        ) : (
          // Grouped Notifications
          <div className="divide-y divide-gray-700/30">
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date}>
                <div className="px-4 py-2 bg-gray-800/50 sticky top-0 z-10">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {date}
                  </h4>
                </div>
                <AnimatePresence>
                  {notifs.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: {
                          delay: index * 0.05
                        }
                      }}
                      exit={{ opacity: 0, x: 20 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        p-4 cursor-pointer transition-all
                        ${!notification.read ? 'bg-orange-500/5' : ''}
                        relative group
                      `}
                    >
                      {/* Unread Indicator */}
                      {!notification.read && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"
                        />
                      )}

                      <div className="flex gap-3 pl-4">
                        {/* Avatar or Icon */}
                        <div className="flex-shrink-0">
                          {notification.avatar ? (
                            <img 
                              src={notification.avatar} 
                              alt="" 
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center
                              ${typeColors[notification.type].split(' ')[1]}
                            `}>
                              <span className={`text-sm ${typeColors[notification.type].split(' ')[0]}`}>
                                {notification.type.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h5 className={`
                            text-sm font-medium 
                            ${notification.read ? 'text-gray-300' : 'text-white'}
                          `}>
                            {notification.title}
                          </h5>
                          {notification.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {notification.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};