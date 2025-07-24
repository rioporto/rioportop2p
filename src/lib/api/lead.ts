import { createApiClient, ApiClient } from './client';
import { IApiResponse } from '@/types/api';
import { z } from 'zod';

// Lead types
export enum LeadSource {
  LANDING_PAGE = 'LANDING_PAGE',
  REGISTRATION_FORM = 'REGISTRATION_FORM',
  CONTACT_FORM = 'CONTACT_FORM',
  NEWSLETTER = 'NEWSLETTER',
  CHAT = 'CHAT',
  REFERRAL = 'REFERRAL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  ORGANIC_SEARCH = 'ORGANIC_SEARCH',
  PAID_ADS = 'PAID_ADS',
  WEBINAR = 'WEBINAR',
  EBOOK = 'EBOOK',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  NURTURING = 'NURTURING',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

export enum LeadInterest {
  P2P_TRADING = 'P2P_TRADING',
  CRYPTO_INVESTMENT = 'CRYPTO_INVESTMENT',
  EDUCATION = 'EDUCATION',
  BUSINESS_PARTNERSHIP = 'BUSINESS_PARTNERSHIP',
  API_INTEGRATION = 'API_INTEGRATION',
  OTHER = 'OTHER',
}

// Validation schemas
export const leadCaptureSchema = z.object({
  // Basic information
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  
  // Lead details
  source: z.nativeEnum(LeadSource),
  interest: z.nativeEnum(LeadInterest),
  message: z.string().optional(),
  
  // Marketing data
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  
  // Consent
  acceptMarketing: z.boolean().default(false),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos',
  }),
});

export type LeadCaptureData = z.infer<typeof leadCaptureSchema>;

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  interest: LeadInterest;
  status: LeadStatus;
  score: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  convertedAt?: string;
  assignedTo?: string;
  notes?: string;
  customFields?: Record<string, any>;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'PAGE_VIEW' | 'FORM_SUBMIT' | 'EMAIL_OPEN' | 'EMAIL_CLICK' | 'CHAT' | 'CALL' | 'NOTE';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LeadScoring {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    factor: string;
    value: number;
    weight: number;
  }[];
  recommendations: string[];
}

export class LeadApiClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client || createApiClient({
      baseURL: '/api/lead',
      timeout: 15000,
    });
  }

  /**
   * Capture a new lead
   */
  async capture(data: LeadCaptureData): Promise<IApiResponse<{
    lead: Lead;
    isExisting: boolean;
    nextSteps: string[];
  }>> {
    // Validate input
    try {
      leadCaptureSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados do lead inválidos',
            details: error.errors,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        };
      }
    }

    // Enrich lead data
    const enrichedData = {
      ...data,
      // Browser data
      userAgent: this.getUserAgent(),
      language: this.getBrowserLanguage(),
      timezone: this.getTimezone(),
      screenResolution: this.getScreenResolution(),
      
      // Session data
      referrer: this.getReferrer(),
      landingPage: this.getLandingPage(),
      sessionId: this.getSessionId(),
      
      // Location data (if available)
      ipAddress: 'server-side', // Will be captured server-side
      
      // Timestamp
      capturedAt: new Date().toISOString(),
    };

    return this.client.post('/capture', enrichedData);
  }

  /**
   * Quick lead capture (minimal fields)
   */
  async quickCapture(data: {
    email: string;
    source: LeadSource;
    interest?: LeadInterest;
  }): Promise<IApiResponse<{ captured: boolean; leadId: string }>> {
    return this.capture({
      name: 'Quick Lead',
      email: data.email,
      source: data.source,
      interest: data.interest || LeadInterest.P2P_TRADING,
      acceptTerms: true,
      acceptMarketing: false,
    });
  }

  /**
   * Update lead information
   */
  async update(
    leadId: string,
    data: Partial<Lead>
  ): Promise<IApiResponse<{ updated: boolean; lead: Lead }>> {
    return this.client.patch(`/${leadId}`, data);
  }

  /**
   * Get lead by ID or email
   */
  async get(identifier: string): Promise<IApiResponse<Lead>> {
    const endpoint = identifier.includes('@') 
      ? `/by-email?email=${encodeURIComponent(identifier)}`
      : `/${identifier}`;
    return this.client.get<Lead>(endpoint);
  }

  /**
   * Track lead activity
   */
  async trackActivity(data: {
    leadId?: string;
    email?: string;
    type: LeadActivity['type'];
    description: string;
    metadata?: Record<string, any>;
  }): Promise<IApiResponse<{ tracked: boolean }>> {
    if (!data.leadId && !data.email) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'leadId ou email é obrigatório',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    }

    return this.client.post('/activity', data);
  }

  /**
   * Get lead activities
   */
  async getActivities(
    leadId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: LeadActivity['type'];
    }
  ): Promise<IApiResponse<{
    activities: LeadActivity[];
    total: number;
  }>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.type) params.append('type', options.type);

    return this.client.get(`/${leadId}/activities?${params.toString()}`);
  }

  /**
   * Calculate lead score
   */
  async calculateScore(leadId: string): Promise<IApiResponse<LeadScoring>> {
    return this.client.post(`/${leadId}/score`);
  }

  /**
   * Convert lead to user
   */
  async convert(leadId: string): Promise<IApiResponse<{
    converted: boolean;
    userId: string;
  }>> {
    return this.client.post(`/${leadId}/convert`);
  }

  /**
   * Add tags to lead
   */
  async addTags(
    leadId: string,
    tags: string[]
  ): Promise<IApiResponse<{ added: boolean; tags: string[] }>> {
    return this.client.post(`/${leadId}/tags`, { tags });
  }

  /**
   * Remove tags from lead
   */
  async removeTags(
    leadId: string,
    tags: string[]
  ): Promise<IApiResponse<{ removed: boolean; tags: string[] }>> {
    return this.client.delete(`/${leadId}/tags`, {
      body: JSON.stringify({ tags }),
    });
  }

  /**
   * Assign lead to team member
   */
  async assign(
    leadId: string,
    assigneeId: string
  ): Promise<IApiResponse<{ assigned: boolean }>> {
    return this.client.post(`/${leadId}/assign`, { assigneeId });
  }

  /**
   * Add note to lead
   */
  async addNote(
    leadId: string,
    note: string
  ): Promise<IApiResponse<{ added: boolean; noteId: string }>> {
    return this.client.post(`/${leadId}/notes`, { note });
  }

  /**
   * Search leads
   */
  async search(params: {
    query?: string;
    status?: LeadStatus;
    source?: LeadSource;
    interest?: LeadInterest;
    tags?: string[];
    scoreMin?: number;
    scoreMax?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<IApiResponse<{
    leads: Lead[];
    total: number;
  }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return this.client.get(`/search?${searchParams.toString()}`);
  }

  /**
   * Get lead statistics
   */
  async getStatistics(period?: 'day' | 'week' | 'month' | 'year'): Promise<IApiResponse<{
    total: number;
    new: number;
    converted: number;
    conversionRate: number;
    bySource: Record<LeadSource, number>;
    byStatus: Record<LeadStatus, number>;
    byInterest: Record<LeadInterest, number>;
    trend: {
      date: string;
      count: number;
    }[];
  }>> {
    const endpoint = period ? `/statistics?period=${period}` : '/statistics';
    return this.client.get(endpoint);
  }

  // Helper methods

  private getUserAgent(): string {
    if (typeof window === 'undefined') return '';
    return window.navigator.userAgent;
  }

  private getBrowserLanguage(): string {
    if (typeof window === 'undefined') return 'pt-BR';
    return window.navigator.language;
  }

  private getTimezone(): string {
    if (typeof window === 'undefined') return 'America/Sao_Paulo';
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private getScreenResolution(): string {
    if (typeof window === 'undefined') return '';
    return `${window.screen.width}x${window.screen.height}`;
  }

  private getReferrer(): string {
    if (typeof window === 'undefined') return '';
    return document.referrer || 'direct';
  }

  private getLandingPage(): string {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    // Get or create session ID
    let sessionId = sessionStorage.getItem('rioporto_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('rioporto_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get display name for lead source
   */
  getSourceDisplayName(source: LeadSource): string {
    const names: Record<LeadSource, string> = {
      [LeadSource.LANDING_PAGE]: 'Página de Destino',
      [LeadSource.REGISTRATION_FORM]: 'Formulário de Registro',
      [LeadSource.CONTACT_FORM]: 'Formulário de Contato',
      [LeadSource.NEWSLETTER]: 'Newsletter',
      [LeadSource.CHAT]: 'Chat',
      [LeadSource.REFERRAL]: 'Indicação',
      [LeadSource.SOCIAL_MEDIA]: 'Redes Sociais',
      [LeadSource.ORGANIC_SEARCH]: 'Busca Orgânica',
      [LeadSource.PAID_ADS]: 'Anúncios Pagos',
      [LeadSource.WEBINAR]: 'Webinar',
      [LeadSource.EBOOK]: 'E-book',
    };
    return names[source] || source;
  }

  /**
   * Get display name for lead interest
   */
  getInterestDisplayName(interest: LeadInterest): string {
    const names: Record<LeadInterest, string> = {
      [LeadInterest.P2P_TRADING]: 'Trading P2P',
      [LeadInterest.CRYPTO_INVESTMENT]: 'Investimento em Cripto',
      [LeadInterest.EDUCATION]: 'Educação',
      [LeadInterest.BUSINESS_PARTNERSHIP]: 'Parceria de Negócios',
      [LeadInterest.API_INTEGRATION]: 'Integração API',
      [LeadInterest.OTHER]: 'Outro',
    };
    return names[interest] || interest;
  }
}

// Export singleton instance
export const leadApi = new LeadApiClient();