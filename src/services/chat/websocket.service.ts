import { Channel } from 'pusher-js';
import pusherClient from '@/lib/pusher/client';
import { PUSHER_CONFIG } from '@/config/pusher';

export interface ChatMessage {
  id: string;
  transactionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'notification' | 'image' | 'file';
  fileUrl?: string;
  replyToId?: string;
}

interface WebSocketEventHandlers {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (userId: string, userName?: string) => void;
  onStopTyping?: (userId: string) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'connecting') => void;
  onMessageRead?: (messageId: string, userId: string) => void;
  onMessageDelivered?: (messageId: string) => void;
}

export class WebSocketService {
  private channels: Map<string, Channel> = new Map();
  private eventHandlers: WebSocketEventHandlers = {};
  private isInitialized = false;
  private userId: string | null = null;
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Inicializa o cliente Pusher
   */
  async initializePusher(userId: string): Promise<void> {
    if (this.isInitialized) {
      console.warn('Pusher já está inicializado');
      return;
    }

    try {
      this.userId = userId;
      
      // Configurar handlers globais
      pusherClient.connection.bind('connecting', () => {
        console.log('Conectando ao Pusher...');
        this.connectionStatus = 'connecting';
        this.eventHandlers.onConnectionChange?.('connecting');
      });

      pusherClient.connection.bind('connected', () => {
        console.log('Conectado ao Pusher');
        this.isInitialized = true;
        this.connectionStatus = 'connected';
        this.eventHandlers.onConnectionChange?.('connected');
      });

      pusherClient.connection.bind('error', (error: any) => {
        console.error('Erro de conexão Pusher:', error);
        this.eventHandlers.onError?.(new Error(error.message || 'Erro de conexão'));
      });

      pusherClient.connection.bind('disconnected', () => {
        console.log('Desconectado do Pusher');
        this.isInitialized = false;
        this.connectionStatus = 'disconnected';
        this.eventHandlers.onConnectionChange?.('disconnected');
      });

      // Conectar ao Pusher
      pusherClient.connect();
    } catch (error) {
      console.error('Erro ao inicializar Pusher:', error);
      throw error;
    }
  }

  /**
   * Inscreve-se em um canal de transação
   */
  subscribeToTransaction(transactionId: string): void {
    if (!this.isInitialized) {
      throw new Error('Pusher não está inicializado. Chame initializePusher() primeiro.');
    }

    const channelName = PUSHER_CONFIG.channels.transaction(transactionId);
    
    // Verifica se já está inscrito no canal
    if (this.channels.has(transactionId)) {
      console.log(`Já inscrito no canal ${channelName}`);
      return;
    }

    try {
      // Inscrever-se no canal privado
      const channel = pusherClient.subscribe(channelName);
      this.channels.set(transactionId, channel);

      // Configurar eventos do canal
      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`Inscrito com sucesso no canal ${channelName}`);
      });

      channel.bind('pusher:subscription_error', (error: any) => {
        console.error(`Erro ao inscrever no canal ${channelName}:`, error);
        this.eventHandlers.onError?.(new Error(`Falha ao entrar no chat: ${error.message}`));
      });

      // Evento de nova mensagem
      channel.bind(PUSHER_CONFIG.events.newMessage, (data: ChatMessage) => {
        console.log('Nova mensagem recebida:', data);
        this.eventHandlers.onMessage?.(data);
      });

      // Evento de usuário entrou
      channel.bind(PUSHER_CONFIG.events.userJoined, (data: { userId: string }) => {
        console.log('Usuário entrou:', data.userId);
        this.eventHandlers.onUserJoined?.(data.userId);
      });

      // Evento de usuário saiu
      channel.bind(PUSHER_CONFIG.events.userLeft, (data: { userId: string }) => {
        console.log('Usuário saiu:', data.userId);
        this.eventHandlers.onUserLeft?.(data.userId);
      });

      // Evento de digitação
      channel.bind(PUSHER_CONFIG.events.typing, (data: { userId: string, userName?: string }) => {
        if (data.userId !== this.userId) {
          this.eventHandlers.onTyping?.(data.userId, data.userName);
        }
      });

      // Evento de parar digitação
      channel.bind('stop-typing', (data: { userId: string }) => {
        if (data.userId !== this.userId) {
          this.eventHandlers.onStopTyping?.(data.userId);
        }
      });

      // Evento de mensagem lida
      channel.bind('message-read', (data: { messageId: string, userId: string }) => {
        this.eventHandlers.onMessageRead?.(data.messageId, data.userId);
      });

      // Evento de mensagem entregue
      channel.bind('message-delivered', (data: { messageId: string }) => {
        this.eventHandlers.onMessageDelivered?.(data.messageId);
      });
    } catch (error) {
      console.error(`Erro ao inscrever no canal ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Cancela inscrição em um canal de transação
   */
  unsubscribeFromTransaction(transactionId: string): void {
    const channelName = PUSHER_CONFIG.channels.transaction(transactionId);
    pusherClient.unsubscribe(channelName);
    this.channels.delete(transactionId);
  }

  /**
   * Configura os handlers de eventos
   */
  setEventHandlers(handlers: WebSocketEventHandlers): void {
    this.eventHandlers = handlers;
  }

  /**
   * Notifica que o usuário está digitando
   */
  notifyTyping(transactionId: string): void {
    if (!this.isInitialized) {
      return;
    }

    fetch('/api/chat/typing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        isTyping: true,
      }),
    }).catch((error) => {
      console.error('Erro ao enviar evento de digitação:', error);
    });
  }

  /**
   * Emite evento de digitação
   */
  emitTyping(transactionId: string): void {
    this.notifyTyping(transactionId);
    
    // Limpar timer anterior se existir
    const timerId = this.typingTimers.get(transactionId);
    if (timerId) {
      clearTimeout(timerId);
    }
    
    // Configurar timer para parar digitação após 3 segundos
    const newTimerId = setTimeout(() => {
      this.emitStopTyping(transactionId);
      this.typingTimers.delete(transactionId);
    }, 3000);
    
    this.typingTimers.set(transactionId, newTimerId);
  }

  /**
   * Emite evento de parar digitação
   */
  emitStopTyping(transactionId: string): void {
    if (!this.isInitialized) {
      return;
    }

    // Limpar timer se existir
    const timerId = this.typingTimers.get(transactionId);
    if (timerId) {
      clearTimeout(timerId);
      this.typingTimers.delete(transactionId);
    }

    fetch('/api/chat/typing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        isTyping: false,
      }),
    }).catch((error) => {
      console.error('Erro ao enviar evento de parar digitação:', error);
    });
  }

  /**
   * Retorna o status atual da conexão
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionStatus;
  }

  /**
   * Verifica se está inscrito em um canal
   */
  isSubscribed(transactionId: string): boolean {
    return this.channels.has(transactionId);
  }

  /**
   * Marca mensagem como lida
   */
  markMessageAsRead(transactionId: string, messageId: string): void {
    if (!this.isInitialized) {
      return;
    }

    fetch('/api/chat/read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        messageId,
      }),
    }).catch((error) => {
      console.error('Erro ao marcar mensagem como lida:', error);
    });
  }

  /**
   * Desconecta do Pusher
   */
  disconnect(): void {
    // Limpar todos os timers
    this.typingTimers.forEach(timer => clearTimeout(timer));
    this.typingTimers.clear();
    
    // Cancelar inscrição de todos os canais
    this.channels.forEach((_, transactionId) => {
      this.unsubscribeFromTransaction(transactionId);
    });
    
    // Desconectar do Pusher
    pusherClient.disconnect();
    this.isInitialized = false;
    this.connectionStatus = 'disconnected';
  }

  /**
   * Reconecta ao Pusher
   */
  reconnect(): void {
    if (this.isInitialized || !this.userId) {
      return;
    }
    
    this.initializePusher(this.userId);
  }
}

// Exportar instância singleton
export const webSocketService = new WebSocketService();