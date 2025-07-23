import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from './response';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
interface IRateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const DEFAULT_RATE_LIMIT: IRateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 60,  // 60 requests per minute
};

// Rate limiting middleware
export function rateLimit(config: IRateLimitConfig = DEFAULT_RATE_LIMIT) {
  return async (req: NextRequest) => {
    const identifier = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'anonymous';
    
    const now = Date.now();
    const userLimit = rateLimitStore.get(identifier);

    if (!userLimit || userLimit.resetTime < now) {
      // Create new limit window
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow request
    }

    if (userLimit.count >= config.maxRequests) {
      const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
      return ApiResponse.tooManyRequests(
        `Rate limit exceeded. Try again in ${retryAfter} seconds`
      );
    }

    // Increment count
    userLimit.count++;
    return null; // Allow request
  };
}

// Validation middleware
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return { validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponse.badRequest(
          'Validation error',
          'VALIDATION_ERROR',
          error.errors
        );
      }
      return ApiResponse.badRequest('Invalid request body');
    }
  };
}

// Query params validation
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
      const validated = schema.parse(params);
      return { validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponse.badRequest(
          'Invalid query parameters',
          'VALIDATION_ERROR',
          error.errors
        );
      }
      return ApiResponse.badRequest('Invalid query parameters');
    }
  };
}

// Logging middleware
export function logger(req: NextRequest, context: { params?: any }) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  console.log({
    type: 'API_REQUEST',
    requestId,
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    params: context.params,
    timestamp: new Date().toISOString(),
  });

  return {
    requestId,
    logResponse: (status: number, body?: any) => {
      const duration = Date.now() - start;
      console.log({
        type: 'API_RESPONSE',
        requestId,
        method: req.method,
        url: req.url,
        status,
        duration,
        timestamp: new Date().toISOString(),
      });
    },
  };
}

// Error handling wrapper
export function withErrorHandling(
  handler: (req: NextRequest, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('Unhandled API error:', error);
      return ApiResponse.fromError(error);
    }
  };
}

// Combined middleware wrapper
interface IMiddlewareOptions {
  rateLimit?: IRateLimitConfig | false;
  validateBody?: z.ZodSchema<any>;
  validateQuery?: z.ZodSchema<any>;
  logging?: boolean;
}

export function withMiddleware(
  handler: (req: NextRequest, context?: any) => Promise<Response>,
  options: IMiddlewareOptions = {}
) {
  return async (req: NextRequest, context?: any) => {
    try {
      // Logging
      const loggerResult = options.logging !== false ? logger(req, context || {}) : null;

      // Rate limiting
      if (options.rateLimit !== false) {
        const rateLimitResult = await rateLimit(
          options.rateLimit || DEFAULT_RATE_LIMIT
        )(req);
        if (rateLimitResult) {
          loggerResult?.logResponse(429);
          return rateLimitResult;
        }
      }

      // Body validation
      let validatedBody: any;
      if (options.validateBody) {
        const bodyResult = await validateBody(options.validateBody)(req);
        if ('validated' in bodyResult) {
          validatedBody = bodyResult.validated;
        } else {
          loggerResult?.logResponse(400);
          return bodyResult;
        }
      }

      // Query validation
      let validatedQuery: any;
      if (options.validateQuery) {
        const queryResult = validateQuery(options.validateQuery)(req);
        if ('validated' in queryResult) {
          validatedQuery = queryResult.validated;
        } else {
          loggerResult?.logResponse(400);
          return queryResult;
        }
      }

      // Add validated data to request
      const enhancedReq = Object.assign(req, {
        validatedBody,
        validatedQuery,
      });

      // Execute handler
      const response = await handler(enhancedReq, context);
      
      // Log response
      if (loggerResult) {
        const status = response.status;
        loggerResult.logResponse(status);
      }

      return response;
    } catch (error) {
      console.error('Middleware error:', error);
      return ApiResponse.fromError(error);
    }
  };
}

// Authentication middleware (placeholder - to be implemented with auth system)
export async function requireAuth(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return ApiResponse.unauthorized('Missing authentication token');
  }

  // TODO: Validate token and get user
  // For now, just check if token exists
  return null;
}

// KYC level check middleware
export function requireKYCLevel(minLevel: number) {
  return async (req: NextRequest) => {
    // TODO: Get user from auth token and check KYC level
    // For now, just placeholder
    return null;
  };
}