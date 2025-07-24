import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';

// Constants
const API_KEY_PREFIX = 'rp_';
const API_KEY_LENGTH = 32;
const API_KEY_HEADER = 'x-api-key';
const API_KEY_QUERY_PARAM = 'api_key';

// API Key types
export enum ApiKeyType {
  PUBLIC = 'PUBLIC', // Read-only access
  PRIVATE = 'PRIVATE', // Full access
  WEBHOOK = 'WEBHOOK', // Webhook signing
  INTERNAL = 'INTERNAL', // Internal services
}

export enum ApiKeyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export interface ApiKeyPermission {
  resource: string;
  actions: ('read' | 'write' | 'delete')[];
}

export interface ApiKey {
  id: string;
  name: string;
  key: string; // Partial key for display (e.g., rp_...abc123)
  type: ApiKeyType;
  status: ApiKeyStatus;
  permissions: ApiKeyPermission[];
  rateLimit?: number; // Requests per minute
  ipWhitelist?: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  userId: string;
}

/**
 * Generate a new API key
 */
export function generateApiKey(type: ApiKeyType = ApiKeyType.PUBLIC): string {
  const randomBytes = crypto.randomBytes(API_KEY_LENGTH).toString('hex');
  const typePrefix = type === ApiKeyType.PUBLIC ? 'pub' : 'prv';
  return `${API_KEY_PREFIX}${typePrefix}_${randomBytes}`;
}

/**
 * Hash API key for storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Mask API key for display
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
}

/**
 * Get API key from request
 */
export function getApiKeyFromRequest(req: NextRequest): string | null {
  // Try header first
  const headerKey = req.headers.get(API_KEY_HEADER);
  if (headerKey) return headerKey;
  
  // Try query parameter
  const { searchParams } = new URL(req.url);
  const queryKey = searchParams.get(API_KEY_QUERY_PARAM);
  if (queryKey) return queryKey;
  
  // Try Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * Validate API key and get associated data
 */
export async function validateApiKey(
  key: string,
  requiredPermissions?: {
    resource: string;
    action: 'read' | 'write' | 'delete';
  }
): Promise<{
  valid: boolean;
  apiKey?: ApiKey;
  error?: string;
}> {
  if (!key) {
    return { valid: false, error: 'API key não fornecida' };
  }
  
  // Validate key format
  const keyRegex = new RegExp(`^${API_KEY_PREFIX}(pub|prv)_[a-f0-9]{${API_KEY_LENGTH * 2}}$`);
  if (!keyRegex.test(key)) {
    return { valid: false, error: 'Formato de API key inválido' };
  }
  
  // Hash the key for lookup
  const hashedKey = hashApiKey(key);
  
  // Find key in database
  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: { hashedKey },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          kycLevel: true,
        },
      },
    },
  });
  
  if (!apiKeyRecord) {
    return { valid: false, error: 'API key inválida' };
  }
  
  // Check status
  if (apiKeyRecord.status !== ApiKeyStatus.ACTIVE) {
    return { valid: false, error: `API key ${apiKeyRecord.status.toLowerCase()}` };
  }
  
  // Check expiration
  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    // Update status to expired
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { status: ApiKeyStatus.EXPIRED },
    });
    return { valid: false, error: 'API key expirada' };
  }
  
  // Check IP whitelist
  if (apiKeyRecord.ipWhitelist?.length > 0) {
    // This would need the actual client IP from the request
    // Implementation depends on your setup (proxy, load balancer, etc.)
  }
  
  // Check permissions if required
  if (requiredPermissions) {
    const hasPermission = apiKeyRecord.permissions.some(
      (perm: any) =>
        perm.resource === requiredPermissions.resource &&
        perm.actions.includes(requiredPermissions.action)
    );
    
    if (!hasPermission) {
      return { valid: false, error: 'Permissão insuficiente' };
    }
  }
  
  // Update last used timestamp (async, don't wait)
  prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  }).catch(console.error);
  
  // Transform to ApiKey interface
  const apiKey: ApiKey = {
    id: apiKeyRecord.id,
    name: apiKeyRecord.name,
    key: maskApiKey(key),
    type: apiKeyRecord.type as ApiKeyType,
    status: apiKeyRecord.status as ApiKeyStatus,
    permissions: apiKeyRecord.permissions as ApiKeyPermission[],
    rateLimit: apiKeyRecord.rateLimit || undefined,
    ipWhitelist: apiKeyRecord.ipWhitelist || undefined,
    expiresAt: apiKeyRecord.expiresAt || undefined,
    lastUsedAt: apiKeyRecord.lastUsedAt || undefined,
    createdAt: apiKeyRecord.createdAt,
    userId: apiKeyRecord.userId,
  };
  
  return { valid: true, apiKey };
}

/**
 * API key authentication middleware
 */
export async function apiKeyAuth(
  req: NextRequest,
  options?: {
    requiredType?: ApiKeyType;
    requiredPermissions?: {
      resource: string;
      action: 'read' | 'write' | 'delete';
    };
    optional?: boolean;
  }
): Promise<NextResponse | null> {
  const apiKey = getApiKeyFromRequest(req);
  
  if (!apiKey && options?.optional) {
    return null; // Continue without API key
  }
  
  if (!apiKey) {
    return ApiResponse.unauthorized('API key não fornecida');
  }
  
  const validation = await validateApiKey(apiKey, options?.requiredPermissions);
  
  if (!validation.valid) {
    return ApiResponse.unauthorized(validation.error || 'API key inválida');
  }
  
  // Check required type
  if (options?.requiredType && validation.apiKey?.type !== options.requiredType) {
    return ApiResponse.forbidden('Tipo de API key inválido para esta operação');
  }
  
  // Add API key data to request for later use
  (req as any).apiKey = validation.apiKey;
  
  return null; // Continue processing
}

/**
 * Rate limiting for API keys
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function apiKeyRateLimit(
  apiKey: ApiKey,
  req: NextRequest
): Promise<NextResponse | null> {
  if (!apiKey.rateLimit) return null; // No rate limit configured
  
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const identifier = `api_key:${apiKey.id}`;
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || current.resetTime < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return null;
  }
  
  if (current.count >= apiKey.rateLimit) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    return ApiResponse.tooManyRequests(
      `Limite de requisições excedido. Tente novamente em ${retryAfter} segundos`
    );
  }
  
  current.count++;
  return null;
}

/**
 * Create API key for user
 */
export async function createApiKey(
  userId: string,
  data: {
    name: string;
    type: ApiKeyType;
    permissions: ApiKeyPermission[];
    rateLimit?: number;
    ipWhitelist?: string[];
    expiresIn?: number; // Days
  }
): Promise<{ apiKey: ApiKey; plainKey: string }> {
  // Generate key
  const plainKey = generateApiKey(data.type);
  const hashedKey = hashApiKey(plainKey);
  
  // Calculate expiration
  const expiresAt = data.expiresIn
    ? new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000)
    : null;
  
  // Create in database
  const apiKeyRecord = await prisma.apiKey.create({
    data: {
      name: data.name,
      hashedKey,
      type: data.type,
      status: ApiKeyStatus.ACTIVE,
      permissions: data.permissions,
      rateLimit: data.rateLimit,
      ipWhitelist: data.ipWhitelist,
      expiresAt,
      userId,
    },
  });
  
  const apiKey: ApiKey = {
    id: apiKeyRecord.id,
    name: apiKeyRecord.name,
    key: maskApiKey(plainKey),
    type: apiKeyRecord.type as ApiKeyType,
    status: apiKeyRecord.status as ApiKeyStatus,
    permissions: apiKeyRecord.permissions as ApiKeyPermission[],
    rateLimit: apiKeyRecord.rateLimit || undefined,
    ipWhitelist: apiKeyRecord.ipWhitelist || undefined,
    expiresAt: apiKeyRecord.expiresAt || undefined,
    createdAt: apiKeyRecord.createdAt,
    userId: apiKeyRecord.userId,
  };
  
  return { apiKey, plainKey };
}

/**
 * Revoke API key
 */
export async function revokeApiKey(
  userId: string,
  apiKeyId: string
): Promise<boolean> {
  const result = await prisma.apiKey.updateMany({
    where: {
      id: apiKeyId,
      userId, // Ensure user owns the key
    },
    data: {
      status: ApiKeyStatus.REVOKED,
      revokedAt: new Date(),
    },
  });
  
  return result.count > 0;
}

/**
 * List user's API keys
 */
export async function listApiKeys(
  userId: string,
  options?: {
    type?: ApiKeyType;
    status?: ApiKeyStatus;
  }
): Promise<ApiKey[]> {
  const where: any = { userId };
  
  if (options?.type) where.type = options.type;
  if (options?.status) where.status = options.status;
  
  const apiKeys = await prisma.apiKey.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  
  return apiKeys.map(key => ({
    id: key.id,
    name: key.name,
    key: `${API_KEY_PREFIX}***...${key.id.slice(-4)}`, // Show partial ID
    type: key.type as ApiKeyType,
    status: key.status as ApiKeyStatus,
    permissions: key.permissions as ApiKeyPermission[],
    rateLimit: key.rateLimit || undefined,
    ipWhitelist: key.ipWhitelist || undefined,
    expiresAt: key.expiresAt || undefined,
    lastUsedAt: key.lastUsedAt || undefined,
    createdAt: key.createdAt,
    userId: key.userId,
  }));
}

/**
 * Default permission sets
 */
export const DEFAULT_PERMISSIONS = {
  [ApiKeyType.PUBLIC]: [
    { resource: 'prices', actions: ['read'] },
    { resource: 'listings', actions: ['read'] },
    { resource: 'statistics', actions: ['read'] },
  ] as ApiKeyPermission[],
  
  [ApiKeyType.PRIVATE]: [
    { resource: 'prices', actions: ['read'] },
    { resource: 'listings', actions: ['read', 'write'] },
    { resource: 'orders', actions: ['read', 'write'] },
    { resource: 'transactions', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'write'] },
  ] as ApiKeyPermission[],
  
  [ApiKeyType.WEBHOOK]: [
    { resource: 'webhooks', actions: ['write'] },
  ] as ApiKeyPermission[],
  
  [ApiKeyType.INTERNAL]: [
    { resource: '*', actions: ['read', 'write', 'delete'] },
  ] as ApiKeyPermission[],
};

/**
 * Webhook signature verification
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}