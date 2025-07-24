import { createApiClient, ApiClient } from './client';
import { IApiResponse } from '@/types/api';
import { z } from 'zod';

// Newsletter subscription types
export enum NewsletterCategory {
  UPDATES = 'UPDATES',
  EDUCATIONAL = 'EDUCATIONAL',
  MARKET_ANALYSIS = 'MARKET_ANALYSIS',
  PROMOTIONS = 'PROMOTIONS',
  SECURITY_ALERTS = 'SECURITY_ALERTS',
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
  BOUNCED = 'BOUNCED',
}

// Validation schemas
export const newsletterSubscribeSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  categories: z.array(z.enum([
    NewsletterCategory.UPDATES,
    NewsletterCategory.EDUCATIONAL,
    NewsletterCategory.MARKET_ANALYSIS,
    NewsletterCategory.PROMOTIONS,
    NewsletterCategory.SECURITY_ALERTS,
  ])).min(1, 'Selecione pelo menos uma categoria').optional(),
  language: z.enum(['pt', 'en', 'es']).default('pt'),
  source: z.string().optional(), // Where the subscription came from
  referrer: z.string().optional(), // Referral source
});

export type NewsletterSubscribeData = z.infer<typeof newsletterSubscribeSchema>;

export interface NewsletterSubscription {
  id: string;
  email: string;
  name?: string;
  status: SubscriptionStatus;
  categories: NewsletterCategory[];
  language: string;
  subscribedAt: string;
  confirmedAt?: string;
  unsubscribedAt?: string;
  lastEmailSentAt?: string;
  totalEmailsSent: number;
}

export interface NewsletterPreferences {
  categories: NewsletterCategory[];
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  language: string;
  timezone: string;
}

export class NewsletterApiClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client || createApiClient({
      baseURL: '/api/newsletter',
      timeout: 15000,
    });
  }

  /**
   * Subscribe to newsletter
   */
  async subscribe(data: NewsletterSubscribeData): Promise<IApiResponse<{
    subscribed: boolean;
    requiresConfirmation: boolean;
    subscription: NewsletterSubscription;
  }>> {
    // Validate input
    try {
      newsletterSubscribeSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados de inscrição inválidos',
            details: error.errors,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        };
      }
    }

    // Add tracking data
    const enrichedData = {
      ...data,
      source: data.source || this.getSource(),
      referrer: data.referrer || this.getReferrer(),
      userAgent: this.getUserAgent(),
      timestamp: new Date().toISOString(),
    };

    return this.client.post('/subscribe', enrichedData);
  }

  /**
   * Confirm subscription
   */
  async confirmSubscription(token: string): Promise<IApiResponse<{
    confirmed: boolean;
    subscription: NewsletterSubscription;
  }>> {
    return this.client.post('/confirm', { token });
  }

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(data: {
    email?: string;
    token?: string;
    reason?: string;
    feedback?: string;
  }): Promise<IApiResponse<{ unsubscribed: boolean }>> {
    if (!data.email && !data.token) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email ou token é obrigatório',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    }

    return this.client.post('/unsubscribe', data);
  }

  /**
   * Get subscription status
   */
  async getStatus(email: string): Promise<IApiResponse<{
    subscribed: boolean;
    subscription?: NewsletterSubscription;
  }>> {
    return this.client.get(`/status?email=${encodeURIComponent(email)}`);
  }

  /**
   * Update subscription preferences
   */
  async updatePreferences(
    email: string,
    preferences: Partial<NewsletterPreferences>
  ): Promise<IApiResponse<{ updated: boolean }>> {
    return this.client.patch('/preferences', {
      email,
      ...preferences,
    });
  }

  /**
   * Get available newsletter categories
   */
  async getCategories(): Promise<IApiResponse<{
    categories: {
      id: NewsletterCategory;
      name: string;
      description: string;
      frequency: string;
      sampleTopics: string[];
    }[];
  }>> {
    return this.client.get('/categories');
  }

  /**
   * Quick subscribe (minimal data)
   */
  async quickSubscribe(email: string): Promise<IApiResponse<{
    subscribed: boolean;
    message: string;
  }>> {
    // Use all default categories for quick subscribe
    return this.subscribe({
      email,
      categories: [
        NewsletterCategory.UPDATES,
        NewsletterCategory.EDUCATIONAL,
        NewsletterCategory.MARKET_ANALYSIS,
      ],
      language: 'pt',
    });
  }

  /**
   * Check if email is valid for newsletter
   */
  async validateEmail(email: string): Promise<IApiResponse<{
    valid: boolean;
    disposable: boolean;
    suggestion?: string;
  }>> {
    return this.client.post('/validate-email', { email });
  }

  /**
   * Get subscription statistics (for logged-in users)
   */
  async getStatistics(): Promise<IApiResponse<{
    totalEmails: number;
    lastEmailDate?: string;
    openRate: number;
    clickRate: number;
    categories: NewsletterCategory[];
  }>> {
    return this.client.get('/statistics');
  }

  // Helper methods

  /**
   * Get the source of the subscription
   */
  private getSource(): string {
    if (typeof window === 'undefined') return 'server';
    
    const path = window.location.pathname;
    if (path === '/') return 'homepage';
    if (path.includes('/blog')) return 'blog';
    if (path.includes('/trade')) return 'trade';
    return 'other';
  }

  /**
   * Get referrer information
   */
  private getReferrer(): string {
    if (typeof window === 'undefined') return '';
    
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    
    try {
      const url = new URL(referrer);
      return url.hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get user agent
   */
  private getUserAgent(): string {
    if (typeof window === 'undefined') return '';
    return window.navigator.userAgent;
  }

  /**
   * Format category name for display
   */
  getCategoryDisplayName(category: NewsletterCategory): string {
    const names: Record<NewsletterCategory, string> = {
      [NewsletterCategory.UPDATES]: 'Atualizações da Plataforma',
      [NewsletterCategory.EDUCATIONAL]: 'Conteúdo Educacional',
      [NewsletterCategory.MARKET_ANALYSIS]: 'Análise de Mercado',
      [NewsletterCategory.PROMOTIONS]: 'Promoções e Ofertas',
      [NewsletterCategory.SECURITY_ALERTS]: 'Alertas de Segurança',
    };
    return names[category] || category;
  }

  /**
   * Get category description
   */
  getCategoryDescription(category: NewsletterCategory): string {
    const descriptions: Record<NewsletterCategory, string> = {
      [NewsletterCategory.UPDATES]: 'Novidades, melhorias e atualizações da plataforma',
      [NewsletterCategory.EDUCATIONAL]: 'Guias, tutoriais e dicas sobre P2P e criptomoedas',
      [NewsletterCategory.MARKET_ANALYSIS]: 'Análises do mercado de criptomoedas e tendências',
      [NewsletterCategory.PROMOTIONS]: 'Ofertas especiais, descontos e promoções exclusivas',
      [NewsletterCategory.SECURITY_ALERTS]: 'Avisos importantes sobre segurança e proteção',
    };
    return descriptions[category] || '';
  }
}

// Export singleton instance
export const newsletterApi = new NewsletterApiClient();