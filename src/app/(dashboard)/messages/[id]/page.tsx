'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { webSocketService, ChatMessage } from '@/services/chat/websocket.service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { XIcon } from '@/components/icons';

// Novos componentes de chat
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { FloatingReaction } from '@/components/chat/MessageReactions';

interface Transaction {
  id: string;
  status: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  totalPrice: number;
  listing: {
    cryptocurrency: string;
    fiatCurrency: string;
  };
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  seller: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Message extends ChatMessage {
  sender: {
    id: string;
    name: string;
    isMe: boolean;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  fileUrl?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: { emoji: string; count: number; hasReacted: boolean }[];
  replyTo?: {
    content: string;
    senderName: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Carregar dados da transação e mensagens
  const fetchTransactionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar dados da transação
      const transactionRes = await fetch(`/api/transactions/${transactionId}`);
      if (!transactionRes.ok) {
        if (transactionRes.status === 403) {
          setError('Você não tem permissão para acessar este chat');
          return;
        }
        throw new Error('Erro ao carregar transação');
      }
      const transactionData = await transactionRes.json();
      setTransaction(transactionData.data);

      // Buscar mensagens
      const messagesRes = await fetch(`/api/chat?transactionId=${transactionId}`);
      if (!messagesRes.ok) {
        throw new Error('Erro ao carregar mensagens');
      }
      const messagesData = await messagesRes.json();
      
      // Formatar mensagens com status
      const formattedMessages = (messagesData.data.messages || []).map((msg: any) => ({
        ...msg,
        status: 'read' as const,
        sender: {
          id: msg.senderId,
          name: msg.senderName,
          isMe: msg.senderId === session?.user?.id
        },
        createdAt: new Date(msg.createdAt || msg.timestamp),
        reactions: []
      }));
      
      setMessages(formattedMessages);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar WebSocket
  const initializeWebSocket = async () => {
    if (!session?.user?.id) return;

    try {
      await webSocketService.initializePusher(session.user.id);
      
      // Configurar handlers de eventos
      webSocketService.setEventHandlers({
        onMessage: (message: ChatMessage) => {
          const formattedMessage: Message = {
            ...message,
            sender: {
              id: message.senderId,
              name: message.senderName,
              isMe: message.senderId === session.user!.id
            },
            isRead: false,
            createdAt: new Date(message.timestamp),
            status: 'delivered'
          };
          
          setMessages(prev => [...prev, formattedMessage]);
          scrollToBottom();
        },
        onTyping: (userId: string) => {
          if (userId !== session.user!.id) {
            setTypingUser(userId);
            setIsTyping(true);
          }
        },
        // TODO: Implementar onStopTyping no WebSocketService
        // onStopTyping: () => {
        //   setIsTyping(false);
        //   setTypingUser(null);
        // },
        onError: (error: Error) => {
          console.error('WebSocket error:', error);
          setError('Erro de conexão com o chat');
        }
      });

      // Inscrever-se no canal da transação
      webSocketService.subscribeToTransaction(transactionId);
      
      // TODO: Implementar getConnectionStatus no WebSocketService
      // const interval = setInterval(() => {
      //   setConnectionStatus(webSocketService.getConnectionStatus());
      // }, 1000);
      // return () => clearInterval(interval);
    } catch (err) {
      console.error('Erro ao inicializar WebSocket:', err);
      setError('Erro ao conectar ao chat em tempo real');
    }
  };

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          content: messageContent,
          type: 'TEXT',
          replyToId: replyingTo?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();
      
      // Adicionar mensagem localmente se o WebSocket não estiver conectado
      if (connectionStatus !== 'connected') {
        const formattedMessage: Message = {
          ...data.data,
          sender: {
            id: session?.user?.id || '',
            name: session?.user ? `${session.user.name}` : 'Usuário',
            isMe: true
          },
          timestamp: new Date(data.data.createdAt),
          transactionId,
          type: 'TEXT',
          status: 'sent',
          replyTo: replyingTo ? {
            content: replyingTo.content,
            senderName: replyingTo.sender.name
          } : undefined
        };
        setMessages(prev => [...prev, formattedMessage]);
        scrollToBottom();
      }

      setReplyingTo(null);

    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Erro ao enviar mensagem');
      setNewMessage(messageContent); // Restaurar mensagem em caso de erro
    } finally {
      setIsSending(false);
    }
  };

  // Lidar com upload de arquivo
  const handleFileSelect = async (file: File) => {
    // Validar tamanho do arquivo (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 10MB');
      return;
    }

    setIsSending(true);
    
    try {
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('transactionId', transactionId);

      // Upload do arquivo
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      const { fileUrl } = await uploadRes.json();

      // Enviar mensagem com arquivo
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          content: file.name,
          type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
          fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar arquivo');
      }

    } catch (err) {
      console.error('Erro ao enviar arquivo:', err);
      setError('Erro ao enviar arquivo');
    } finally {
      setIsSending(false);
    }
  };

  // Lidar com digitação
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // TODO: Implementar emitTyping e emitStopTyping no WebSocketService
    // webSocketService.emitTyping(transactionId);

    // typingTimeoutRef.current = setTimeout(() => {
    //   webSocketService.emitStopTyping(transactionId);
    // }, 2000);
  };

  // Lidar com reações
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.hasReacted) {
            // Remover reação
            return {
              ...msg,
              reactions: reactions.filter(r => r.emoji !== emoji)
            };
          } else {
            // Adicionar reação
            return {
              ...msg,
              reactions: reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, hasReacted: true }
                  : r
              )
            };
          }
        } else {
          // Nova reação
          return {
            ...msg,
            reactions: [...reactions, { emoji, count: 1, hasReacted: true }]
          };
        }
      }
      return msg;
    }));

    // Mostrar animação de reação flutuante
    setFloatingReaction(emoji);
  };

  // Formatar status da transação
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
      PENDING: { label: 'Pendente', variant: 'warning' },
      AWAITING_PAYMENT: { label: 'Aguardando Pagamento', variant: 'warning' },
      PAYMENT_CONFIRMED: { label: 'Pagamento Confirmado', variant: 'success' },
      RELEASING_CRYPTO: { label: 'Liberando Crypto', variant: 'default' },
      COMPLETED: { label: 'Concluída', variant: 'success' },
      CANCELLED: { label: 'Cancelada', variant: 'danger' },
      DISPUTED: { label: 'Em Disputa', variant: 'danger' },
    };

    const config = statusMap[status] || { label: status, variant: 'default' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Obter informações da contraparte
  const getCounterparty = useCallback(() => {
    if (!transaction || !session?.user?.id) return null;
    
    const isBuyer = transaction.buyerId === session.user!.id;
    return isBuyer ? transaction.seller : transaction.buyer;
  }, [transaction, session]);

  // Agrupar mensagens por data
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: Date; messages: Message[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
      const lastGroup = groups[groups.length - 1];
      
      if (!lastGroup || !isSameDay(messageDate, lastGroup.date)) {
        groups.push({ date: messageDate, messages: [message] });
      } else {
        lastGroup.messages.push(message);
      }
    });
    
    return groups;
  };

  // Renderizar separador de data
  const renderDateSeparator = (date: Date) => {
    let dateLabel = '';
    
    if (isToday(date)) {
      dateLabel = 'Hoje';
    } else if (isYesterday(date)) {
      dateLabel = 'Ontem';
    } else {
      dateLabel = format(date, "d 'de' MMMM", { locale: ptBR });
    }
    
    return (
      <div className="flex items-center justify-center my-6">
        <div className="px-4 py-1 bg-gray-100 rounded-full text-sm text-text-secondary">
          {dateLabel}
        </div>
      </div>
    );
  };

  // Quick Actions
  const quickActions = [
    {
      label: 'Enviar PIX',
      icon: <span className="text-lg">💸</span>,
      action: () => console.log('PIX')
    },
    {
      label: 'Confirmar Pagamento',
      icon: <span className="text-lg">✅</span>,
      action: () => console.log('Confirmar')
    },
    {
      label: 'Abrir Disputa',
      icon: <span className="text-lg">🚨</span>,
      action: () => console.log('Disputa')
    }
  ];

  // Effects
  useEffect(() => {
    if (session?.user?.id && transactionId) {
      fetchTransactionData();
      initializeWebSocket();
    }

    return () => {
      // TODO: Implementar isSubscribed no WebSocketService
      // if (webSocketService.isSubscribed(transactionId)) {
      webSocketService.unsubscribeFromTransaction(transactionId);
      // }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [session, transactionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-bancario"></div>
      </div>
    );
  }

  // Error state
  if (error && !transaction) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 text-center">
          <p className="text-vermelho-alerta mb-4">{error}</p>
          <Button onClick={() => router.push('/trades')}>
            Voltar para Transações
          </Button>
        </Card>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 text-center">
          <p className="text-text-secondary mb-4">Transação não encontrada</p>
          <Button onClick={() => router.push('/trades')}>
            Voltar para Transações
          </Button>
        </Card>
      </div>
    );
  }

  const counterparty = getCounterparty();
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <ChatHeader
        title={`${counterparty?.firstName} ${counterparty?.lastName}`}
        subtitle={`${transaction.amount} ${transaction.listing.cryptocurrency} • R$ ${transaction.totalPrice.toLocaleString('pt-BR')}`}
        status={isTyping ? 'typing' : 'online'}
        badge={getStatusBadge(transaction.status)}
        connectionStatus={connectionStatus}
        onBack={() => router.push('/trades')}
        onInfo={() => console.log('Info')}
      />

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center text-text-secondary py-8">
              <p className="mb-2">Nenhuma mensagem ainda</p>
              <p className="text-sm">Inicie a conversa para negociar com segurança!</p>
            </div>
          ) : (
            <>
              {messageGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {renderDateSeparator(group.date)}
                  {group.messages.map((message, index) => {
                    const prevMessage = index > 0 ? group.messages[index - 1] : null;
                    const nextMessage = index < group.messages.length - 1 ? group.messages[index + 1] : null;
                    
                    const isFirstInGroup = !prevMessage || prevMessage.sender.id !== message.sender.id;
                    const isLastInGroup = !nextMessage || nextMessage.sender.id !== message.sender.id;
                    
                    return (
                      <div key={message.id} className="animate-message-appear">
                        <MessageBubble
                          {...message}
                          type={message.type.toUpperCase() as 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'}
                          isMe={message.sender.isMe}
                          timestamp={new Date(message.createdAt)}
                          isFirstInGroup={isFirstInGroup}
                          isLastInGroup={isLastInGroup}
                          onReply={() => setReplyingTo(message)}
                          onReact={(emoji) => handleReaction(message.id, emoji)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <TypingIndicator 
                  userName={counterparty?.firstName}
                  className="mt-2"
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <div className="container mx-auto max-w-4xl flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-text-secondary">Respondendo a {replyingTo.sender.name}</p>
              <p className="text-sm text-text-primary truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <ChatInput
        transactionId={transactionId}
        userId={session?.user?.id || ''}
        disabled={isSending}
        loading={isSending}
        placeholder="Digite sua mensagem..."
        showQuickActions={transaction.status === 'AWAITING_PAYMENT'}
        quickActions={quickActions}
      />

      {/* Floating Reaction */}
      {floatingReaction && (
        <FloatingReaction
          emoji={floatingReaction}
          onComplete={() => setFloatingReaction(null)}
        />
      )}
    </div>
  );
}