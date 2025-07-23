import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  MessageCircle,
  DollarSign,
  Bell,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'message' | 'transaction' | 'system' | 'promotion';
export type NotificationPosition = 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';

interface NotificationToastProps {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  position?: NotificationPosition;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  onClose: (id: string) => void;
  avatar?: string;
  timestamp?: Date;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  message: MessageCircle,
  transaction: DollarSign,
  system: Bell,
  promotion: Sparkles
};

const colorMap = {
  success: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
  error: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
  warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
  info: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
  message: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
  transaction: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
  system: 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400',
  promotion: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400'
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4'
};

const getAnimationVariants = (position: NotificationPosition) => {
  const isTop = position.includes('top');
  const isRight = position.includes('right');
  const isLeft = position.includes('left');
  const isCenter = position.includes('center');

  return {
    initial: {
      opacity: 0,
      scale: 0.9,
      x: isCenter ? 0 : isRight ? 100 : isLeft ? -100 : 0,
      y: isTop ? -50 : 50,
    },
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      x: isCenter ? 0 : isRight ? 100 : isLeft ? -100 : 0,
      transition: {
        duration: 0.2
      }
    }
  };
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  type,
  title,
  description,
  position = 'top-right',
  duration = 5000,
  actions,
  onClose,
  avatar,
  timestamp
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const Icon = iconMap[type];
  const colorClass = colorMap[type];
  const variants = getAnimationVariants(position);

  useEffect(() => {
    if (duration && !isPaused) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            onClose(id);
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration, id, onClose, isPaused]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `há ${minutes}min`;
    if (minutes < 1440) return `há ${Math.floor(minutes / 60)}h`;
    return `há ${Math.floor(minutes / 1440)}d`;
  };

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`
        fixed z-50 w-full max-w-sm
        ${positionClasses[position]}
      `}
    >
      <div className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl
        bg-gradient-to-br ${colorClass}
        shadow-2xl shadow-black/20
      `}>
        {/* Progress Bar */}
        {duration && (
          <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
            <motion.div
              className={`h-full bg-gradient-to-r ${colorClass.split(' ')[4]}`}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex gap-3">
            {/* Icon or Avatar */}
            <div className="flex-shrink-0">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="" 
                  className="w-10 h-10 rounded-full ring-2 ring-white/20"
                />
              ) : (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    bg-gradient-to-br ${colorClass.split(' ').slice(0, 2).join(' ')}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white">
                    {title}
                  </h4>
                  {description && (
                    <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                      {description}
                    </p>
                  )}
                  {timestamp && (
                    <p className="mt-1 text-xs text-gray-400">
                      {formatTimestamp(timestamp)}
                    </p>
                  )}
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onClose(id)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              {/* Actions */}
              {actions && actions.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {actions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={action.onClick}
                      className={`
                        px-3 py-1 text-xs font-medium rounded-lg
                        ${action.variant === 'primary' 
                          ? 'bg-white/20 hover:bg-white/30' 
                          : 'bg-white/10 hover:bg-white/20'
                        }
                        transition-colors
                      `}
                    >
                      {action.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  notifications: Array<NotificationToastProps & { id: string }>;
  position?: NotificationPosition;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  position = 'top-right',
  onClose
}) => {
  const isTop = position.includes('top');

  return (
    <div className={`
      fixed z-50 pointer-events-none
      ${positionClasses[position]}
    `}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0, y: isTop ? -20 : 20 }}
            animate={{ 
              opacity: 1, 
              y: isTop ? index * 100 : -index * 100,
              transition: {
                delay: index * 0.05
              }
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-auto mb-3"
          >
            <NotificationToast
              {...notification}
              position={position}
              onClose={onClose}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};