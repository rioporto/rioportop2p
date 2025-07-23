'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { CheckIcon, DoubleCheckIcon, ClockIcon } from '@/components/icons';

interface MessageBubbleProps {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  timestamp: Date;
  isMe: boolean;
  senderName: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  fileUrl?: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReply?: () => void;
  onReact?: (emoji: string) => void;
  reactions?: { emoji: string; count: number; hasReacted: boolean }[];
  replyTo?: {
    content: string;
    senderName: string;
  };
}

export function MessageBubble({
  id,
  content,
  type,
  timestamp,
  isMe,
  senderName,
  status = 'sent',
  fileUrl,
  isFirstInGroup = false,
  isLastInGroup = false,
  onReply,
  onReact,
  reactions = [],
  replyTo,
}: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ptBR });
    } else if (isYesterday(date)) {
      return `Ontem ${format(date, 'HH:mm', { locale: ptBR })}`;
    }
    return format(date, 'dd/MM HH:mm', { locale: ptBR });
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <ClockIcon className="w-3 h-3" />;
      case 'sent':
        return <CheckIcon className="w-3 h-3" />;
      case 'delivered':
        return <DoubleCheckIcon className="w-3 h-3" />;
      case 'read':
        return <DoubleCheckIcon className="w-3 h-3 text-azul-bancario" />;
      default:
        return null;
    }
  };

  const bubbleClasses = cn(
    'relative max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
    'transition-all duration-200 hover:shadow-md',
    {
      // Mensagens enviadas
      'bg-gradient-to-br from-azul-bancario to-azul-escuro text-white': isMe && type !== 'SYSTEM',
      'ml-auto': isMe && type !== 'SYSTEM',
      
      // Mensagens recebidas
      'bg-white border border-gray-100': !isMe && type !== 'SYSTEM',
      'mr-auto': !isMe && type !== 'SYSTEM',
      
      // Mensagens do sistema
      'bg-gradient-to-r from-gray-50 to-gray-100 text-text-secondary mx-auto max-w-[85%]': type === 'SYSTEM',
      'border border-gray-200': type === 'SYSTEM',
      
      // Cantos arredondados especiais
      'rounded-tl-sm': !isMe && isFirstInGroup && type !== 'SYSTEM',
      'rounded-tr-sm': isMe && isFirstInGroup && type !== 'SYSTEM',
      'rounded-bl-sm': !isMe && isLastInGroup && type !== 'SYSTEM',
      'rounded-br-sm': isMe && isLastInGroup && type !== 'SYSTEM',
    }
  );

  const renderContent = () => {
    switch (type) {
      case 'TEXT':
        return (
          <p className="break-words whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        );

      case 'IMAGE':
        return (
          <div className="relative">
            <img
              src={fileUrl}
              alt={content}
              className="max-w-full rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(fileUrl, '_blank')}
            />
            {content && (
              <p className="mt-2 text-sm opacity-90">{content}</p>
            )}
          </div>
        );

      case 'FILE':
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg transition-colors',
              isMe 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-50 hover:bg-gray-100 text-azul-bancario'
            )}
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{content}</p>
              <p className="text-xs opacity-70">Clique para baixar</p>
            </div>
          </a>
        );

      case 'SYSTEM':
        return (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="default" className="bg-gray-200 text-gray-700">
              Sistema
            </Badge>
            <span>{content}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'group relative mb-1',
        isMe ? 'flex justify-end' : 'flex justify-start',
        type === 'SYSTEM' && 'justify-center my-4'
      )}
    >
      <div className={bubbleClasses}>
        {/* Reply indicator */}
        {replyTo && (
          <div className={cn(
            'mb-2 p-2 rounded-lg text-sm',
            isMe ? 'bg-white/10' : 'bg-gray-50'
          )}>
            <p className="font-medium opacity-70">{replyTo.senderName}</p>
            <p className="opacity-60 truncate">{replyTo.content}</p>
          </div>
        )}

        {/* Sender name (for received messages) */}
        {!isMe && type !== 'SYSTEM' && isFirstInGroup && (
          <p className="text-xs font-semibold mb-1 text-azul-bancario">
            {senderName}
          </p>
        )}

        {/* Message content */}
        {renderContent()}

        {/* Timestamp and status */}
        {type !== 'SYSTEM' && (
          <div className={cn(
            'flex items-center gap-1 mt-1',
            'text-xs',
            isMe ? 'text-white/70 justify-end' : 'text-gray-500'
          )}>
            <span>{formatTime(timestamp)}</span>
            {isMe && getStatusIcon()}
          </div>
        )}

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="absolute -bottom-3 left-2 flex gap-1">
            {reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => onReact?.(reaction.emoji)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                  'bg-white border shadow-sm hover:shadow-md transition-all',
                  reaction.hasReacted 
                    ? 'border-azul-bancario bg-azul-bancario/5' 
                    : 'border-gray-200'
                )}
              >
                <span>{reaction.emoji}</span>
                {reaction.count > 1 && <span>{reaction.count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Quick actions (visible on hover) */}
        {type !== 'SYSTEM' && (
          <div className={cn(
            'absolute top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isMe ? '-left-20' : '-right-20'
          )}>
            <button
              onClick={onReply}
              className="p-1.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
              title="Responder"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" 
                />
              </svg>
            </button>
            <button
              onClick={() => onReact?.('👍')}
              className="p-1.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
              title="Reagir"
            >
              <span className="text-sm">😊</span>
            </button>
          </div>
        )}
      </div>

      {/* Tail for last message in group */}
      {isLastInGroup && type !== 'SYSTEM' && (
        <div
          className={cn(
            'absolute bottom-0 w-0 h-0',
            isMe ? 'right-3' : 'left-3',
            isMe ? 'border-l-[8px] border-l-transparent border-t-[8px] border-t-azul-escuro' 
                 : 'border-r-[8px] border-r-transparent border-t-[8px] border-t-white'
          )}
        />
      )}
    </div>
  );
}