import { z } from 'zod';

/**
 * Server-side environment variables schema
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Email (optional)
  EMAIL_SERVER: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Storage (optional)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  
  // Security
  CSRF_SECRET: z.string().min(32),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  HCAPTCHA_SECRET_KEY: z.string().optional(),
  
  // Webhooks
  PIX_WEBHOOK_SECRET: z.string().optional(),
  KYC_WEBHOOK_SECRET: z.string().optional(),
  INTERNAL_WEBHOOK_SECRET: z.string().min(32),
  CRM_WEBHOOK_URL: z.string().url().optional(),
  CRM_API_KEY: z.string().optional(),
  
  // External Services
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // API Configuration
  API_RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'),
  API_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('60'),
  
  // Feature Flags
  FEATURE_NEWSLETTER: z.string().transform(val => val === 'true').default('true'),
  FEATURE_LEAD_CAPTURE: z.string().transform(val => val === 'true').default('true'),
  FEATURE_SUPPORT_WIDGET: z.string().transform(val => val === 'true').default('true'),
  FEATURE_API_KEYS: z.string().transform(val => val === 'true').default('true'),
  
  // Support
  SUPPORT_EMAIL: z.string().email().default('support@rioporto.com'),
  SUPPORT_WHATSAPP: z.string().optional(),
  SUPPORT_TELEGRAM: z.string().optional(),
});

/**
 * Client-side environment variables schema
 */
const clientEnvSchema = z.object({
  // API
  NEXT_PUBLIC_API_URL: z.string().url(),
  
  // Captcha
  NEXT_PUBLIC_RECAPTCHA_ENABLED: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  NEXT_PUBLIC_HCAPTCHA_ENABLED: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY: z.string().optional(),
  
  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
  NEXT_PUBLIC_HOTJAR_ID: z.string().optional(),
});

/**
 * Validate and parse server environment variables
 */
function validateServerEnv() {
  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.flatten().fieldErrors);
      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

/**
 * Validate and parse client environment variables
 */
function validateClientEnv() {
  try {
    const clientEnv = Object.entries(process.env)
      .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    return clientEnvSchema.parse(clientEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid client environment variables:');
      console.error(error.flatten().fieldErrors);
      throw new Error('Invalid client environment variables');
    }
    throw error;
  }
}

// Export validated environment variables
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();

// Combined env for convenience
export const env = {
  ...serverEnv,
  ...clientEnv,
} as const;

// Type exports
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type Env = typeof env;

/**
 * Feature flags helper
 */
export const features = {
  newsletter: env.FEATURE_NEWSLETTER,
  leadCapture: env.FEATURE_LEAD_CAPTURE,
  supportWidget: env.FEATURE_SUPPORT_WIDGET,
  apiKeys: env.FEATURE_API_KEYS,
} as const;

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get base URL for the application
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  
  if (process.env.VERCEL_URL) {
    // Reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.RENDER_INTERNAL_URL) {
    // Reference for render.com
    return `http://${process.env.RENDER_INTERNAL_URL}`;
  }
  
  // Assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Get API URL
 */
export function getApiUrl(): string {
  return clientEnv.NEXT_PUBLIC_API_URL || `${getBaseUrl()}/api`;
}

/**
 * Environment variable helpers
 */
export const envHelpers = {
  /**
   * Get environment variable with fallback
   */
  get(key: string, fallback?: string): string | undefined {
    return process.env[key] || fallback;
  },
  
  /**
   * Require environment variable (throws if not found)
   */
  require(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  },
  
  /**
   * Check if environment variable exists
   */
  has(key: string): boolean {
    return process.env[key] !== undefined;
  },
  
  /**
   * Get boolean environment variable
   */
  bool(key: string, fallback = false): boolean {
    const value = process.env[key];
    if (!value) return fallback;
    return value === 'true' || value === '1';
  },
  
  /**
   * Get number environment variable
   */
  number(key: string, fallback = 0): number {
    const value = process.env[key];
    if (!value) return fallback;
    const parsed = Number(value);
    return isNaN(parsed) ? fallback : parsed;
  },
};