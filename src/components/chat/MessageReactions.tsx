'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users?: string[];
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  position?: 'bottom' | 'top';
  className?: string;
}

const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

export function MessageReactions({
  reactions,
  onReact,
  position = 'bottom',
  className,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    onReact(emoji);
    setShowPicker(false);
  };

  if (reactions.length === 0 && !showPicker) return null;

  return (
    <div
      className={cn(
        'absolute left-2 flex items-center gap-1',
        position === 'bottom' ? '-bottom-3' : '-top-3',
        className
      )}
    >
      {/* Existing reactions */}
      {reactions.map((reaction, index) => (
        <button
          key={index}
          onClick={() => handleReaction(reaction.emoji)}
          className={cn(
            'group relative flex items-center gap-1 px-2 py-1 rounded-full text-xs',
            'bg-white border shadow-sm hover:shadow-md transition-all transform hover:scale-105',
            reaction.hasReacted 
              ? 'border-azul-bancario bg-azul-bancario/5' 
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <span className="text-base leading-none">{reaction.emoji}</span>
          {reaction.count > 1 && (
            <span className={cn(
              'font-medium',
              reaction.hasReacted ? 'text-azul-bancario' : 'text-gray-600'
            )}>
              {reaction.count}
            </span>
          )}

          {/* Tooltip with users */}
          {reaction.users && reaction.users.length > 0 && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {reaction.users.join(', ')}
            </div>
          )}
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
        >
          <span className="text-gray-400 text-sm">+</span>
        </button>

        {/* Emoji picker */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="grid grid-cols-4 gap-1">
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-1.5 text-xl hover:bg-gray-100 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Floating reaction animation component
export function FloatingReaction({ 
  emoji, 
  onComplete 
}: { 
  emoji: string; 
  onComplete: () => void;
}) {
  return (
    <div 
      className="fixed pointer-events-none animate-float-up"
      onAnimationEnd={onComplete}
      style={{
        left: '50%',
        bottom: '100px',
        transform: 'translateX(-50%)',
      }}
    >
      <span className="text-4xl">{emoji}</span>
    </div>
  );
}