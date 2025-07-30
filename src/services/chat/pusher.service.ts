import Pusher from 'pusher';

// Serviço para enviar notificações em tempo real via Pusher
export class PusherService {
  private static pusher: Pusher | null = null;

  private static getInstance(): Pusher | null {
    if (!this.pusher && process.env.PUSHER_APP_ID) {
      this.pusher = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
        useTLS: true
      });
    }
    return this.pusher;
  }

  /**
   * Enviar evento para um canal
   */
  static async trigger(channel: string, event: string, data: any): Promise<void> {
    const pusher = this.getInstance();
    if (!pusher) {
      console.warn('Pusher não configurado - notificação não enviada');
      return;
    }

    try {
      await pusher.trigger(channel, event, data);
      console.log(`Pusher event sent: ${event} on channel ${channel}`);
    } catch (error) {
      console.error('Erro ao enviar evento Pusher:', error);
    }
  }

  /**
   * Enviar evento para múltiplos canais
   */
  static async triggerBatch(channels: string[], event: string, data: any): Promise<void> {
    const pusher = this.getInstance();
    if (!pusher) {
      console.warn('Pusher não configurado - notificações não enviadas');
      return;
    }

    try {
      await pusher.trigger(channels, event, data);
      console.log(`Pusher batch event sent: ${event} on ${channels.length} channels`);
    } catch (error) {
      console.error('Erro ao enviar eventos Pusher em batch:', error);
    }
  }

  /**
   * Autenticar usuário para canal privado
   */
  static authenticateUser(socketId: string, channel: string, userId?: string): any {
    const pusher = this.getInstance();
    if (!pusher) {
      throw new Error('Pusher não configurado');
    }

    // Para canais de presença, incluir dados do usuário
    if (channel.startsWith('presence-') && userId) {
      return pusher.authorizeChannel(socketId, channel, {
        user_id: userId,
        user_info: {
          name: 'User ' + userId.substring(0, 8)
        }
      });
    }

    // Para canais privados simples
    return pusher.authorizeChannel(socketId, channel);
  }

  /**
   * Enviar notificação para um usuário específico
   */
  static async notifyUser(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<void> {
    await this.trigger(
      `private-user-${userId}`,
      'notification',
      {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...notification
      }
    );
  }

  /**
   * Enviar atualização de status de transação
   */
  static async notifyTransactionUpdate(
    transactionId: string,
    buyerId: string,
    sellerId: string,
    status: string,
    details?: any
  ): Promise<void> {
    // Notificar ambas as partes
    await this.triggerBatch(
      [`private-user-${buyerId}`, `private-user-${sellerId}`],
      'transaction-update',
      {
        transactionId,
        status,
        timestamp: new Date().toISOString(),
        ...details
      }
    );
  }

  /**
   * Enviar mensagem de chat
   */
  static async sendChatMessage(
    conversationId: string,
    message: {
      id: string;
      senderId: string;
      content: string;
      timestamp: string;
    }
  ): Promise<void> {
    await this.trigger(
      `private-conversation-${conversationId}`,
      'new-message',
      message
    );
  }

  /**
   * Notificar typing indicator
   */
  static async sendTypingIndicator(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    await this.trigger(
      `presence-conversation-${conversationId}`,
      'typing',
      {
        userId,
        isTyping,
        timestamp: new Date().toISOString()
      }
    );
  }
}