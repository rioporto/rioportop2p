import { createApiClient, ApiClient } from './client';
import { IApiResponse, ICreateUserDto, IUser } from '@/types/api';
import { z } from 'zod';

// Validation schemas
export const registrationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso',
  }),
  newsletter: z.boolean().optional(),
  captchaToken: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type RegistrationData = z.infer<typeof registrationSchema>;

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface CheckEmailData {
  email: string;
}

export interface RegistrationResponse extends IUser {
  requiresEmailVerification: boolean;
  verificationEmailSent: boolean;
}

export class RegistrationApiClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client || createApiClient({
      baseURL: '/api/auth',
      timeout: 30000,
    });
  }

  /**
   * Register a new user
   */
  async register(data: RegistrationData): Promise<IApiResponse<RegistrationResponse>> {
    // Validate input data
    try {
      registrationSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados de registro inválidos',
            details: error.errors,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        };
      }
    }

    // Prepare registration data
    const registrationDto: ICreateUserDto & { 
      newsletter?: boolean; 
      captchaToken?: string;
      acceptTerms: boolean;
    } = {
      name: data.name,
      email: data.email,
      password: data.password,
      newsletter: data.newsletter,
      captchaToken: data.captchaToken,
      acceptTerms: data.acceptTerms,
    };

    return this.client.post<RegistrationResponse>('/register', registrationDto);
  }

  /**
   * Verify email with code
   */
  async verifyEmail(data: VerifyEmailData): Promise<IApiResponse<{ verified: boolean }>> {
    return this.client.post('/verify-email', data);
  }

  /**
   * Resend verification email
   */
  async resendVerification(data: ResendVerificationData): Promise<IApiResponse<{ sent: boolean }>> {
    return this.client.post('/resend-verification', data);
  }

  /**
   * Check if email is already registered
   */
  async checkEmailAvailability(email: string): Promise<IApiResponse<{ available: boolean }>> {
    return this.client.post('/check-email', { email });
  }

  /**
   * Complete registration profile (after email verification)
   */
  async completeProfile(data: {
    cpf?: string;
    phone?: string;
    birthDate?: string;
  }): Promise<IApiResponse<IUser>> {
    return this.client.post('/complete-profile', data);
  }

  /**
   * Get registration status
   */
  async getStatus(): Promise<IApiResponse<{
    registered: boolean;
    emailVerified: boolean;
    profileComplete: boolean;
    kycLevel: number;
    nextStep: string;
  }>> {
    return this.client.get('/registration-status');
  }

  /**
   * Validate CPF format and availability
   */
  async validateCPF(cpf: string): Promise<IApiResponse<{
    valid: boolean;
    available: boolean;
    formatted: string;
  }>> {
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Basic CPF validation
    if (!this.isValidCPF(cleanCPF)) {
      return {
        success: false,
        error: {
          code: 'INVALID_CPF',
          message: 'CPF inválido',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    }

    return this.client.post('/validate-cpf', { cpf: cleanCPF });
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    score: number; // 0-4
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++; else feedback.push('Adicione letras maiúsculas');
    if (/[a-z]/.test(password)) score++; else feedback.push('Adicione letras minúsculas');
    if (/[0-9]/.test(password)) score++; else feedback.push('Adicione números');
    if (/[^A-Za-z0-9]/.test(password)) score++; else feedback.push('Adicione caracteres especiais');

    // Reduce score for common patterns
    if (/12345|password|senha|qwerty/i.test(password)) {
      score = Math.max(0, score - 2);
      feedback.push('Evite senhas comuns');
    }

    return {
      score: Math.min(4, Math.floor(score * 4 / 6)),
      feedback,
      isStrong: score >= 4,
    };
  }

  // Private helper methods

  private isValidCPF(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validate check digits
    let sum = 0;
    let remainder: number;
    
    // Validate first check digit
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    // Validate second check digit
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  }

  /**
   * Format CPF for display
   */
  formatCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return cpf;
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

// Export singleton instance
export const registrationApi = new RegistrationApiClient();