import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

/**
 * Enhanced authentication validation schemas with security best practices
 */

// Password strength requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventSequentialChars: true,
  preventRepeatingChars: true,
};

// Common weak passwords to block
const COMMON_PASSWORDS = [
  'password', '12345678', 'password123', 'admin123', 'qwerty123',
  'abc12345', 'password1', '123456789', 'welcome123', 'admin@123',
  'Password123', 'P@ssw0rd', 'Password1', 'Welcome123', 'Admin123',
];

// Brazilian phone number regex with comprehensive validation
const BR_PHONE_REGEX = /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/;

// Email domains whitelist (expandable)
const TRUSTED_EMAIL_DOMAINS = [
  // International
  'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
  'protonmail.com', 'tutanota.com', 'mail.com', 'aol.com', 'zoho.com',
  // Brazilian
  'uol.com.br', 'bol.com.br', 'terra.com.br', 'globo.com', 'ig.com.br',
  'yahoo.com.br', 'hotmail.com.br', 'outlook.com.br', 'live.com',
  // Corporate (common)
  'empresa.com.br', 'email.com.br',
];

// Disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'yopmail.com', 'temp-mail.org', 'getnada.com',
  'fakeinbox.com', 'trashmail.com', 'maildrop.cc', 'disposablemail.com',
];

/**
 * Enhanced password validation with multiple security checks
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_REQUIREMENTS.minLength, `Senha deve ter no mínimo ${PASSWORD_REQUIREMENTS.minLength} caracteres`)
  .max(PASSWORD_REQUIREMENTS.maxLength, `Senha deve ter no máximo ${PASSWORD_REQUIREMENTS.maxLength} caracteres`)
  .refine((password) => {
    // Check for uppercase
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      return false;
    }
    return true;
  }, 'Senha deve conter pelo menos uma letra maiúscula')
  .refine((password) => {
    // Check for lowercase
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      return false;
    }
    return true;
  }, 'Senha deve conter pelo menos uma letra minúscula')
  .refine((password) => {
    // Check for numbers
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
      return false;
    }
    return true;
  }, 'Senha deve conter pelo menos um número')
  .refine((password) => {
    // Check for special characters
    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return false;
    }
    return true;
  }, 'Senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)')
  .refine((password) => {
    // Check against common passwords
    if (PASSWORD_REQUIREMENTS.preventCommonPasswords) {
      const lowerPassword = password.toLowerCase();
      return !COMMON_PASSWORDS.some(common => 
        lowerPassword.includes(common.toLowerCase())
      );
    }
    return true;
  }, 'Senha muito comum. Por favor, escolha uma senha mais segura')
  .refine((password) => {
    // Check for sequential characters (e.g., "abc", "123")
    if (PASSWORD_REQUIREMENTS.preventSequentialChars) {
      const sequences = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
      const lowerPassword = password.toLowerCase();
      
      for (const seq of sequences) {
        for (let i = 0; i < seq.length - 2; i++) {
          const subSeq = seq.substring(i, i + 3);
          if (lowerPassword.includes(subSeq)) {
            return false;
          }
        }
      }
    }
    return true;
  }, 'Senha não deve conter sequências de caracteres (ex: abc, 123)')
  .refine((password) => {
    // Check for repeating characters (e.g., "aaa", "111")
    if (PASSWORD_REQUIREMENTS.preventRepeatingChars) {
      return !/(.)\1{2,}/.test(password);
    }
    return true;
  }, 'Senha não deve conter caracteres repetidos consecutivamente');

/**
 * Enhanced email validation with domain checks
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .toLowerCase()
  .refine((email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    // Block disposable emails
    return !DISPOSABLE_EMAIL_DOMAINS.includes(domain);
  }, 'Emails temporários não são permitidos')
  .refine((email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    // Optional: enforce trusted domains only
    if (process.env.ENFORCE_TRUSTED_DOMAINS === 'true') {
      return TRUSTED_EMAIL_DOMAINS.includes(domain);
    }
    return true;
  }, 'Por favor, use um email de um provedor confiável');

/**
 * Enhanced phone validation for Brazilian numbers
 */
export const phoneSchema = z
  .string()
  .refine((phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Must be 11 digits (with area code and 9 prefix for mobile)
    return cleaned.length === 11 || cleaned.length === 13; // 13 with country code
  }, 'Número de telefone deve ter 11 dígitos')
  .refine((phone) => {
    return BR_PHONE_REGEX.test(phone);
  }, 'Número de WhatsApp inválido. Use o formato (XX) 9XXXX-XXXX')
  .transform((phone) => {
    // Normalize to just numbers
    return phone.replace(/\D/g, '');
  });

/**
 * Name validation with security checks
 */
export const nameSchema = z
  .string()
  .min(3, 'Nome deve ter no mínimo 3 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .refine((name) => {
    // Must have at least first and last name
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 && parts.every(part => part.length >= 2);
  }, 'Por favor, informe nome e sobrenome')
  .refine((name) => {
    // Only letters, spaces, hyphens, and apostrophes
    return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name);
  }, 'Nome deve conter apenas letras, espaços, hífens e apóstrofos')
  .refine((name) => {
    // Prevent XSS attempts in name
    const dangerous = ['<', '>', 'script', 'javascript:', 'onclick', 'onerror'];
    const lowerName = name.toLowerCase();
    return !dangerous.some(pattern => lowerName.includes(pattern));
  }, 'Nome contém caracteres não permitidos');

/**
 * Enhanced registration schema with all validations
 */
export const enhancedRegisterSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  whatsapp: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso para continuar'
  }),
  newsletter: z.boolean().optional(),
  captchaToken: z.string().optional(),
  // Metadata for security
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  fingerprint: z.string().optional(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})
.refine((data) => {
  // Password should not contain user's name or email
  const lowerPassword = data.password.toLowerCase();
  const nameParts = data.name.toLowerCase().split(/\s+/);
  const emailPart = data.email.split('@')[0].toLowerCase();
  
  const containsPersonalInfo = 
    nameParts.some(part => part.length > 3 && lowerPassword.includes(part)) ||
    (emailPart.length > 3 && lowerPassword.includes(emailPart));
  
  return !containsPersonalInfo;
}, {
  message: 'Senha não deve conter seu nome ou email',
  path: ['password']
});

/**
 * Login schema with security considerations
 */
export const enhancedLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
  captchaToken: z.string().optional(),
  // Security metadata
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  fingerprint: z.string().optional(),
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
  captchaToken: z.string().optional(),
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z.object({
  token: z.string().min(32, 'Token inválido'),
  password: passwordSchema,
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

/**
 * Email verification schema
 */
export const emailVerificationSchema = z.object({
  token: z.string().min(32, 'Token inválido'),
  email: emailSchema.optional(), // For double verification
});

/**
 * Two-factor authentication schemas
 */
export const twoFactorSetupSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória para ativar 2FA'),
});

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Código deve ter 6 dígitos').regex(/^\d+$/, 'Código deve conter apenas números'),
});

/**
 * Session validation schema
 */
export const sessionSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().min(32),
  ipAddress: z.string().ip(),
  userAgent: z.string(),
  lastActivity: z.date(),
  expiresAt: z.date(),
});

/**
 * API key validation schema
 */
export const apiKeySchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.array(z.enum(['read', 'write', 'delete'])),
  expiresAt: z.date().optional(),
});

/**
 * Async validation helpers
 */

/**
 * Check if email is already registered
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return !user;
}

/**
 * Check if phone is already registered
 */
export async function isPhoneAvailable(phone: string): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, '');
  const user = await prisma.user.findFirst({
    where: { phone: cleanPhone },
    select: { id: true },
  });
  return !user;
}

/**
 * Validate password strength and return score
 */
export function getPasswordStrength(password: string): {
  score: number; // 0-100
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length scoring
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;

  // Pattern checks
  if (!/(.)\1{2,}/.test(password)) score += 10; // No repeating chars
  if (!COMMON_PASSWORDS.some(p => password.toLowerCase().includes(p))) score += 15;

  // Feedback
  if (password.length < 12) {
    feedback.push('Considere usar uma senha mais longa (12+ caracteres)');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Adicione caracteres especiais para maior segurança');
  }
  if (score < 50) {
    feedback.push('Senha fraca - tente uma combinação mais complexa');
  } else if (score < 75) {
    feedback.push('Senha média - pode ser melhorada');
  } else {
    feedback.push('Senha forte!');
  }

  return { score: Math.min(100, score), feedback };
}

export type EnhancedRegisterData = z.infer<typeof enhancedRegisterSchema>;
export type EnhancedLoginData = z.infer<typeof enhancedLoginSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;