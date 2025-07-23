import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: string;
  variant: 'primary' | 'success' | 'warning' | 'secondary';
  gradient?: 'primary' | 'success' | 'warning' | 'secondary';
  badge?: {
    text: string;
    variant: 'primary' | 'success' | 'warning' | 'danger';
  };
}

const defaultActions: QuickAction[] = [
  {
    title: 'Comprar Crypto',
    description: 'Encontre as melhores ofertas',
    href: '/listings?type=sell',
    icon: '🛒',
    variant: 'success',
    gradient: 'success',
  },
  {
    title: 'Vender Crypto',
    description: 'Publique seu anúncio agora',
    href: '/listings?type=buy',
    icon: '💸',
    variant: 'warning',
    gradient: 'warning',
  },
  {
    title: 'Criar Anúncio',
    description: 'Comece a negociar',
    href: '/listings/new',
    icon: '📝',
    variant: 'primary',
    gradient: 'primary',
  },
  {
    title: 'Mensagens',
    description: 'Chat com negociadores',
    href: '/messages',
    icon: '💬',
    variant: 'secondary',
    gradient: 'secondary',
    badge: {
      text: '3',
      variant: 'danger',
    },
  },
];

interface QuickActionsProps {
  unreadMessages?: number;
  customActions?: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  unreadMessages = 0,
  customActions,
}) => {
  const actions = customActions || defaultActions.map(action => {
    if (action.title === 'Mensagens' && unreadMessages > 0) {
      return {
        ...action,
        badge: {
          text: unreadMessages.toString(),
          variant: 'danger' as const,
        },
      };
    }
    return action;
  });

  return (
    <Card variant="glass" className="animate-fadeIn">
      <CardHeader>
        <CardTitle variant="gradient" size="xl">
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button
              variant="gradient"
              gradient={action.gradient}
              size="lg"
              fullWidth
              className={cn(
                'h-auto py-4 px-6 group relative overflow-hidden',
                'transform transition-all duration-300',
                'hover:scale-[1.02] hover:shadow-2xl',
                index === 0 && 'animate-slideInLeft',
                index === 1 && 'animate-slideInRight',
                index === 2 && 'animate-slideInLeft animation-delay-100',
                index === 3 && 'animate-slideInRight animation-delay-100'
              )}
              glow
              glowColor={action.variant as any}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'text-3xl transform transition-all duration-300',
                    'group-hover:scale-110 group-hover:rotate-12'
                  )}>
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg flex items-center gap-2">
                      {action.title}
                      {action.badge && (
                        <Badge
                          variant={action.badge.variant}
                          size="sm"
                          animated
                          className="ml-2"
                        >
                          {action.badge.text}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm opacity-90">
                      {action.description}
                    </div>
                  </div>
                </div>
                <span className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>

              {/* Animated background effect */}
              <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                <div className="absolute inset-0 bg-white animate-pulse" />
              </div>

              {/* Ripple effect on hover */}
              <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
                <div className={cn(
                  'absolute top-1/2 left-1/2 w-0 h-0 rounded-full',
                  'bg-white opacity-0 group-hover:opacity-30',
                  'group-hover:w-[200%] group-hover:h-[200%]',
                  'transform -translate-x-1/2 -translate-y-1/2',
                  'transition-all duration-700 ease-out'
                )} />
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

// Mini Quick Actions for mobile
export const MiniQuickActions: React.FC<QuickActionsProps> = ({
  unreadMessages = 0,
}) => {
  const miniActions = [
    { icon: '🛒', label: 'Comprar', href: '/listings?type=sell', color: 'text-green-500' },
    { icon: '💸', label: 'Vender', href: '/listings?type=buy', color: 'text-amber-500' },
    { icon: '📝', label: 'Anunciar', href: '/listings/new', color: 'text-blue-500' },
    { 
      icon: '💬', 
      label: 'Chat', 
      href: '/messages', 
      color: 'text-purple-500',
      badge: unreadMessages > 0 ? unreadMessages : undefined 
    },
  ];

  return (
    <div className="flex justify-around items-center py-4 px-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {miniActions.map((action, index) => (
        <Link key={index} href={action.href}>
          <div className="relative group cursor-pointer">
            <div className={cn(
              'flex flex-col items-center gap-1 p-2',
              'transform transition-all duration-200',
              'group-hover:scale-110'
            )}>
              <div className={cn(
                'text-2xl',
                action.color,
                'transition-transform duration-200',
                'group-hover:rotate-12'
              )}>
                {action.icon}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {action.label}
              </span>
            </div>
            {action.badge && (
              <Badge
                variant="danger"
                size="sm"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 p-0 flex items-center justify-center"
                animated
              >
                {action.badge}
              </Badge>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};