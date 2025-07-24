import { createApiClient, ApiClient } from './client';
import { IApiResponse } from '@/types/api';
import { KYCLevel } from '@/types/kyc';
import { z } from 'zod';

// Support types
export enum SupportChannel {
  AI_CHAT = 'AI_CHAT',
  COMMUNITY = 'COMMUNITY',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
  PHONE = 'PHONE',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketCategory {
  ACCOUNT = 'ACCOUNT',
  KYC = 'KYC',
  TRADING = 'TRADING',
  PAYMENT = 'PAYMENT',
  SECURITY = 'SECURITY',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_USER = 'WAITING_USER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// AI Chat types
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: string[];
    relatedArticles?: string[];
  };
}

export interface AIChatSession {
  id: string;
  userId?: string;
  messages: AIChatMessage[];
  startedAt: string;
  lastActivityAt: string;
  resolved: boolean;
  escalated: boolean;
  satisfaction?: number;
}

// Support ticket types
export interface SupportTicket {
  id: string;
  userId?: string;
  email: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  channel: SupportChannel;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  satisfaction?: number;
  tags: string[];
}

// Validation schemas
export const createTicketSchema = z.object({
  email: z.string().email('Email inválido'),
  subject: z.string().min(5, 'Assunto deve ter no mínimo 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority).optional(),
  attachments: z.array(z.instanceof(File)).max(5, 'Máximo de 5 anexos').optional(),
});

export type CreateTicketData = z.infer<typeof createTicketSchema>;

export class SupportApiClient {
  private client: ApiClient;
  private chatSession: AIChatSession | null = null;
  private widgetInitialized = false;

  constructor(client?: ApiClient) {
    this.client = client || createApiClient({
      baseURL: '/api/support',
      timeout: 30000,
    });
  }

  /**
   * Initialize support widget
   */
  async initializeWidget(config?: {
    position?: 'bottom-right' | 'bottom-left';
    primaryColor?: string;
    showLauncher?: boolean;
    channels?: SupportChannel[];
    user?: {
      id: string;
      name: string;
      email: string;
      kycLevel: KYCLevel;
    };
  }): Promise<void> {
    if (this.widgetInitialized) return;

    // Load external widget script if needed
    if (typeof window !== 'undefined') {
      // Initialize widget configuration
      (window as any).RioPortoSupport = {
        config: {
          apiUrl: this.client.getConfig().baseURL,
          position: config?.position || 'bottom-right',
          primaryColor: config?.primaryColor || '#8B5CF6',
          showLauncher: config?.showLauncher !== false,
          channels: config?.channels || [
            SupportChannel.AI_CHAT,
            SupportChannel.COMMUNITY,
            SupportChannel.EMAIL,
          ],
          user: config?.user,
        },
        api: this,
      };

      this.widgetInitialized = true;

      // Dispatch initialization event
      window.dispatchEvent(new CustomEvent('rioporto:support:initialized'));
    }
  }

  /**
   * AI Chat Methods
   */

  /**
   * Start AI chat session
   */
  async startAIChat(initialMessage?: string): Promise<IApiResponse<AIChatSession>> {
    const response = await this.client.post<AIChatSession>('/ai-chat/start', {
      initialMessage,
      metadata: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      },
    });

    if (response.success && response.data) {
      this.chatSession = response.data;
    }

    return response;
  }

  /**
   * Send message to AI chat
   */
  async sendAIChatMessage(
    message: string,
    sessionId?: string
  ): Promise<IApiResponse<AIChatMessage>> {
    const session = sessionId || this.chatSession?.id;
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NO_SESSION',
          message: 'Nenhuma sessão de chat ativa',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    }

    return this.client.post<AIChatMessage>(`/ai-chat/${session}/message`, {
      content: message,
    });
  }

  /**
   * Get AI chat history
   */
  async getAIChatHistory(sessionId: string): Promise<IApiResponse<AIChatSession>> {
    return this.client.get<AIChatSession>(`/ai-chat/${sessionId}`);
  }

  /**
   * End AI chat session
   */
  async endAIChat(
    sessionId: string,
    feedback?: {
      resolved: boolean;
      satisfaction?: number;
      comment?: string;
    }
  ): Promise<IApiResponse<{ ended: boolean }>> {
    return this.client.post(`/ai-chat/${sessionId}/end`, feedback);
  }

  /**
   * Escalate AI chat to human support
   */
  async escalateAIChat(
    sessionId: string,
    reason?: string
  ): Promise<IApiResponse<{
    escalated: boolean;
    ticketId: string;
  }>> {
    return this.client.post(`/ai-chat/${sessionId}/escalate`, { reason });
  }

  /**
   * Support Ticket Methods
   */

  /**
   * Create support ticket
   */
  async createTicket(data: CreateTicketData): Promise<IApiResponse<SupportTicket>> {
    // Validate input
    try {
      createTicketSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados do ticket inválidos',
            details: error.errors,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        };
      }
    }

    // Handle file attachments
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('category', data.category);
      if (data.priority) formData.append('priority', data.priority);
      
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      return this.client.upload<SupportTicket>('/tickets', formData);
    }

    return this.client.post<SupportTicket>('/tickets', data);
  }

  /**
   * Get ticket by ID
   */
  async getTicket(ticketId: string): Promise<IApiResponse<SupportTicket>> {
    return this.client.get<SupportTicket>(`/tickets/${ticketId}`);
  }

  /**
   * Update ticket
   */
  async updateTicket(
    ticketId: string,
    updates: Partial<SupportTicket>
  ): Promise<IApiResponse<SupportTicket>> {
    return this.client.patch<SupportTicket>(`/tickets/${ticketId}`, updates);
  }

  /**
   * Add comment to ticket
   */
  async addTicketComment(
    ticketId: string,
    comment: string,
    attachments?: File[]
  ): Promise<IApiResponse<{
    id: string;
    comment: string;
    author: string;
    createdAt: string;
  }>> {
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      formData.append('comment', comment);
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
      return this.client.upload(`/tickets/${ticketId}/comments`, formData);
    }

    return this.client.post(`/tickets/${ticketId}/comments`, { comment });
  }

  /**
   * Get user's tickets
   */
  async getMyTickets(options?: {
    status?: TicketStatus;
    category?: TicketCategory;
    limit?: number;
    offset?: number;
  }): Promise<IApiResponse<{
    tickets: SupportTicket[];
    total: number;
  }>> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.category) params.append('category', options.category);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    return this.client.get(`/tickets/my?${params.toString()}`);
  }

  /**
   * Community Support Methods
   */

  /**
   * Get community channels
   */
  async getCommunityChannels(): Promise<IApiResponse<{
    channels: {
      type: 'telegram' | 'discord' | 'whatsapp';
      name: string;
      description: string;
      link: string;
      memberCount: number;
      isActive: boolean;
    }[];
  }>> {
    return this.client.get('/community/channels');
  }

  /**
   * Join community channel
   */
  async joinCommunity(channel: string): Promise<IApiResponse<{
    joined: boolean;
    inviteLink: string;
  }>> {
    return this.client.post(`/community/${channel}/join`);
  }

  /**
   * Get FAQ/Knowledge Base
   */
  async getFAQ(options?: {
    category?: string;
    search?: string;
    limit?: number;
  }): Promise<IApiResponse<{
    articles: {
      id: string;
      title: string;
      category: string;
      content: string;
      helpful: number;
      notHelpful: number;
      relatedArticles: string[];
    }[];
  }>> {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);
    if (options?.limit) params.append('limit', options.limit.toString());

    return this.client.get(`/faq?${params.toString()}`);
  }

  /**
   * Rate FAQ article
   */
  async rateFAQ(
    articleId: string,
    helpful: boolean
  ): Promise<IApiResponse<{ rated: boolean }>> {
    return this.client.post(`/faq/${articleId}/rate`, { helpful });
  }

  /**
   * Widget Control Methods
   */

  /**
   * Show support widget
   */
  showWidget(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rioporto:support:show'));
    }
  }

  /**
   * Hide support widget
   */
  hideWidget(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rioporto:support:hide'));
    }
  }

  /**
   * Open specific channel
   */
  openChannel(channel: SupportChannel): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rioporto:support:open-channel', {
        detail: { channel },
      }));
    }
  }

  /**
   * Update widget user
   */
  updateUser(user: {
    id: string;
    name: string;
    email: string;
    kycLevel: KYCLevel;
  }): void {
    if (typeof window !== 'undefined' && (window as any).RioPortoSupport) {
      (window as any).RioPortoSupport.config.user = user;
      window.dispatchEvent(new CustomEvent('rioporto:support:user-updated', {
        detail: { user },
      }));
    }
  }

  /**
   * Helper method to determine available channels by KYC level
   */
  getAvailableChannels(kycLevel: KYCLevel): SupportChannel[] {
    const channels: SupportChannel[] = [SupportChannel.AI_CHAT, SupportChannel.COMMUNITY];
    
    if (kycLevel >= KYCLevel.BASIC) {
      channels.push(SupportChannel.EMAIL);
    }
    
    if (kycLevel >= KYCLevel.INTERMEDIATE) {
      channels.push(SupportChannel.WHATSAPP, SupportChannel.TELEGRAM);
    }
    
    if (kycLevel >= KYCLevel.ADVANCED) {
      channels.push(SupportChannel.PHONE);
    }
    
    return channels;
  }

  /**
   * Get channel display name
   */
  getChannelDisplayName(channel: SupportChannel): string {
    const names: Record<SupportChannel, string> = {
      [SupportChannel.AI_CHAT]: 'Chat com IA',
      [SupportChannel.COMMUNITY]: 'Comunidade',
      [SupportChannel.EMAIL]: 'Email',
      [SupportChannel.WHATSAPP]: 'WhatsApp',
      [SupportChannel.TELEGRAM]: 'Telegram',
      [SupportChannel.PHONE]: 'Telefone',
    };
    return names[channel] || channel;
  }
}

// Export singleton instance
export const supportApi = new SupportApiClient();