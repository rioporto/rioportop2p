import { z } from 'zod';

// reCAPTCHA response schema
const recaptchaResponseSchema = z.object({
  success: z.boolean(),
  challenge_ts: z.string().optional(),
  hostname: z.string().optional(),
  'error-codes': z.array(z.string()).optional(),
  score: z.number().optional(), // For v3
  action: z.string().optional(), // For v3
});

export type RecaptchaResponse = z.infer<typeof recaptchaResponseSchema>;

// Configuration
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || '';
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_MIN_SCORE = 0.5; // Minimum score for v3 (0.0 - 1.0)

/**
 * Verify reCAPTCHA token
 */
export async function verifyCaptcha(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('reCAPTCHA secret key not configured');
    return true; // Allow in development if not configured
  }

  if (!token) {
    return false;
  }

  try {
    // Build verification request
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    // Verify with Google
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('reCAPTCHA verification failed:', response.statusText);
      return false;
    }

    const data = await response.json();
    const result = recaptchaResponseSchema.parse(data);

    // Log errors if any
    if (result['error-codes']?.length) {
      console.error('reCAPTCHA errors:', result['error-codes']);
    }

    // For v3, check score
    if (result.score !== undefined) {
      return result.success && result.score >= RECAPTCHA_MIN_SCORE;
    }

    // For v2, just check success
    return result.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

/**
 * Verify hCaptcha token (alternative to reCAPTCHA)
 */
export async function verifyHCaptcha(
  token: string,
  remoteIp?: string
): Promise<boolean> {
  const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY || '';
  const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

  if (!HCAPTCHA_SECRET_KEY) {
    console.warn('hCaptcha secret key not configured');
    return true; // Allow in development if not configured
  }

  if (!token) {
    return false;
  }

  try {
    const params = new URLSearchParams({
      secret: HCAPTCHA_SECRET_KEY,
      response: token,
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('hCaptcha verification failed:', response.statusText);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return false;
  }
}

/**
 * Rate limiting for captcha-less requests
 */
const ipAttempts = new Map<string, { count: number; resetTime: number }>();
const CAPTCHA_BYPASS_LIMIT = 3; // Attempts before requiring captcha
const CAPTCHA_BYPASS_WINDOW = 60 * 60 * 1000; // 1 hour

export function requiresCaptcha(ip: string): boolean {
  const now = Date.now();
  const attempts = ipAttempts.get(ip);

  if (!attempts || attempts.resetTime < now) {
    // New window
    ipAttempts.set(ip, {
      count: 1,
      resetTime: now + CAPTCHA_BYPASS_WINDOW,
    });
    return false;
  }

  if (attempts.count >= CAPTCHA_BYPASS_LIMIT) {
    return true;
  }

  attempts.count++;
  return false;
}

/**
 * Reset captcha requirement for an IP
 */
export function resetCaptchaRequirement(ip: string): void {
  ipAttempts.delete(ip);
}

/**
 * Clean up old IP attempts (run periodically)
 */
export function cleanupCaptchaAttempts(): void {
  const now = Date.now();
  for (const [ip, attempts] of ipAttempts.entries()) {
    if (attempts.resetTime < now) {
      ipAttempts.delete(ip);
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupCaptchaAttempts, 60 * 60 * 1000);
}

/**
 * Middleware to check captcha in API routes
 */
export async function captchaMiddleware(
  request: Request,
  options?: {
    required?: boolean;
    type?: 'recaptcha' | 'hcaptcha';
  }
): Promise<{ valid: boolean; error?: string }> {
  const { required = true, type = 'recaptcha' } = options || {};

  // Get IP address
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Check if captcha is required based on IP
  const needsCaptcha = required || requiresCaptcha(ip);

  if (!needsCaptcha) {
    return { valid: true };
  }

  // Get captcha token from request
  let token: string | undefined;
  
  // Try to get from header first
  token = request.headers.get('x-captcha-token') || undefined;
  
  // If not in header, try to get from body
  if (!token && request.method === 'POST') {
    try {
      const body = await request.clone().json();
      token = body.captchaToken || body.captcha_token;
    } catch {
      // Body might not be JSON
    }
  }

  if (!token) {
    return {
      valid: false,
      error: 'Captcha token não fornecido',
    };
  }

  // Verify captcha
  const isValid = type === 'hcaptcha' 
    ? await verifyHCaptcha(token, ip)
    : await verifyCaptcha(token, ip);

  if (isValid) {
    // Reset attempts on successful captcha
    resetCaptchaRequirement(ip);
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Captcha inválido',
  };
}

/**
 * React hook helper for client-side captcha
 */
export function getCaptchaConfig() {
  return {
    enabled: process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === 'true' || 
             process.env.NEXT_PUBLIC_HCAPTCHA_ENABLED === 'true',
    type: process.env.NEXT_PUBLIC_HCAPTCHA_ENABLED === 'true' ? 'hcaptcha' : 'recaptcha',
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 
             process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '',
  };
}