import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/api/response';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return ApiResponse.error(
      error.code || 'APP_ERROR',
      error.message,
      error.statusCode
    );
  }

  if (error instanceof Error) {
    return ApiResponse.internalError(error.message);
  }

  return ApiResponse.internalError('An unknown error occurred');
}