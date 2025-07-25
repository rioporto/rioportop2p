import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware } from '@/lib/api/middleware';
import { PATCH, DELETE } from '../route';

// Re-export PATCH and DELETE from parent route
export { PATCH, DELETE };

// GET /api/users/:id - Get single user
export const GET = withMiddleware(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: userId } = await context.params;
    
    // TODO: Check if requesting user has permission to view this user
    
    // For now, using the temporary storage from parent route
    // In production, this would query the database
    
    return ApiResponse.notFound('User not found');
  }
);