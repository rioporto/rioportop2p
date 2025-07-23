import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface Activity {
  id: string;
  type: 'buy' | 'sell' | 'listing_created' | 'rating_received' | 'payment_received';
  title: string;
  description: string;
  amount?: string;
  currency?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  status?: 'pending' | 'completed' | 'cancelled';
  timestamp: Date;
  link?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  maxItems?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  maxItems = 10,
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'buy': return '🛒';
      case 'sell': return '💸';
      case 'listing_created': return '📝';
      case 'rating_received': return '⭐';
      case 'payment_received': return '💰';
      default: return '📊';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'buy': return 'text-green-500';
      case 'sell': return 'text-amber-500';
      case 'listing_created': return 'text-blue-500';
      case 'rating_received': return 'text-purple-500';
      case 'payment_received': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status?: Activity['status']) => {
    if (!status) return null;
    
    const variants = {
      pending: { variant: 'warning' as const, label: 'Pendente' },
      completed: { variant: 'success' as const, label: 'Concluído' },
      cancelled: { variant: 'danger' as const, label: 'Cancelado' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} size="sm" dot animated>
        {config.label}
      </Badge>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    if (diffInHours < 24) return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    if (diffInDays < 7) return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card variant="glass" className="animate-fadeIn">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle variant="gradient" size="xl">
            Atividade Recente
          </CardTitle>
          {activities.length > maxItems && (
            <Link href="/activities">
              <span className="text-sm text-blue-500 hover:text-blue-600 font-medium cursor-pointer">
                Ver todas →
              </span>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 opacity-50">📭</div>
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma atividade recente
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                index={index}
                getActivityIcon={getActivityIcon}
                getActivityColor={getActivityColor}
                getStatusBadge={getStatusBadge}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ActivityItemProps {
  activity: Activity;
  index: number;
  getActivityIcon: (type: Activity['type']) => string;
  getActivityColor: (type: Activity['type']) => string;
  getStatusBadge: (status?: Activity['status']) => React.ReactNode;
  formatTimeAgo: (date: Date) => string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  index,
  getActivityIcon,
  getActivityColor,
  getStatusBadge,
  formatTimeAgo,
}) => {
  const content = (
    <div
      className={cn(
        'group flex items-start gap-4 p-4 rounded-lg',
        'bg-gray-50 dark:bg-gray-800/50',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'transition-all duration-200',
        'animate-slideInLeft',
        activity.link && 'cursor-pointer'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-full',
        'bg-white dark:bg-gray-700',
        'flex items-center justify-center',
        'shadow-sm group-hover:shadow-md',
        'transition-all duration-200',
        'group-hover:scale-110'
      )}>
        <span className={cn('text-xl', getActivityColor(activity.type))}>
          {getActivityIcon(activity.type)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {activity.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {activity.description}
            </p>
            
            {/* Amount and Currency */}
            {activity.amount && (
              <div className="flex items-center gap-2 mt-2">
                <span className="font-semibold text-lg text-gray-900 dark:text-white">
                  {activity.amount}
                </span>
                {activity.currency && (
                  <Badge variant="primary" size="sm">
                    {activity.currency}
                  </Badge>
                )}
              </div>
            )}

            {/* User info */}
            {activity.user && (
              <div className="flex items-center gap-2 mt-2">
                <div className={cn(
                  'w-6 h-6 rounded-full bg-gradient-to-br',
                  'from-gray-300 to-gray-400',
                  'flex items-center justify-center text-xs font-bold text-white'
                )}>
                  {activity.user.avatar || activity.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.user.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(activity.status)}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimeAgo(activity.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (activity.link) {
    return <Link href={activity.link}>{content}</Link>;
  }

  return content;
};

// Activity Feed Widget for smaller displays
export const ActivityFeed: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'buy': return '🛒';
      case 'sell': return '💸';
      case 'listing_created': return '📝';
      case 'rating_received': return '⭐';
      case 'payment_received': return '💰';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-2">
      {activities.slice(0, 5).map((activity, index) => (
        <div
          key={activity.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'animate-fadeIn'
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <span className="text-lg">{getActivityIcon(activity.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(activity.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {activity.amount && (
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {activity.amount}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};