import { generateSecureUUID } from '@/lib/utils/uuid';
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware } from '@/lib/api/middleware';
import { verifyWebhookSignature } from '@/lib/security/api-keys';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Webhook event types
export enum WebhookEventType {
  // Payment events
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  
  // KYC events
  KYC_DOCUMENT_UPLOADED = 'kyc.document.uploaded',
  KYC_DOCUMENT_APPROVED = 'kyc.document.approved',
  KYC_DOCUMENT_REJECTED = 'kyc.document.rejected',
  KYC_LEVEL_UPDATED = 'kyc.level.updated',
  
  // Transaction events
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_CANCELLED = 'transaction.cancelled',
  
  // User events
  USER_REGISTERED = 'user.registered',
  USER_VERIFIED = 'user.verified',
  USER_SUSPENDED = 'user.suspended',
  
  // System events
  SYSTEM_ALERT = 'system.alert',
  MAINTENANCE_SCHEDULED = 'maintenance.scheduled',
}

// Webhook payload schema
const webhookPayloadSchema = z.object({
  event: z.nativeEnum(WebhookEventType),
  data: z.any(),
  timestamp: z.string().datetime(),
  id: z.string().uuid(),
});

// Provider-specific schemas
const pixWebhookSchema = z.object({
  pixKey: z.string(),
  amount: z.number(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
  transactionId: z.string(),
  payerId: z.string().optional(),
  payerName: z.string().optional(),
});

const kycWebhookSchema = z.object({
  documentId: z.string(),
  userId: z.string(),
  documentType: z.string(),
  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
});

// Main webhook handler
export const POST = withMiddleware(
  async (req: NextRequest) => {
    try {
      const provider = req.headers.get('x-webhook-provider');
      const signature = req.headers.get('x-webhook-signature');
      const timestamp = req.headers.get('x-webhook-timestamp');
      
      // Get raw body for signature verification
      const rawBody = await req.text();
      
      // Route to provider-specific handlers
      switch (provider) {
        case 'pix':
          return handlePixWebhook(req, rawBody, signature);
        case 'kyc':
          return handleKYCWebhook(req, rawBody, signature);
        case 'internal':
          return handleInternalWebhook(req, rawBody, signature);
        default:
          return handleGenericWebhook(req, rawBody, signature);
      }
      
    } catch (error) {
      console.error('Webhook error:', error);
      return ApiResponse.internalError('Erro ao processar webhook');
    }
  },
  {
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 100, // Higher limit for webhooks
    },
    logging: true,
  }
);

// Provider-specific handlers

async function handlePixWebhook(
  req: NextRequest,
  rawBody: string,
  signature: string | null
): Promise<NextResponse> {
  // Verify signature
  const secret = process.env.PIX_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return ApiResponse.unauthorized('Assinatura inválida');
  }
  
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return ApiResponse.unauthorized('Assinatura inválida');
  }
  
  // Parse and validate payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
    pixWebhookSchema.parse(payload);
  } catch (error) {
    return ApiResponse.badRequest('Payload inválido');
  }
  
  // Process PIX webhook
  await prisma.$transaction(async (tx) => {
    // Find related payment
    const payment = await tx.pixPayment.findFirst({
      where: {
        pixKey: payload.pixKey,
        amount: payload.amount,
        status: 'PENDING',
      },
      include: {
        transaction: true,
      },
    });
    
    if (!payment) {
      console.log('PIX payment not found:', payload);
      return;
    }
    
    // Update payment status
    await tx.pixPayment.update({
      where: { id: payment.id },
      data: {
        status: payload.status,
        metadata: {
          ...(payment.metadata as any || {}),
          webhookData: payload,
          payerId: payload.payerId,
          payerName: payload.payerName,
        },
      },
    });
    
    // Update transaction if payment completed
    if (payload.status === 'COMPLETED' && payment.transaction) {
      await tx.transaction.update({
        where: { id: payment.transaction.id },
        data: {
          status: 'PROCESSING',
        },
      });
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: payment.transaction.userId,
          type: 'PAYMENT_RECEIVED',
          title: 'Pagamento Recebido',
          message: `Seu pagamento PIX de R$ ${payment.amount.toFixed(2)} foi confirmado`,
          metadata: {
            transactionId: payment.transaction.id,
            paymentId: payment.id,
          },
        },
      });
    }
    
    // Log webhook event
    await tx.webhookEvent.create({
      data: {
        provider: 'pix',
        event: 'payment.status.updated',
        payload,
        signature,
        processed: true,
      },
    });
  });
  
  return ApiResponse.success({ received: true });
}

async function handleKYCWebhook(
  req: NextRequest,
  rawBody: string,
  signature: string | null
): Promise<NextResponse> {
  // Verify signature
  const secret = process.env.KYC_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return ApiResponse.unauthorized('Assinatura inválida');
  }
  
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return ApiResponse.unauthorized('Assinatura inválida');
  }
  
  // Parse and validate payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
    kycWebhookSchema.parse(payload);
  } catch (error) {
    return ApiResponse.badRequest('Payload inválido');
  }
  
  // Process KYC webhook
  await prisma.$transaction(async (tx) => {
    // Update document status
    const document = await tx.kycDocument.update({
      where: { id: payload.documentId },
      data: {
        status: payload.status,
        rejectionReason: payload.status === 'REJECTED' ? payload.reviewNotes : null,
        reviewedAt: new Date(),
        reviewedBy: payload.reviewedBy,
      },
    });
    
    // Check if user can upgrade KYC level
    if (payload.status === 'APPROVED') {
      const user = await tx.user.findUnique({
        where: { id: payload.userId },
        include: {
          kycDocuments: {
            where: { status: 'APPROVED' },
          },
        },
      });
      
      if (user) {
        // Logic to determine new KYC level based on approved documents
        let newLevel = user.kycLevel;
        const approvedTypes = user.kycDocuments.map(d => d.type);
        
        if (user.cpf && approvedTypes.length === 0) {
          newLevel = 1; // BASIC
        } else if (approvedTypes.includes('RG') && approvedTypes.includes('PROOF_OF_ADDRESS')) {
          newLevel = 2; // INTERMEDIATE
        } else if (approvedTypes.includes('RG') && approvedTypes.includes('PROOF_OF_ADDRESS') && approvedTypes.includes('SELFIE')) {
          newLevel = 3; // ADVANCED
        }
        
        if (newLevel > user.kycLevel) {
          await tx.user.update({
            where: { id: user.id },
            data: { kycLevel: newLevel },
          });
          
          // Create notification
          await tx.notification.create({
            data: {
              userId: user.id,
              type: 'KYC_UPGRADED',
              title: 'KYC Atualizado',
              message: `Parabéns! Seu nível KYC foi atualizado para ${getKYCLevelName(newLevel)}`,
              metadata: {
                oldLevel: user.kycLevel,
                newLevel,
              },
            },
          });
        }
      }
    } else if (payload.status === 'REJECTED') {
      // Create notification for rejection
      await tx.notification.create({
        data: {
          userId: payload.userId,
          type: 'KYC_REJECTED',
          title: 'Documento Rejeitado',
          message: `Seu documento ${payload.documentType} foi rejeitado. ${payload.reviewNotes || 'Verifique os requisitos e envie novamente.'}`,
          metadata: {
            documentId: payload.documentId,
            documentType: payload.documentType,
            reason: payload.reviewNotes,
          },
        },
      });
    }
    
    // Log webhook event
    await tx.webhookEvent.create({
      data: {
        provider: 'kyc',
        event: `kyc.document.${payload.status.toLowerCase()}`,
        payload,
        signature,
        processed: true,
      },
    });
  });
  
  return ApiResponse.success({ received: true });
}

async function handleInternalWebhook(
  req: NextRequest,
  rawBody: string,
  signature: string | null
): Promise<NextResponse> {
  // Verify signature
  const secret = process.env.INTERNAL_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return ApiResponse.unauthorized('Assinatura inválida');
  }
  
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return ApiResponse.unauthorized('Assinatura inválida');
  }
  
  // Parse and validate payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
    webhookPayloadSchema.parse(payload);
  } catch (error) {
    return ApiResponse.badRequest('Payload inválido');
  }
  
  // Process internal webhook based on event type
  switch (payload.event) {
    case WebhookEventType.USER_VERIFIED:
      await handleUserVerified(payload.data);
      break;
    case WebhookEventType.TRANSACTION_COMPLETED:
      await handleTransactionCompleted(payload.data);
      break;
    case WebhookEventType.SYSTEM_ALERT:
      await handleSystemAlert(payload.data);
      break;
    default:
      console.log('Unhandled internal webhook event:', payload.event);
  }
  
  // Log webhook event
  await prisma.webhookEvent.create({
    data: {
      provider: 'internal',
      event: payload.event,
      payload,
      signature,
      processed: true,
    },
  });
  
  return ApiResponse.success({ received: true });
}

async function handleGenericWebhook(
  req: NextRequest,
  rawBody: string,
  signature: string | null
): Promise<NextResponse> {
  // For unknown providers, just log and acknowledge
  console.log('Generic webhook received:', {
    headers: Object.fromEntries(req.headers.entries()),
    body: rawBody,
  });
  
  // Log webhook event
  await prisma.webhookEvent.create({
    data: {
      provider: 'unknown',
      event: 'generic',
      payload: JSON.parse(rawBody),
      signature,
      processed: false,
    },
  });
  
  return ApiResponse.success({ received: true });
}

// Event handlers

async function handleUserVerified(data: any) {
  // Send welcome email
  // Update user status
  // Create initial notifications
  console.log('User verified:', data);
}

async function handleTransactionCompleted(data: any) {
  // Update user statistics
  // Check for milestone achievements
  // Send completion notification
  console.log('Transaction completed:', data);
}

async function handleSystemAlert(data: any) {
  // Create system-wide notifications
  // Send alerts to admins
  // Log critical events
  console.log('System alert:', data);
}

// Helper functions

function getKYCLevelName(level: number): string {
  const names = ['Acesso à Plataforma', 'Básico', 'Intermediário', 'Avançado'];
  return names[level] || 'Desconhecido';
}

// Webhook testing endpoint (development only)
export const GET = withMiddleware(
  async (req: NextRequest) => {
    if (process.env.NODE_ENV !== 'development') {
      return ApiResponse.notFound();
    }
    
    const { searchParams } = new URL(req.url);
    const event = searchParams.get('event');
    
    if (!event) {
      return ApiResponse.success({
        availableEvents: Object.values(WebhookEventType),
        usage: 'Add ?event=EVENT_TYPE to test a webhook',
      });
    }
    
    // Create test payload
    const testPayload = {
      event,
      data: {
        test: true,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      id: generateSecureUUID(),
    };
    
    // Sign payload
    const secret = process.env.INTERNAL_WEBHOOK_SECRET || 'test-secret';
    const signature = generateWebhookSignature(JSON.stringify(testPayload), secret);
    
    // Send to self
    const response = await fetch(new URL('/api/webhooks', req.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Provider': 'internal',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': new Date().toISOString(),
      },
      body: JSON.stringify(testPayload),
    });
    
    return ApiResponse.success({
      sent: true,
      payload: testPayload,
      response: {
        status: response.status,
        body: await response.json(),
      },
    });
  }
);

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateWebhookSignature } from '@/lib/security/api-keys';