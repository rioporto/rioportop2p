import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware } from '@/lib/api/middleware';
import { newsletterSubscribeSchema, NewsletterCategory, SubscriptionStatus } from '@/lib/api/newsletter';
import { z } from 'zod';
import crypto from 'crypto';

// Subscribe to newsletter
export const POST = withMiddleware(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const endpoint = req.nextUrl.pathname;
      
      // Route to different handlers based on endpoint
      if (endpoint.includes('/subscribe')) {
        return handleSubscribe(req, body);
      } else if (endpoint.includes('/confirm')) {
        return handleConfirm(body);
      } else if (endpoint.includes('/unsubscribe')) {
        return handleUnsubscribe(body);
      } else if (endpoint.includes('/preferences')) {
        return handleUpdatePreferences(body);
      } else if (endpoint.includes('/validate-email')) {
        return handleValidateEmail(body);
      }
      
      return ApiResponse.badRequest('Endpoint inválido');
      
    } catch (error) {
      console.error('Newsletter error:', error);
      return ApiResponse.internalError('Erro ao processar solicitação');
    }
  },
  {
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 10,
    },
    logging: true,
  }
);

// Get newsletter status or categories
export const GET = withMiddleware(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const endpoint = req.nextUrl.pathname;
      
      if (endpoint.includes('/status')) {
        const email = searchParams.get('email');
        if (!email) {
          return ApiResponse.badRequest('Email é obrigatório');
        }
        
        const subscription = await prisma.newsletterSubscription.findUnique({
          where: { email },
        });
        
        return ApiResponse.success({
          subscribed: subscription?.status === SubscriptionStatus.CONFIRMED,
          subscription: subscription || undefined,
        });
      } else if (endpoint.includes('/categories')) {
        return ApiResponse.success({
          categories: getNewsletterCategories(),
        });
      } else if (endpoint.includes('/statistics')) {
        // Get user statistics (requires authentication)
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
          return ApiResponse.unauthorized();
        }
        
        const stats = await getSubscriptionStatistics(session.user.email);
        return ApiResponse.success(stats);
      }
      
      return ApiResponse.badRequest('Endpoint inválido');
      
    } catch (error) {
      console.error('Newsletter GET error:', error);
      return ApiResponse.internalError('Erro ao buscar dados');
    }
  },
  {
    logging: true,
  }
);

// Handler functions

async function handleSubscribe(req: NextRequest, body: any) {
  try {
    // Validate input
    const validatedData = newsletterSubscribeSchema.parse(body);
    
    // Check if already subscribed
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existing) {
      if (existing.status === SubscriptionStatus.CONFIRMED) {
        // Update preferences if already confirmed
        await prisma.newsletterSubscription.update({
          where: { id: existing.id },
          data: {
            name: validatedData.name || existing.name,
            categories: validatedData.categories || existing.categories,
            language: validatedData.language,
            metadata: {
              ...(existing.metadata as any || {}),
              lastSource: body.source,
              lastReferrer: body.referrer,
              updatedAt: new Date().toISOString(),
            },
          },
        });
        
        return ApiResponse.success({
          subscribed: true,
          requiresConfirmation: false,
          subscription: existing,
        });
      } else if (existing.status === SubscriptionStatus.PENDING) {
        // Resend confirmation email
        await sendConfirmationEmail(existing);
        
        return ApiResponse.success({
          subscribed: false,
          requiresConfirmation: true,
          subscription: existing,
        });
      }
    }
    
    // Create new subscription
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        status: SubscriptionStatus.PENDING,
        categories: validatedData.categories || [
          NewsletterCategory.UPDATES,
          NewsletterCategory.EDUCATIONAL,
        ],
        language: validatedData.language,
        confirmationToken,
        confirmationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        metadata: {
          source: body.source,
          referrer: body.referrer,
          userAgent: body.userAgent,
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          subscribedAt: new Date().toISOString(),
        },
      },
    });
    
    // Send confirmation email
    await sendConfirmationEmail(subscription);
    
    // Track event
    await prisma.newsletterEvent.create({
      data: {
        subscriptionId: subscription.id,
        type: 'SUBSCRIBED',
        metadata: {
          source: body.source,
        },
      },
    });
    
    return ApiResponse.created({
      subscribed: false,
      requiresConfirmation: true,
      subscription,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiResponse.badRequest(
        'Dados de inscrição inválidos',
        'VALIDATION_ERROR',
        error.errors
      );
    }
    throw error;
  }
}

async function handleConfirm(body: any) {
  const { token } = body;
  
  if (!token) {
    return ApiResponse.badRequest('Token de confirmação é obrigatório');
  }
  
  const subscription = await prisma.newsletterSubscription.findFirst({
    where: {
      confirmationToken: token,
      confirmationTokenExpires: {
        gt: new Date(),
      },
    },
  });
  
  if (!subscription) {
    return ApiResponse.badRequest('Token inválido ou expirado');
  }
  
  // Confirm subscription
  await prisma.newsletterSubscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.CONFIRMED,
      confirmedAt: new Date(),
      confirmationToken: null,
      confirmationTokenExpires: null,
    },
  });
  
  // Track event
  await prisma.newsletterEvent.create({
    data: {
      subscriptionId: subscription.id,
      type: 'CONFIRMED',
    },
  });
  
  // Send welcome email
  await sendWelcomeEmail(subscription);
  
  return ApiResponse.success({
    confirmed: true,
    subscription,
  });
}

async function handleUnsubscribe(body: any) {
  const { email, token, reason, feedback } = body;
  
  if (!email && !token) {
    return ApiResponse.badRequest('Email ou token é obrigatório');
  }
  
  const subscription = await prisma.newsletterSubscription.findFirst({
    where: email ? { email } : { unsubscribeToken: token },
  });
  
  if (!subscription) {
    return ApiResponse.notFound('Inscrição não encontrada');
  }
  
  // Update subscription
  await prisma.newsletterSubscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.UNSUBSCRIBED,
      unsubscribedAt: new Date(),
      metadata: {
        ...(subscription.metadata as any || {}),
        unsubscribeReason: reason,
        unsubscribeFeedback: feedback,
      },
    },
  });
  
  // Track event
  await prisma.newsletterEvent.create({
    data: {
      subscriptionId: subscription.id,
      type: 'UNSUBSCRIBED',
      metadata: {
        reason,
        feedback,
      },
    },
  });
  
  return ApiResponse.success({
    unsubscribed: true,
  });
}

async function handleUpdatePreferences(body: any) {
  const { email, categories, frequency, language, timezone } = body;
  
  if (!email) {
    return ApiResponse.badRequest('Email é obrigatório');
  }
  
  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { email },
  });
  
  if (!subscription) {
    return ApiResponse.notFound('Inscrição não encontrada');
  }
  
  if (subscription.status !== SubscriptionStatus.CONFIRMED) {
    return ApiResponse.badRequest('Inscrição não confirmada');
  }
  
  // Update preferences
  await prisma.newsletterSubscription.update({
    where: { id: subscription.id },
    data: {
      categories: categories || subscription.categories,
      frequency: frequency || subscription.frequency,
      language: language || subscription.language,
      timezone: timezone || subscription.timezone,
      updatedAt: new Date(),
    },
  });
  
  // Track event
  await prisma.newsletterEvent.create({
    data: {
      subscriptionId: subscription.id,
      type: 'PREFERENCES_UPDATED',
      metadata: {
        categories,
        frequency,
        language,
        timezone,
      },
    },
  });
  
  return ApiResponse.success({
    updated: true,
  });
}

async function handleValidateEmail(body: any) {
  const { email } = body;
  
  if (!email) {
    return ApiResponse.badRequest('Email é obrigatório');
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return ApiResponse.success({
      valid: false,
      disposable: false,
    });
  }
  
  // Check for disposable email domains
  const disposableDomains = [
    'tempmail.com',
    'throwaway.email',
    'guerrillamail.com',
    'mailinator.com',
    '10minutemail.com',
  ];
  
  const domain = email.split('@')[1].toLowerCase();
  const isDisposable = disposableDomains.some(d => domain.includes(d));
  
  // Email typo suggestions
  const commonDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
  let suggestion: string | undefined;
  
  if (!commonDomains.includes(domain)) {
    // Check for common typos
    const typoMap: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'yahooo.com': 'yahoo.com',
    };
    
    if (typoMap[domain]) {
      suggestion = email.replace(domain, typoMap[domain]);
    }
  }
  
  return ApiResponse.success({
    valid: !isDisposable,
    disposable: isDisposable,
    suggestion,
  });
}

// Helper functions

function getNewsletterCategories() {
  return [
    {
      id: NewsletterCategory.UPDATES,
      name: 'Atualizações da Plataforma',
      description: 'Novidades, melhorias e atualizações da plataforma RioPorto',
      frequency: 'Mensal',
      sampleTopics: [
        'Novas funcionalidades',
        'Melhorias de segurança',
        'Atualizações de interface',
        'Novos métodos de pagamento',
      ],
    },
    {
      id: NewsletterCategory.EDUCATIONAL,
      name: 'Conteúdo Educacional',
      description: 'Guias, tutoriais e dicas sobre P2P e criptomoedas',
      frequency: 'Semanal',
      sampleTopics: [
        'Como começar no P2P',
        'Estratégias de trading',
        'Segurança em criptomoedas',
        'Análise de mercado',
      ],
    },
    {
      id: NewsletterCategory.MARKET_ANALYSIS,
      name: 'Análise de Mercado',
      description: 'Análises do mercado de criptomoedas e tendências P2P',
      frequency: 'Diária',
      sampleTopics: [
        'Movimentos de preço',
        'Volume de negociação',
        'Tendências do mercado',
        'Oportunidades P2P',
      ],
    },
    {
      id: NewsletterCategory.PROMOTIONS,
      name: 'Promoções e Ofertas',
      description: 'Ofertas especiais, descontos e promoções exclusivas',
      frequency: 'Ocasional',
      sampleTopics: [
        'Taxas reduzidas',
        'Bônus de indicação',
        'Eventos especiais',
        'Programa de fidelidade',
      ],
    },
    {
      id: NewsletterCategory.SECURITY_ALERTS,
      name: 'Alertas de Segurança',
      description: 'Avisos importantes sobre segurança e proteção da conta',
      frequency: 'Quando necessário',
      sampleTopics: [
        'Tentativas de phishing',
        'Atualizações de segurança',
        'Melhores práticas',
        'Alertas de fraude',
      ],
    },
  ];
}

async function getSubscriptionStatistics(email: string) {
  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { email },
    include: {
      events: {
        where: {
          type: {
            in: ['EMAIL_SENT', 'EMAIL_OPENED', 'EMAIL_CLICKED'],
          },
        },
      },
    },
  });
  
  if (!subscription) {
    return {
      totalEmails: 0,
      openRate: 0,
      clickRate: 0,
      categories: [],
    };
  }
  
  const sentEmails = subscription.events.filter(e => e.type === 'EMAIL_SENT');
  const openedEmails = subscription.events.filter(e => e.type === 'EMAIL_OPENED');
  const clickedEmails = subscription.events.filter(e => e.type === 'EMAIL_CLICKED');
  
  return {
    totalEmails: sentEmails.length,
    lastEmailDate: sentEmails[sentEmails.length - 1]?.createdAt,
    openRate: sentEmails.length > 0 ? (openedEmails.length / sentEmails.length) * 100 : 0,
    clickRate: sentEmails.length > 0 ? (clickedEmails.length / sentEmails.length) * 100 : 0,
    categories: subscription.categories,
  };
}

async function sendConfirmationEmail(subscription: any) {
  // Implementation depends on email service
  console.log('Sending confirmation email to:', subscription.email);
  // Would integrate with email service here
}

async function sendWelcomeEmail(subscription: any) {
  // Implementation depends on email service
  console.log('Sending welcome email to:', subscription.email);
  // Would integrate with email service here
}

// Import auth for statistics endpoint
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';