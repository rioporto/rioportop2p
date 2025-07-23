import { Channel } from 'pusher-js';
import pusherClient from '@/lib/pusher/client';

export interface ChatMessage {
  id: string;
  transactionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'notification';
}

export interface WebSocketEventHandlers {
  onMessage?: (message: ChatMessage) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onTyping?: (userId: string) => void;
  onStopTyping?: (userId: string) => void;
  onError?: (error: Error) => void;
}

class WebSocketService {
  private channels: Map<string, Channel> = new Map();
  private eventHandlers: WebSocketEventHandlers = {};
  private isInitialized = false;
  private userId: string | null = null;

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
      pusherClient.connection.bind('connected', () => {
        console.log('Conectado ao Pusher');
        this.isInitialized = true;
      });

      pusherClient.connection.bind('error', (error: any) => {
        console.error('Erro de conexão Pusher:', error);
        this.eventHandlers.onError?.(new Error(error.message || 'Erro de conexão'));
      });

      pusherClient.connection.bind('disconnected', () => {
        console.log('Desconectado do Pusher');
        this.isInitialized = false;
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

    const channelName = `private-transaction-${transactionId}`;
    
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
      channel.bind('new-message', (data: ChatMessage) => {
        console.log('Nova mensagem recebida:', data);
        this.eventHandlers.onMessage?.(data);
      });

      // Evento de usuário entrou
      channel.bind('user-joined', (data: { userId: string }) => {
        console.log('Usuário entrou:', data.userId);
        this.eventHandlers.onUserJoined?.(data.userId);
      });

      // Evento de usuário saiu
      channel.bind('user-left', (data: { userId: string }) => {
        console.log('Usuário saiu:', data.userId);
        this.eventHandlers.onUserLeft?.(data.userId);
      });

      // Evento de digitação
      channel.bind('typing', (data: { userId: string }) => {
        if (data.userId !== this.userId) {
          this.eventHandlers.onTyping?.(data.userId);
        }
      });

      // Evento de parou de digitar
      channel.bind('stop-typing', (data: { userId: string }) => {
        if (data.userId !== this.userId) {
          this.eventHandlers.onStopTyping?.(data.userId);
        }
      });

    } catch (error) {
      console.error(`Erro ao inscrever no canal ${channelName}:`, error);
      throw error;
    }
  }

  /**
   * Envia uma mensagem para um canal de transação
   */
  async sendMessage(transactionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> {
    const channel = this.channels.get(transactionId);
    
    if (!channel) {
      throw new Error(`Não está inscrito no canal da transação ${transactionId}`);
    }

    try {
      // Enviar mensagem via API (o servidor irá transmitir via Pusher)
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Registra callback para novas mensagens
   */
  onNewMessage(callback: (message: ChatMessage) => void): void {
    this.eventHandlers.onMessage = callback;
  }

  /**
   * Registra handlers de eventos
   */
  setEventHandlers(handlers: WebSocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Cancela inscrição em um canal de transação
   */
  unsubscribe(transactionId: string): void {
    const channel = this.channels.get(transactionId);
    
    if (!channel) {
      console.warn(`Não está inscrito no canal da transação ${transactionId}`);
      return;
    }

    try {
      // Desvincular todos os eventos
      channel.unbind_all();
      
      // Cancelar inscrição
      pusherClient.unsubscribe(`private-transaction-${transactionId}`);
      
      // Remover do mapa
      this.channels.delete(transactionId);
      
      console.log(`Cancelada inscrição no canal da transação ${transactionId}`);
    } catch (error) {
      console.error(`Erro ao cancelar inscrição no canal:`, error);
    }
  }

  /**
   * Desconecta do Pusher e limpa todos os canais
   */
  disconnect(): void {
    try {
      // Cancelar inscrição em todos os canais
      this.channels.forEach((_, transactionId) => {
        this.unsubscribe(transactionId);
      });

      // Desconectar do Pusher
      pusherClient.disconnect();
      
      // Limpar estado
      this.channels.clear();
      this.eventHandlers = {};
      this.isInitialized = false;
      this.userId = null;
      
      console.log('Desconectado do WebSocket');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }

  /**
   * Emite evento de digitação
   */
  async emitTyping(transactionId: string): Promise<void> {
    const channel = this.channels.get(transactionId);
    
    if (!channel || !this.userId) {
      return;
    }

    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          userId: this.userId,
          isTyping: true,
        }),
      });
    } catch (error) {
      console.error('Erro ao emitir evento de digitação:', error);
    }
  }

  /**
   * Emite evento de parou de digitar
   */
  async emitStopTyping(transactionId: string): Promise<void> {
    const channel = this.channels.get(transactionId);
    
    if (!channel || !this.userId) {
      return;
    }

    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          userId: this.userId,
          isTyping: false,
        }),
      });
    } catch (error) {
      console.error('Erro ao emitir evento de parou de digitar:', error);
    }
  }

  /**
   * Retorna o status da conexão
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    const state = pusherClient.connection.state;
    
    switch (state) {
      case 'connected':
        return 'connected';
      case 'connecting':
      case 'initialized':
        return 'connecting';
      default:
        return 'disconnected';
    }
  }

  /**
   * Verifica se está inscrito em um canal
   */
  isSubscribed(transactionId: string): boolean {
    return this.channels.has(transactionId);
  }
}

// Exportar instância singleton
export const webSocketService = new WebSocketService();

// Exportar também a classe para testes
export { WebSocketService };