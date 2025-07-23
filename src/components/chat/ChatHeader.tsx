'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeftIcon, 
  InfoIcon, 
  PhoneIcon, 
  VideoIcon,
  MoreVerticalIcon 
} from '@/components/icons';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  status?: 'online' | 'offline' | 'typing';
  badge?: React.ReactNode;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  onBack?: () => void;
  onInfo?: () => void;
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
  className?: string;
}

export function ChatHeader({
  title,
  subtitle,
  status,
  badge,
  connectionStatus = 'connected',
  onBack,
  onInfo,
  actions = [],
  className,
}: ChatHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const getStatusText = () => {
    if (status === 'typing') return 'digitando...';
    if (status === 'online') return 'online';
    if (status === 'offline') return 'offline';
    return '';
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-verde-sucesso';
      case 'connecting':
        return 'bg-amarelo-alerta animate-pulse';
      case 'disconnected':
        return 'bg-vermelho-alerta';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <header className={cn(
      'bg-white border-b border-gray-100 shadow-sm',
      className
    )}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-azul-bancario to-azul-escuro rounded-full flex items-center justify-center text-white font-semibold">
                {title.charAt(0).toUpperCase()}
              </div>
              {status === 'online' && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-verde-sucesso rounded-full border-2 border-white" />
              )}
            </div>

            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-text-primary truncate">
                  {title}
                </h1>
                {badge}
              </div>
              {(subtitle || status) && (
                <p className={cn(
                  'text-sm truncate',
                  status === 'typing' ? 'text-azul-bancario' : 'text-text-secondary'
                )}>
                  {subtitle || getStatusText()}
                </p>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2 mr-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                getConnectionColor()
              )} />
              <span className="text-xs text-text-secondary hidden sm:inline">
                {connectionStatus === 'connected' ? 'Conectado' : 
                 connectionStatus === 'connecting' ? 'Conectando' : 
                 'Desconectado'}
              </span>
            </div>

            {/* Action Buttons */}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={action.label}
              >
                {action.icon}
              </button>
            ))}

            {/* Info Button */}
            {onInfo && (
              <button
                onClick={onInfo}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Informações"
              >
                <InfoIcon className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* More Options */}
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Mais opções"
            >
              <MoreVerticalIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Quick Info (Optional) */}
      {badge && (
        <div className="px-4 pb-3 -mt-1">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="font-medium">Transação:</span>
            {badge}
          </div>
        </div>
      )}
    </header>
  );
}