import { generateSecureUUID } from '@/lib/utils/uuid';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware } from '@/lib/api/middleware';
import { 
  IUser, 
  ICreateUserDto, 
  IUpdateUserDto, 
  KYCLevel,
  IPaginationParams,
  API_ERROR_CODES 
} from '@/types/api';
import { validateCPF } from '@/services/mercadopago';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  cpf: z.string().refine(validateCPF, 'Invalid CPF').optional(),
});

const querySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['createdAt', 'name', 'email']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Temporary in-memory storage (replace with database)
const users: Map<string, IUser> = new Map();

// GET /api/users - List users (admin only)
export const GET = withMiddleware(
  async (req: NextRequest & { validatedQuery?: any }) => {
    // TODO: Check admin permissions
    
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.validatedQuery || {};

    // Get all users
    const allUsers = Array.from(users.values());
    
    // Sort users
    allUsers.sort((a, b) => {
      const aValue = a[sortBy as keyof IUser];
      const bValue = b[sortBy as keyof IUser];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = allUsers.slice(start, end);

    return ApiResponse.success({
      items: paginatedUsers,
      pagination: {
        page,
        limit,
        total: allUsers.length,
        totalPages: Math.ceil(allUsers.length / limit),
      },
    });
  },
  { validateQuery: querySchema }
);

// POST /api/users - Create new user
export const POST = withMiddleware(
  async (req: NextRequest & { validatedBody?: ICreateUserDto }) => {
    const { email, name, password } = req.validatedBody!;

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return ApiResponse.conflict(
        'User with this email already exists',
        API_ERROR_CODES.USER_ALREADY_EXISTS
      );
    }

    // Create user
    const newUser: IUser = {
      id: generateSecureUUID(),
      email,
      name,
      kycLevel: KYCLevel.PLATFORM_ACCESS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Hash password and store securely
    users.set(newUser.id, newUser);

    return ApiResponse.created(newUser);
  },
  { validateBody: createUserSchema }
);

// PATCH /api/users/:id - Update user
export const PATCH = withMiddleware(
  async (req: NextRequest & { validatedBody?: IUpdateUserDto }) => {
    // Extract user ID from URL
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const userId = segments[segments.length - 1];

    if (!userId || userId === 'users') {
      return ApiResponse.badRequest('User ID is required');
    }

    // TODO: Check if requesting user has permission to update this user

    const user = users.get(userId);
    if (!user) {
      return ApiResponse.notFound('User not found');
    }

    const updates = req.validatedBody!;
    
    // Update user
    const updatedUser: IUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    // Update KYC level if CPF is provided
    if (updates.cpf && user.kycLevel < KYCLevel.BASIC) {
      updatedUser.kycLevel = KYCLevel.BASIC;
    }

    users.set(userId, updatedUser);

    return ApiResponse.success(updatedUser);
  },
  { validateBody: updateUserSchema }
);

// DELETE /api/users/:id - Delete user (admin only)
export const DELETE = withMiddleware(
  async (req: NextRequest) => {
    // Extract user ID from URL
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const userId = segments[segments.length - 1];

    if (!userId || userId === 'users') {
      return ApiResponse.badRequest('User ID is required');
    }

    // TODO: Check admin permissions

    const user = users.get(userId);
    if (!user) {
      return ApiResponse.notFound('User not found');
    }

    users.delete(userId);

    return ApiResponse.noContent();
  }
);