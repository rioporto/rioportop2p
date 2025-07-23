'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { webSocketService, ChatMessage } from '@/services/chat/websocket.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setMessages(messagesData.data.messages || []);

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
              isMe: message.senderId === session.user.id
            },
            isRead: false,
            createdAt: new Date(message.timestamp)
          };
          
          setMessages(prev => [...prev, formattedMessage]);
          scrollToBottom();
        },
        onTyping: (userId: string) => {
          if (userId !== session.user.id) {
            setTypingUser(userId);
            setIsTyping(true);
          }
        },
        onStopTyping: () => {
          setIsTyping(false);
          setTypingUser(null);
        },
        onError: (error: Error) => {
          console.error('WebSocket error:', error);
          setError('Erro de conexão com o chat');
        }
      });

      // Inscrever-se no canal da transação
      webSocketService.subscribeToTransaction(transactionId);
      
      // Atualizar status de conexão
      const interval = setInterval(() => {
        setConnectionStatus(webSocketService.getConnectionStatus());
      }, 1000);

      return () => clearInterval(interval);
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
          type: 'TEXT'
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
            id: session!.user.id,
            name: `${session!.user.firstName} ${session!.user.lastName}`,
            isMe: true
          },
          timestamp: new Date(data.data.createdAt),
          transactionId,
          type: 'text'
        };
        setMessages(prev => [...prev, formattedMessage]);
        scrollToBottom();
      }

    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Erro ao enviar mensagem');
      setNewMessage(messageContent); // Restaurar mensagem em caso de erro
    } finally {
      setIsSending(false);
    }
  };

  // Lidar com upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Lidar com digitação
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    webSocketService.emitTyping(transactionId);

    typingTimeoutRef.current = setTimeout(() => {
      webSocketService.emitStopTyping(transactionId);
    }, 2000);
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
    
    const isBuyer = transaction.buyerId === session.user.id;
    return isBuyer ? transaction.seller : transaction.buyer;
  }, [transaction, session]);

  // Renderizar mensagem
  const renderMessage = (message: Message) => {
    const isMe = message.sender.isMe;

    return (
      <div
        key={message.id}
        className={cn(
          'flex',
          isMe ? 'justify-end' : 'justify-start',
          'mb-4'
        )}
      >
        <div
          className={cn(
            'max-w-[70%] rounded-lg px-4 py-2',
            isMe
              ? 'bg-azul-bancario text-white'
              : 'bg-gray-100 text-text-primary'
          )}
        >
          {/* Nome do remetente (apenas para mensagens recebidas) */}
          {!isMe && (
            <p className="text-xs font-medium mb-1 opacity-70">
              {message.sender.name}
            </p>
          )}

          {/* Conteúdo da mensagem */}
          {message.type === 'TEXT' && (
            <p className="break-words">{message.content}</p>
          )}

          {message.type === 'IMAGE' && message.fileUrl && (
            <div>
              <img
                src={message.fileUrl}
                alt={message.content}
                className="max-w-full rounded cursor-pointer hover:opacity-90"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
              <p className="text-xs mt-1 opacity-70">{message.content}</p>
            </div>
          )}

          {message.type === 'FILE' && message.fileUrl && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 underline',
                isMe ? 'text-white' : 'text-azul-bancario'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {message.content}
            </a>
          )}

          {/* Timestamp e status */}
          <div className={cn(
            'flex items-center gap-2 mt-1',
            'text-xs',
            isMe ? 'text-white/70' : 'text-gray-500'
          )}>
            <span>
              {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
            </span>
            {isMe && (
              <span>
                {message.isRead ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Effects
  useEffect(() => {
    if (session?.user?.id && transactionId) {
      fetchTransactionData();
      initializeWebSocket();
    }

    return () => {
      if (webSocketService.isSubscribed(transactionId)) {
        webSocketService.unsubscribe(transactionId);
      }
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/trades')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div>
                <h1 className="text-lg font-semibold text-text-primary">
                  Chat - {transaction.listing.cryptocurrency}
                </h1>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>
                    {counterparty?.firstName} {counterparty?.lastName}
                  </span>
                  <span>•</span>
                  <span>
                    {transaction.amount} {transaction.listing.cryptocurrency} por R$ {transaction.totalPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {getStatusBadge(transaction.status)}
              
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                )} />
                <span className="text-xs text-text-secondary">
                  {connectionStatus === 'connected' ? 'Conectado' : 
                   connectionStatus === 'connecting' ? 'Conectando...' : 
                   'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center text-text-secondary py-8">
              <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
          ) : (
            <>
              {messages.map(renderMessage)}
              {isTyping && typingUser && (
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span>{counterparty?.firstName} está digitando...</span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t">
        <div className="container mx-auto max-w-4xl p-4">
          {error && (
            <div className="mb-2 text-sm text-vermelho-alerta">
              {error}
            </div>
          )}
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Digite sua mensagem..."
              disabled={isSending}
              className="flex-1"
            />

            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              loading={isSending}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}