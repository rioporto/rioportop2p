import { generateSecureUUID } from '@/lib/utils/uuid';
import { NextResponse } from 'next/server';
import { IApiResponse, ApiErrorCode } from '@/types/api';

const API_VERSION = '1.0.0';

export class ApiResponse {
  private static createResponse<T>(
    success: boolean,
    status: number,
    data?: T,
    error?: { code: string; message: string; details?: any }
  ): NextResponse<IApiResponse<T>> {
    const response: IApiResponse<T> = {
      success,
      metadata: {
        timestamp: new Date().toISOString(),
        version: API_VERSION,
        requestId: generateSecureUUID(),
      },
    };

    if (success && data !== undefined) {
      response.data = data;
    } else if (!success && error) {
      response.error = error;
    }

    return NextResponse.json(response, { status });
  }

  // Success responses
  static success<T>(data: T, status = 200): NextResponse<IApiResponse<T>> {
    return this.createResponse(true, status, data);
  }

  static created<T>(data: T): NextResponse<IApiResponse<T>> {
    return this.createResponse(true, 201, data);
  }

  static noContent(): NextResponse<IApiResponse<void>> {
    return this.createResponse(true, 204);
  }

  // Error responses
  static error(
    code: ApiErrorCode | string,
    message: string,
    status = 500,
    details?: any
  ): NextResponse<IApiResponse<never>> {
    return this.createResponse(false, status, undefined, {
      code,
      message,
      details,
    });
  }

  static badRequest(
    message: string,
    code = 'VALIDATION_ERROR',
    details?: any
  ): NextResponse<IApiResponse<never>> {
    return this.error(code, message, 400, details);
  }

  static unauthorized(
    message = 'Unauthorized',
    code = 'UNAUTHORIZED'
  ): NextResponse<IApiResponse<never>> {
    return this.error(code, message, 401);
  }

  static forbidden(
    message = 'Forbidden',
    code = 'FORBIDDEN'
  ): NextResponse<IApiResponse<never>> {
    return this.error(code, message, 403);
  }

  static notFound(
    message = 'Resource not found',
    code = 'NOT_FOUND'
  ): NextResponse<IApiResponse<never>> {
    return this.error(code, message, 404);
  }

  static conflict(
    message: string,
    code: string,
    details?: any
  ): NextResponse<IApiResponse<never>> {
    return this.error(code, message, 409, details);
  }

  static tooManyRequests(
    message = 'Too many requests',
    code = 'RATE_LIMIT_EXCEEDED'
  ): NextResponse<IApiResponse<never>> {
    return this.error(code, message, 429);
  }

  static internalError(
    message = 'Internal server error',
    details?: any
  ): NextResponse<IApiResponse<never>> {
    return this.error('INTERNAL_ERROR', message, 500, details);
  }

  // Utility method for handling errors
  static fromError(error: unknown): NextResponse<IApiResponse<never>> {
    if (error instanceof Error) {
      // Log the full error for debugging
      console.error('API Error:', error);
      
      // Check if it's a known error type
      if ('code' in error && typeof error.code === 'string') {
        return this.error(
          error.code,
          error.message,
          'status' in error && typeof error.status === 'number' ? error.status : 500
        );
      }
      
      return this.internalError(error.message);
    }
    
    return this.internalError('An unknown error occurred');
  }
}