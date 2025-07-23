import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware, requireAuth, requireKYCLevel } from '@/lib/api/middleware';
import { coinGeckoService, SUPPORTED_CRYPTOS, SupportedCrypto } from '@/services/coingecko';
import { 
  ITransaction,
  ICreateTransactionDto,
  KYCLevel,
  API_ERROR_CODES,
  IPaginatedResponse
} from '@/types/api';

// Validation schemas
const createTransactionSchema = z.object({
  type: z.enum(['BUY', 'SELL']),
  cryptocurrency: z.enum(Object.keys(SUPPORTED_CRYPTOS) as [SupportedCrypto, ...SupportedCrypto[]]),
  cryptoAmount: z.number().positive(),
  fiatAmount: z.number().positive().min(10),
  paymentMethod: z.literal('PIX'),
});

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  type: z.enum(['BUY', 'SELL']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Temporary storage
const transactions: Map<string, ITransaction> = new Map();

// Transaction limits by KYC level (daily)
const DAILY_LIMITS = {
  [KYCLevel.PLATFORM_ACCESS]: { fiat: 0, transactions: 0 },
  [KYCLevel.BASIC]: { fiat: 5000, transactions: 10 },
  [KYCLevel.INTERMEDIATE]: { fiat: 25000, transactions: 50 },
  [KYCLevel.ADVANCED]: { fiat: 250000, transactions: 200 },
};

// GET /api/transactions - Get user's transactions
export const GET = withMiddleware(
  async (req: NextRequest & { validatedQuery?: any }) => {
    // TODO: Get user ID from auth token
    const userId = 'temp-user-id';
    
    const { page, limit, type, status, startDate, endDate } = req.validatedQuery!;

    // Filter user transactions
    let userTransactions = Array.from(transactions.values())
      .filter(tx => tx.userId === userId);

    // Apply filters
    if (type) {
      userTransactions = userTransactions.filter(tx => tx.type === type);
    }
    if (status) {
      userTransactions = userTransactions.filter(tx => tx.status === status);
    }
    if (startDate) {
      const start = new Date(startDate);
      userTransactions = userTransactions.filter(tx => tx.createdAt >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      userTransactions = userTransactions.filter(tx => tx.createdAt <= end);
    }

    // Sort by creation date (newest first)
    userTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedTransactions = userTransactions.slice(start, end);

    const response: IPaginatedResponse<ITransaction> = {
      items: paginatedTransactions,
      pagination: {
        page,
        limit,
        total: userTransactions.length,
        totalPages: Math.ceil(userTransactions.length / limit),
      },
    };

    return ApiResponse.success(response);
  },
  { validateQuery: querySchema }
);

// POST /api/transactions - Create new transaction
export const POST = withMiddleware(
  async (req: NextRequest & { validatedBody?: ICreateTransactionDto }) => {
    const { type, cryptocurrency, cryptoAmount, fiatAmount, paymentMethod } = req.validatedBody!;

    // TODO: Get user from auth token
    const user = {
      id: 'temp-user-id',
      email: 'user@example.com',
      kycLevel: KYCLevel.BASIC,
    };

    // Check KYC level
    if (user.kycLevel < KYCLevel.BASIC) {
      return ApiResponse.forbidden(
        'Complete KYC verification to create transactions',
        API_ERROR_CODES.INSUFFICIENT_KYC_LEVEL
      );
    }

    // Check daily limits
    const dailyLimit = DAILY_LIMITS[user.kycLevel];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = Array.from(transactions.values())
      .filter(tx => 
        tx.userId === user.id && 
        tx.createdAt >= today &&
        tx.status !== 'CANCELLED' && 
        tx.status !== 'FAILED'
      );

    const todayTotal = todayTransactions.reduce((sum, tx) => sum + tx.fiatAmount, 0);
    
    if (todayTransactions.length >= dailyLimit.transactions) {
      return ApiResponse.badRequest(
        `Daily transaction limit (${dailyLimit.transactions}) reached`,
        API_ERROR_CODES.TRANSACTION_LIMIT_EXCEEDED
      );
    }

    if (todayTotal + fiatAmount > dailyLimit.fiat) {
      return ApiResponse.badRequest(
        `Daily amount limit (R$ ${dailyLimit.fiat.toLocaleString('pt-BR')}) would be exceeded`,
        API_ERROR_CODES.TRANSACTION_LIMIT_EXCEEDED
      );
    }

    try {
      // Verify current price
      const currentPrice = await coinGeckoService.getPrice(cryptocurrency, 'brl');
      const expectedFiatAmount = currentPrice * cryptoAmount;
      
      // Allow 2% price tolerance
      const tolerance = 0.02;
      const minAmount = expectedFiatAmount * (1 - tolerance);
      const maxAmount = expectedFiatAmount * (1 + tolerance);
      
      if (fiatAmount < minAmount || fiatAmount > maxAmount) {
        return ApiResponse.badRequest(
          'Price has changed significantly. Please refresh and try again.',
          API_ERROR_CODES.QUOTE_EXPIRED
        );
      }

      // Calculate fee
      const feeRate = 0.025; // 2.5%
      const fee = fiatAmount * feeRate;

      // Create transaction
      const transaction: ITransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type,
        cryptocurrency,
        cryptoAmount,
        fiatAmount,
        price: currentPrice,
        fee,
        status: 'PENDING',
        paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactions.set(transaction.id, transaction);

      // TODO: If BUY transaction, create PIX payment
      // TODO: If SELL transaction, check crypto balance and lock it

      return ApiResponse.created(transaction);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      return ApiResponse.internalError('Failed to create transaction');
    }
  },
  { 
    validateBody: createTransactionSchema,
    rateLimit: { windowMs: 60 * 1000, maxRequests: 20 } // 20 transactions per minute
  }
);

// PATCH /api/transactions/:id - Update transaction status
export const PATCH = withMiddleware(
  async (req: NextRequest, context: { params: { id: string } }) => {
    const transactionId = context.params.id;
    const body = await req.json();
    
    const updateSchema = z.object({
      status: z.enum(['PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED']),
      paymentId: z.string().optional(),
    });

    const { status, paymentId } = updateSchema.parse(body);

    // TODO: Get user ID from auth token and verify ownership
    
    const transaction = transactions.get(transactionId);
    if (!transaction) {
      return ApiResponse.notFound('Transaction not found');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['COMPLETED', 'FAILED'],
      COMPLETED: [],
      CANCELLED: [],
      FAILED: [],
    };

    if (!validTransitions[transaction.status].includes(status)) {
      return ApiResponse.badRequest(
        `Invalid status transition from ${transaction.status} to ${status}`
      );
    }

    // Update transaction
    transaction.status = status;
    transaction.updatedAt = new Date();
    if (paymentId) {
      transaction.paymentId = paymentId;
    }

    transactions.set(transactionId, transaction);

    // TODO: Handle side effects based on status
    // - COMPLETED: Transfer crypto/fiat
    // - CANCELLED/FAILED: Refund/unlock assets

    return ApiResponse.success(transaction);
  }
);

// GET /api/transactions/:id - Get single transaction
export const getTransaction = withMiddleware(
  async (req: NextRequest, context: { params: { id: string } }) => {
    const transactionId = context.params.id;
    
    // TODO: Get user ID from auth token and verify ownership
    
    const transaction = transactions.get(transactionId);
    if (!transaction) {
      return ApiResponse.notFound('Transaction not found');
    }

    return ApiResponse.success(transaction);
  }
);