import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware } from '@/lib/api/middleware';
import { leadCaptureSchema, LeadSource, LeadStatus, LeadInterest } from '@/lib/api/lead';
import { newsletterApi } from '@/lib/api/newsletter';
import { z } from 'zod';

// Lead capture endpoint
export const POST = withMiddleware(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      
      // Validate input
      const validatedData = leadCaptureSchema.parse(body);
      
      // Get IP and user agent
      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      
      // Check if lead already exists
      const existingLead = await prisma.lead.findUnique({
        where: { email: validatedData.email },
      });
      
      if (existingLead) {
        // Update existing lead
        const updatedLead = await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            name: validatedData.name || existingLead.name,
            phone: validatedData.phone || existingLead.phone,
            company: validatedData.company || existingLead.company,
            lastActivityAt: new Date(),
            metadata: {
              ...(existingLead.metadata as any || {}),
              lastSource: validatedData.source,
              lastInterest: validatedData.interest,
              message: validatedData.message,
              utm_source: validatedData.utm_source,
              utm_medium: validatedData.utm_medium,
              utm_campaign: validatedData.utm_campaign,
            },
          },
        });
        
        // Track activity
        await prisma.leadActivity.create({
          data: {
            leadId: updatedLead.id,
            type: 'FORM_SUBMIT',
            description: `Lead atualizado via ${validatedData.source}`,
            metadata: {
              source: validatedData.source,
              interest: validatedData.interest,
              ipAddress,
              userAgent,
            },
          },
        });
        
        return ApiResponse.success({
          lead: updatedLead,
          isExisting: true,
          nextSteps: getNextSteps(updatedLead.status as LeadStatus),
        });
      }
      
      // Create new lead
      const newLead = await prisma.$transaction(async (tx) => {
        const lead = await tx.lead.create({
          data: {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            company: validatedData.company,
            source: validatedData.source,
            interest: validatedData.interest,
            status: LeadStatus.NEW,
            score: calculateInitialScore(validatedData),
            tags: generateTags(validatedData),
            acceptedMarketing: validatedData.acceptMarketing,
            metadata: {
              message: validatedData.message,
              utm_source: validatedData.utm_source,
              utm_medium: validatedData.utm_medium,
              utm_campaign: validatedData.utm_campaign,
              utm_term: validatedData.utm_term,
              utm_content: validatedData.utm_content,
              referrer: body.referrer,
              landingPage: body.landingPage,
              ipAddress,
              userAgent,
              language: body.language,
              timezone: body.timezone,
              screenResolution: body.screenResolution,
            },
          },
        });
        
        // Create initial activity
        await tx.leadActivity.create({
          data: {
            leadId: lead.id,
            type: 'FORM_SUBMIT',
            description: `Lead capturado via ${validatedData.source}`,
            metadata: {
              source: validatedData.source,
              interest: validatedData.interest,
              ipAddress,
              userAgent,
            },
          },
        });
        
        return lead;
      });
      
      // Asynchronous tasks
      Promise.all([
        // Subscribe to newsletter if accepted marketing
        validatedData.acceptMarketing && newsletterApi.subscribe({
          email: validatedData.email,
          name: validatedData.name,
          language: 'pt',
          source: 'lead_capture',
        }).catch(console.error),
        
        // Send webhook to CRM if configured
        process.env.CRM_WEBHOOK_URL && sendCRMWebhook(newLead).catch(console.error),
        
        // Send internal notification for high-value leads
        newLead.score >= 80 && sendHighValueLeadNotification(newLead).catch(console.error),
      ]);
      
      return ApiResponse.created({
        lead: newLead,
        isExisting: false,
        nextSteps: getNextSteps(LeadStatus.NEW),
      });
      
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return ApiResponse.badRequest(
          'Dados do lead inválidos',
          'VALIDATION_ERROR',
          error.errors
        );
      }
      
      console.error('Lead capture error:', error);
      return ApiResponse.internalError('Erro ao capturar lead');
    }
  },
  {
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 lead captures per minute
    },
    logging: true,
  }
);

// Get lead by email
export const GET = withMiddleware(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const email = searchParams.get('email');
      
      if (!email) {
        return ApiResponse.badRequest('Email é obrigatório');
      }
      
      const lead = await prisma.lead.findUnique({
        where: { email },
        include: {
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
      
      if (!lead) {
        return ApiResponse.notFound('Lead não encontrado');
      }
      
      return ApiResponse.success(lead);
      
    } catch (error) {
      console.error('Get lead error:', error);
      return ApiResponse.internalError('Erro ao buscar lead');
    }
  },
  {
    logging: true,
  }
);

// Helper functions

function calculateInitialScore(data: any): number {
  let score = 50; // Base score
  
  // Source scoring
  const sourceScores: Record<LeadSource, number> = {
    [LeadSource.LANDING_PAGE]: 10,
    [LeadSource.REGISTRATION_FORM]: 15,
    [LeadSource.CONTACT_FORM]: 12,
    [LeadSource.NEWSLETTER]: 8,
    [LeadSource.CHAT]: 10,
    [LeadSource.REFERRAL]: 20,
    [LeadSource.SOCIAL_MEDIA]: 5,
    [LeadSource.ORGANIC_SEARCH]: 12,
    [LeadSource.PAID_ADS]: 8,
    [LeadSource.WEBINAR]: 18,
    [LeadSource.EBOOK]: 15,
  };
  score += sourceScores[data.source as LeadSource] || 0;
  
  // Interest scoring
  const interestScores: Record<LeadInterest, number> = {
    [LeadInterest.P2P_TRADING]: 15,
    [LeadInterest.CRYPTO_INVESTMENT]: 12,
    [LeadInterest.EDUCATION]: 8,
    [LeadInterest.BUSINESS_PARTNERSHIP]: 20,
    [LeadInterest.API_INTEGRATION]: 18,
    [LeadInterest.OTHER]: 5,
  };
  score += interestScores[data.interest as LeadInterest] || 0;
  
  // Additional data scoring
  if (data.phone) score += 5;
  if (data.company) score += 10;
  if (data.message && data.message.length > 50) score += 5;
  if (data.acceptMarketing) score += 3;
  
  return Math.min(100, score);
}

function generateTags(data: any): string[] {
  const tags: string[] = [];
  
  // Source tags
  tags.push(`source:${data.source}`);
  
  // Interest tags
  tags.push(`interest:${data.interest}`);
  
  // UTM tags
  if (data.utm_source) tags.push(`utm:${data.utm_source}`);
  if (data.utm_campaign) tags.push(`campaign:${data.utm_campaign}`);
  
  // Other tags
  if (data.company) tags.push('b2b');
  if (data.acceptMarketing) tags.push('marketing-opt-in');
  
  return tags;
}

function getNextSteps(status: LeadStatus): string[] {
  const steps: Record<LeadStatus, string[]> = {
    [LeadStatus.NEW]: [
      'Enviar email de boas-vindas',
      'Adicionar à sequência de nutrição',
      'Agendar follow-up em 24h',
    ],
    [LeadStatus.CONTACTED]: [
      'Avaliar interesse',
      'Enviar material educativo',
      'Marcar como qualificado se apropriado',
    ],
    [LeadStatus.QUALIFIED]: [
      'Agendar demonstração',
      'Enviar proposta personalizada',
      'Conectar com vendas',
    ],
    [LeadStatus.NURTURING]: [
      'Continuar sequência de emails',
      'Convidar para webinar',
      'Monitorar engajamento',
    ],
    [LeadStatus.CONVERTED]: [
      'Iniciar onboarding',
      'Configurar conta',
      'Agendar treinamento',
    ],
    [LeadStatus.LOST]: [
      'Adicionar à lista de re-engajamento',
      'Solicitar feedback',
      'Arquivar após 6 meses',
    ],
  };
  
  return steps[status] || [];
}

async function sendCRMWebhook(lead: any): Promise<void> {
  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  if (!webhookUrl) return;
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.CRM_API_KEY || '',
      },
      body: JSON.stringify({
        event: 'lead.created',
        data: lead,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('CRM webhook error:', error);
  }
}

async function sendHighValueLeadNotification(lead: any): Promise<void> {
  // Implementation depends on notification system
  // Could be email, Slack, Discord, etc.
  console.log('High-value lead captured:', lead.email, 'Score:', lead.score);
}