import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

// Constants
const CSRF_TOKEN_NAME = 'rioporto-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Methods that require CSRF protection
const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Paths that are exempt from CSRF protection
const EXEMPT_PATHS = [
  '/api/webhooks', // Webhook endpoints
  '/api/auth/callback', // OAuth callbacks
  '/api/health', // Health check
];

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const token = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${token}.${timestamp}`)
    .digest('hex');
  
  return `${token}.${timestamp}.${signature}`;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  if (!token) return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  const [tokenPart, timestamp, signature] = parts;
  
  // Check token age
  const tokenAge = Date.now() - parseInt(timestamp);
  if (tokenAge > TOKEN_EXPIRY) return false;
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${tokenPart}.${timestamp}`)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Get CSRF token from request
 */
export function getCSRFTokenFromRequest(req: NextRequest): string | null {
  // Try header first
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;
  
  // Try cookie
  const cookieStore = cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value;
  if (cookieToken) return cookieToken;
  
  // Try body (for form submissions)
  // Note: This requires cloning the request to read body
  return null;
}

/**
 * Set CSRF token in response
 */
export function setCSRFToken(res: NextResponse): string {
  const token = generateCSRFToken();
  
  res.cookies.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
    path: '/',
  });
  
  // Also set in header for SPA usage
  res.headers.set(CSRF_HEADER_NAME, token);
  
  return token;
}

/**
 * CSRF protection middleware
 */
export async function csrfProtection(
  req: NextRequest,
  options?: {
    exemptPaths?: string[];
    onError?: (req: NextRequest) => NextResponse | Promise<NextResponse>;
  }
): Promise<NextResponse | null> {
  // Skip CSRF check for safe methods
  if (!PROTECTED_METHODS.includes(req.method)) {
    return null;
  }
  
  // Check if path is exempt
  const pathname = new URL(req.url).pathname;
  const exemptPaths = [...EXEMPT_PATHS, ...(options?.exemptPaths || [])];
  
  if (exemptPaths.some(path => pathname.startsWith(path))) {
    return null;
  }
  
  // Get and validate token
  const token = getCSRFTokenFromRequest(req);
  
  if (!token || !validateCSRFToken(token)) {
    if (options?.onError) {
      return await options.onError(req);
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Token CSRF inválido ou ausente',
        },
      },
      { status: 403 }
    );
  }
  
  return null; // Continue processing
}

/**
 * CSRF token endpoint handler
 */
export async function handleCSRFToken(): Promise<NextResponse> {
  const response = NextResponse.json({
    success: true,
    data: {
      headerName: CSRF_HEADER_NAME,
      parameterName: '_csrf',
    },
  });
  
  // Generate and set new token
  const token = setCSRFToken(response);
  
  // Also include token in response for immediate use
  const data = await response.json();
  data.data.token = token;
  
  return NextResponse.json(data);
}

/**
 * Double Submit Cookie Pattern implementation
 */
export class DoubleSubmitCSRF {
  private secret: string;
  private cookieName: string;
  private headerName: string;
  
  constructor(options?: {
    secret?: string;
    cookieName?: string;
    headerName?: string;
  }) {
    this.secret = options?.secret || CSRF_SECRET;
    this.cookieName = options?.cookieName || CSRF_TOKEN_NAME;
    this.headerName = options?.headerName || CSRF_HEADER_NAME;
  }
  
  /**
   * Generate token pair (cookie value and header value)
   */
  generateTokenPair(): { cookie: string; header: string } {
    const randomValue = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
    const timestamp = Date.now().toString();
    
    // Cookie token includes random value and timestamp
    const cookieToken = `${randomValue}.${timestamp}`;
    
    // Header token is HMAC of cookie token
    const headerToken = crypto
      .createHmac('sha256', this.secret)
      .update(cookieToken)
      .digest('hex');
    
    return {
      cookie: cookieToken,
      header: headerToken,
    };
  }
  
  /**
   * Validate token pair
   */
  validateTokenPair(cookieToken: string, headerToken: string): boolean {
    if (!cookieToken || !headerToken) return false;
    
    // Check cookie token format and age
    const parts = cookieToken.split('.');
    if (parts.length !== 2) return false;
    
    const [, timestamp] = parts;
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > TOKEN_EXPIRY) return false;
    
    // Verify header token matches cookie token
    const expectedHeaderToken = crypto
      .createHmac('sha256', this.secret)
      .update(cookieToken)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(headerToken),
      Buffer.from(expectedHeaderToken)
    );
  }
}

/**
 * Synchronizer Token Pattern implementation
 */
export class SynchronizerTokenCSRF {
  private tokens: Map<string, { token: string; expires: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Cleanup expired tokens every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }
  
  /**
   * Generate token for session
   */
  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
    const expires = Date.now() + TOKEN_EXPIRY;
    
    this.tokens.set(sessionId, { token, expires });
    
    return token;
  }
  
  /**
   * Validate token for session
   */
  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) return false;
    if (stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }
  
  /**
   * Revoke token for session
   */
  revokeToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }
  
  /**
   * Cleanup expired tokens
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [sessionId, { expires }] of this.tokens.entries()) {
      if (expires < now) {
        this.tokens.delete(sessionId);
      }
    }
  }
  
  /**
   * Destroy cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

/**
 * React/Next.js hook helper for CSRF tokens
 */
export function getCSRFTokenHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  // Try to get token from meta tag (set by server)
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  const token = metaTag?.getAttribute('content');
  
  if (token) {
    return {
      [CSRF_HEADER_NAME]: token,
    };
  }
  
  // Try to get from cookie (for client-side)
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(c => c.trim().startsWith(`${CSRF_TOKEN_NAME}=`));
  
  if (csrfCookie) {
    const token = csrfCookie.split('=')[1];
    return {
      [CSRF_HEADER_NAME]: token,
    };
  }
  
  return {};
}