import { useState, useEffect, useCallback } from 'react';
import { WebSocketService } from '@/services/chat/websocket.service';
import { Message } from '@prisma/client';

interface ChatMessage extends Message {
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface UseChatProps {
  transactionId: string;
  userId: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string, type?: 'TEXT' | 'FILE') => Promise<void>;
  startTyping: () => void;
  isTyping: boolean;
  typingUser: string | null;
}

const wsService = new WebSocketService();

export function useChat({ transactionId, userId }: UseChatProps): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Carregar mensagens iniciais
  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat?transactionId=${transactionId}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar mensagens');
      }
      const data = await response.json();
      setMessages(data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  // Inicializar WebSocket
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await wsService.initializePusher(userId);
        wsService.subscribeToTransaction(transactionId);

        // Configurar handlers
        wsService.setEventHandlers({
          onMessage: (message) => {
            setMessages((prev) => [...prev, message]);
          },
          onTyping: (typingUserId) => {
            if (typingUserId !== userId) {
              setTypingUser(typingUserId);
              setIsTyping(true);

              // Limpar status de digitação após 3 segundos
              if (typingTimeout) {
                clearTimeout(typingTimeout);
              }
              const timeout = setTimeout(() => {
                setIsTyping(false);
                setTypingUser(null);
              }, 3000);
              setTypingTimeout(timeout);
            }
          },
          onError: (err) => {
            setError(err);
          }
        });

        // Carregar mensagens iniciais
        await loadMessages();
      } catch (err) {
        setError(err as Error);
      }
    };

    initializeChat();

    return () => {
      // Cleanup
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      wsService.unsubscribeFromTransaction(transactionId);
    };
  }, [transactionId, userId, loadMessages]);

  // Enviar mensagem
  const sendMessage = async (content: string, type: 'TEXT' | 'FILE' = 'TEXT') => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          content,
          type
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Notificar que está digitando
  const startTyping = useCallback(() => {
    wsService.notifyTyping(transactionId);
  }, [transactionId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    startTyping,
    isTyping,
    typingUser
  };
} 