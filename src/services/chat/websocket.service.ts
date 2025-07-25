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
  type: 'text' | 'system' | 'notification';
}

interface WebSocketEventHandlers {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (userId: string) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onError?: (error: Error) => void;
}

export class WebSocketService {
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
      channel.bind(PUSHER_CONFIG.events.typing, (data: { userId: string }) => {
        if (data.userId !== this.userId) {
          this.eventHandlers.onTyping?.(data.userId);
        }
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

    fetch('/api/chat', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
      }),
    }).catch((error) => {
      console.error('Erro ao enviar evento de digitação:', error);
    });
  }
}

// Exportar instância singleton
export const webSocketService = new WebSocketService();