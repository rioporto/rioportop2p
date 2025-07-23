import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware, requireAuth, requireKYCLevel } from '@/lib/api/middleware';
import { mercadoPagoService } from '@/services/mercadopago';
import { 
  IPixPayment,
  ICreatePixPaymentDto,
  KYCLevel,
  API_ERROR_CODES 
} from '@/types/api';

// Validation schemas
const createPixPaymentSchema = z.object({
  amount: z.number().positive().min(10, 'Minimum amount is R$ 10'),
  description: z.string().optional(),
  transactionId: z.string().uuid().optional(),
});

// Temporary storage
const pixPayments: Map<string, IPixPayment> = new Map();

// Payment limits by KYC level
const PAYMENT_LIMITS = {
  [KYCLevel.PLATFORM_ACCESS]: 0,
  [KYCLevel.BASIC]: 1000,        // R$ 1.000 per transaction
  [KYCLevel.INTERMEDIATE]: 5000,  // R$ 5.000 per transaction
  [KYCLevel.ADVANCED]: 50000,     // R$ 50.000 per transaction
};

// GET /api/payments/pix - Get user's PIX payments
export const GET = withMiddleware(
  async (req: NextRequest) => {
    // TODO: Get user ID from auth token
    const userId = 'temp-user-id';

    const userPayments = Array.from(pixPayments.values())
      .filter(payment => payment.transactionId.includes(userId));

    return ApiResponse.success(userPayments);
  }
);

// POST /api/payments/pix - Create new PIX payment
export const POST = withMiddleware(
  async (req: NextRequest & { validatedBody?: ICreatePixPaymentDto }) => {
    const { amount, description, transactionId } = req.validatedBody!;

    // TODO: Get user from auth token
    const user = {
      id: 'temp-user-id',
      email: 'user@example.com',
      cpf: '12345678901',
      kycLevel: KYCLevel.BASIC,
    };

    // Check KYC level
    if (user.kycLevel < KYCLevel.BASIC) {
      return ApiResponse.forbidden(
        'Complete KYC verification to make payments',
        API_ERROR_CODES.INSUFFICIENT_KYC_LEVEL
      );
    }

    // Check payment limit
    const limit = PAYMENT_LIMITS[user.kycLevel];
    if (amount > limit) {
      return ApiResponse.badRequest(
        `Payment amount exceeds your limit of R$ ${limit.toLocaleString('pt-BR')}`,
        API_ERROR_CODES.TRANSACTION_LIMIT_EXCEEDED
      );
    }

    try {
      // Create payment with MercadoPago
      const payment = await mercadoPagoService.createPixPayment(
        { amount, description },
        user.email,
        user.cpf
      );

      // Store payment record
      pixPayments.set(payment.id, payment);

      // Return payment details
      return ApiResponse.created({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        qrCode: payment.qrCode,
        qrCodeData: payment.qrCodeData,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });
    } catch (error) {
      console.error('Failed to create PIX payment:', error);
      return ApiResponse.error(
        API_ERROR_CODES.PAYMENT_FAILED,
        'Failed to create PIX payment',
        500
      );
    }
  },
  { 
    validateBody: createPixPaymentSchema,
    rateLimit: { windowMs: 60 * 1000, maxRequests: 10 } // 10 payments per minute
  }
);

// GET /api/payments/pix/:id - Get payment status
export const getPaymentStatus = withMiddleware(
  async (req: NextRequest, context: { params: { id: string } }) => {
    const paymentId = context.params.id;

    try {
      // Get payment from storage
      const payment = pixPayments.get(paymentId);
      if (!payment) {
        return ApiResponse.notFound('Payment not found');
      }

      // Check with MercadoPago for latest status
      const currentStatus = await mercadoPagoService.getPaymentStatus(paymentId);
      
      // Update stored payment
      payment.status = currentStatus;
      payment.updatedAt = new Date();
      pixPayments.set(paymentId, payment);

      return ApiResponse.success({
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        updatedAt: payment.updatedAt,
      });
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return ApiResponse.error(
        API_ERROR_CODES.PAYMENT_FAILED,
        'Failed to get payment status',
        500
      );
    }
  }
);

// POST /api/payments/pix/webhook - MercadoPago webhook
export const webhook = withMiddleware(
  async (req: NextRequest) => {
    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');
    
    try {
      const data = await req.json();
      
      // Validate webhook signature
      const isValid = mercadoPagoService.validateWebhookSignature(
        signature,
        requestId,
        data
      );
      
      if (!isValid) {
        return ApiResponse.unauthorized('Invalid webhook signature');
      }

      // Process notification
      await mercadoPagoService.processWebhookNotification(data);

      return ApiResponse.success({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return ApiResponse.internalError('Failed to process webhook');
    }
  },
  { rateLimit: false } // Disable rate limiting for webhooks
);