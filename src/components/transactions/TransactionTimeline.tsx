'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Package,
  CreditCard,
  Shield,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'created' | 'payment_confirmed' | 'escrow_locked' | 'escrow_released' | 
        'completed' | 'disputed' | 'cancelled' | 'message' | 'rating';
  title: string;
  description?: string;
  timestamp: Date | string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface ITransactionTimelineProps {
  events: TimelineEvent[];
  currentEventId?: string;
  orientation?: 'vertical' | 'horizontal';
  showDetails?: boolean;
  className?: string;
}

const eventConfig = {
  created: {
    icon: Package,
    color: 'blue',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-600',
  },
  payment_confirmed: {
    icon: CreditCard,
    color: 'green',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    iconColor: 'text-green-600',
  },
  escrow_locked: {
    icon: Lock,
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-500',
    iconColor: 'text-indigo-600',
  },
  escrow_released: {
    icon: Unlock,
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-500',
    iconColor: 'text-emerald-600',
  },
  completed: {
    icon: CheckCircle,
    color: 'green',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    iconColor: 'text-green-600',
  },
  disputed: {
    icon: AlertCircle,
    color: 'red',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    iconColor: 'text-red-600',
  },
  cancelled: {
    icon: XCircle,
    color: 'gray',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
    iconColor: 'text-gray-600',
  },
  message: {
    icon: MessageSquare,
    color: 'purple',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    iconColor: 'text-purple-600',
  },
  rating: {
    icon: TrendingUp,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-500',
    iconColor: 'text-yellow-600',
  },
};

export function TransactionTimeline({
  events,
  currentEventId,
  orientation = 'vertical',
  showDetails = true,
  className
}: ITransactionTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn('relative', className)}>
      {/* Timeline Line */}
      <div
        className={cn(
          'absolute bg-gray-200',
          isVertical
            ? 'left-6 top-0 bottom-0 w-0.5'
            : 'top-6 left-0 right-0 h-0.5'
        )}
      >
        <motion.div
          className={cn(
            'bg-gradient-to-b from-blue-500 to-indigo-600',
            isVertical ? 'w-full' : 'h-full'
          )}
          initial={{ [isVertical ? 'height' : 'width']: '0%' }}
          animate={{ [isVertical ? 'height' : 'width']: '100%' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>

      {/* Events */}
      <div
        className={cn(
          'relative',
          isVertical ? 'space-y-8' : 'flex space-x-8 overflow-x-auto pb-4'
        )}
      >
        <AnimatePresence>
          {sortedEvents.map((event, index) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            const isCurrent = event.id === currentEventId;
            const isPast = currentEventId ? 
              sortedEvents.findIndex(e => e.id === currentEventId) > index : 
              true;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative',
                  isVertical ? 'flex items-start gap-4' : 'flex flex-col items-center min-w-[200px]'
                )}
              >
                {/* Event Dot/Icon */}
                <motion.div
                  className={cn(
                    'relative z-20 flex-shrink-0',
                    'w-12 h-12 rounded-full',
                    'flex items-center justify-center',
                    'border-4 shadow-lg transition-all duration-300',
                    config.bgColor,
                    isPast ? config.borderColor : 'border-gray-300',
                    isCurrent && 'ring-4 ring-opacity-50',
                    isCurrent && `ring-${config.color}-500`
                  )}
                  animate={isCurrent ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: isCurrent ? Infinity : 0,
                    ease: 'easeInOut',
                  }}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6',
                      isPast ? config.iconColor : 'text-gray-400'
                    )}
                  />
                </motion.div>

                {/* Event Content */}
                <motion.div
                  className={cn(
                    'flex-1',
                    isVertical ? '' : 'mt-4 text-center'
                  )}
                  initial={{ x: isVertical ? -20 : 0, y: isVertical ? 0 : 20 }}
                  animate={{ x: 0, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {/* Timestamp */}
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {/* Title */}
                  <h4
                    className={cn(
                      'font-semibold mb-1',
                      isPast ? 'text-gray-900' : 'text-gray-400'
                    )}
                  >
                    {event.title}
                  </h4>

                  {/* Description */}
                  {showDetails && event.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {event.description}
                    </p>
                  )}

                  {/* User Info */}
                  {event.user && (
                    <div className="flex items-center gap-2 mt-2">
                      {event.user.avatar ? (
                        <img
                          src={event.user.avatar}
                          alt={event.user.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <span className="text-xs text-gray-600">{event.user.name}</span>
                    </div>
                  )}

                  {/* Metadata Pills */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Current Event Pulse */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full',
                        `bg-${config.color}-500 opacity-30`
                      )}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      {orientation === 'horizontal' && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-1">
            {sortedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  event.id === currentEventId
                    ? 'w-6 bg-blue-600'
                    : 'bg-gray-300'
                )}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}