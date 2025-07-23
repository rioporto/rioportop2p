'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { 
  SendIcon, 
  AttachmentIcon, 
  EmojiIcon, 
  MicrophoneIcon,
  CameraIcon,
  DocumentIcon
} from '@/components/icons';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileSelect: (file: File) => void;
  onTyping?: () => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  showQuickActions?: boolean;
  quickActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    action: () => void;
  }>;
}

const popularEmojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '✅', '🙏', '😎', '🤝'];

export function ChatInput({
  value,
  onChange,
  onSend,
  onFileSelect,
  onTyping,
  disabled = false,
  loading = false,
  placeholder = 'Digite sua mensagem...',
  showQuickActions = false,
  quickActions = [],
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !loading) {
        onSend();
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + emoji + value.substring(end);
      onChange(newValue);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (accept?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || '*';
      fileInputRef.current.click();
    }
    setShowAttachmentMenu(false);
  };

  return (
    <div className="relative bg-white border-t border-gray-100">
      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-text-secondary whitespace-nowrap transition-colors"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              disabled={disabled}
              className={cn(
                'p-2 rounded-lg transition-all',
                'hover:bg-gray-100 active:scale-95',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <AttachmentIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Attachment Menu */}
            {showAttachmentMenu && (
              <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-10">
                <button
                  onClick={() => handleFileSelect('image/*')}
                  className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <CameraIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Imagem</span>
                </button>
                <button
                  onClick={() => handleFileSelect('.pdf,.doc,.docx,.txt')}
                  className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <DocumentIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">Documento</span>
                </button>
              </div>
            )}
          </div>

          {/* Input Container */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                onTyping?.();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || loading}
              rows={1}
              className={cn(
                'w-full px-4 py-2 pr-10 bg-gray-50 rounded-full resize-none',
                'border border-gray-200 focus:border-azul-bancario focus:outline-none',
                'transition-all duration-200',
                'placeholder:text-gray-400',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-[40px] max-h-[120px]'
              )}
              style={{ scrollbarWidth: 'thin' }}
            />

            {/* Emoji Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
              className={cn(
                'absolute right-2 bottom-2 p-1.5 rounded-lg transition-all',
                'hover:bg-gray-200 active:scale-95',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <EmojiIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
                <div className="grid grid-cols-5 gap-2">
                  {popularEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          {value.trim() ? (
            <Button
              onClick={onSend}
              disabled={disabled || loading || !value.trim()}
              loading={loading}
              className="rounded-full p-2 min-w-[40px] h-[40px]"
            >
              <SendIcon className="w-5 h-5" />
            </Button>
          ) : (
            <button
              disabled={disabled}
              className={cn(
                'p-2 rounded-full bg-gray-100 transition-all',
                'hover:bg-gray-200 active:scale-95',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <MicrophoneIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
    </div>
  );
}