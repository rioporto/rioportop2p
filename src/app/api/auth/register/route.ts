import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, generateVerificationToken } from '@/lib/auth/utils';
import { registrationSchema } from '@/lib/api/registration';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware, rateLimit } from '@/lib/api/middleware';
import { KYCLevel } from '@/types/kyc';
import { leadApi } from '@/lib/api/lead';
import { LeadSource, LeadInterest } from '@/lib/api/lead';
import { newsletterApi } from '@/lib/api/newsletter';
import { verifyCaptcha } from '@/lib/security/captcha';

// Custom rate limit for registration
const REGISTRATION_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 registration attempts per 15 minutes
};

export const POST = withMiddleware(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      
      // Validate captcha if enabled
      if (process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === 'true' && body.captchaToken) {
        const captchaValid = await verifyCaptcha(body.captchaToken);
        if (!captchaValid) {
          return ApiResponse.badRequest('Captcha inválido', 'INVALID_CAPTCHA');
        }
      }
      
      // Validate input data
      const validatedData = registrationSchema.parse(body);
      
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      
      if (existingUser) {
        return ApiResponse.conflict(
          'Este email já está cadastrado',
          'USER_ALREADY_EXISTS'
        );
      }
      
      // Check if WhatsApp already exists
      if (validatedData.whatsapp) {
        const cleanPhone = validatedData.whatsapp.replace(/\D/g, '');
        const existingPhone = await prisma.user.findFirst({
          where: { phone: cleanPhone },
        });
        
        if (existingPhone) {
          return ApiResponse.conflict(
            'Este WhatsApp já está cadastrado',
            'PHONE_ALREADY_EXISTS'
          );
        }
      }
      
      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create user transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            name: validatedData.name,
            email: validatedData.email,
            password: hashedPassword,
            phone: validatedData.whatsapp?.replace(/\D/g, ''),
            kycLevel: KYCLevel.PLATFORM_ACCESS,
            acceptedTermsAt: validatedData.acceptTerms ? new Date() : null,
            newsletterSubscribed: validatedData.newsletter || false,
          },
        });
        
        // Generate verification token
        const verificationToken = generateVerificationToken();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24); // Expires in 24 hours
        
        await tx.verificationToken.create({
          data: {
            identifier: user.email,
            token: verificationToken,
            expires,
          },
        });
        
        // Create activity log
        await tx.activityLog.create({
          data: {
            userId: user.id,
            action: 'USER_REGISTERED',
            ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
            metadata: {
              source: body.source || 'landing_page',
              referrer: body.referrer,
            },
          },
        });
        
        return { user, verificationToken };
      });
      
      // Asynchronous tasks (don't wait for these)
      Promise.all([
        // Send verification SMS
        validatedData.whatsapp && import('@/services/sms.service').then(({ smsService }) =>
          smsService.sendVerificationSMS(validatedData.whatsapp, result.verificationToken)
        ).catch(console.error),
        
        // Send verification email as backup
        import('@/services/email.service').then(({ emailService }) =>
          emailService.sendVerificationEmail(result.user.email, result.verificationToken)
        ).catch(console.error),
        
        // Subscribe to newsletter if requested
        validatedData.newsletter && newsletterApi.subscribe({
          email: validatedData.email,
          name: validatedData.name,
          language: 'pt',
        }).catch(console.error),
        
        // Capture lead in CRM
        leadApi.capture({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.whatsapp,
          source: body.source === 'landing_page' ? LeadSource.LANDING_PAGE : LeadSource.REGISTRATION_FORM,
          interest: LeadInterest.P2P_TRADING,
          acceptTerms: validatedData.acceptTerms,
          acceptMarketing: validatedData.newsletter || false,
          utm_source: body.utm_source,
          utm_medium: body.utm_medium,
          utm_campaign: body.utm_campaign,
        }).catch(console.error),
      ]);
      
      return ApiResponse.created({
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        kycLevel: result.user.kycLevel,
        requiresEmailVerification: true,
        verificationEmailSent: true,
      });
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ApiResponse.badRequest(
          'Dados de registro inválidos',
          'VALIDATION_ERROR',
          error.errors
        );
      }
      
      console.error('Registration error:', error);
      return ApiResponse.internalError('Erro ao criar conta');
    }
  },
  {
    rateLimit: REGISTRATION_RATE_LIMIT,
    logging: true,
  }
);