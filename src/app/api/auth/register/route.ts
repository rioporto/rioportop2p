import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, generateVerificationToken } from '@/lib/auth/utils';
import { registrationSchema } from '@/lib/api/registration';
import { ApiResponse } from '@/lib/api/response';
// import { withMiddleware, rateLimit } from '@/lib/api/middleware';
import { KYCLevel } from '@prisma/client';
import { leadApi } from '@/lib/api/lead';
import { LeadSource, LeadInterest } from '@/lib/api/lead';
import { newsletterApi } from '@/lib/api/newsletter';
import { verifyCaptcha } from '@/lib/security/captcha';

// Custom rate limit for registration
const REGISTRATION_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 registration attempts per 15 minutes
};

export async function POST(req: NextRequest) {
    console.log('=== REGISTER ROUTE CALLED ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    try {
      // Parse request body
      let body;
      try {
        body = await req.json();
        console.log('Received registration data:', JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        return ApiResponse.badRequest(
          'Requisição inválida - corpo da requisição mal formatado',
          'INVALID_REQUEST_BODY'
        );
      }
      
      // Skip captcha validation for now
      // if (process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === 'true' && body.captchaToken) {
      //   const captchaValid = await verifyCaptcha(body.captchaToken);
      //   if (!captchaValid) {
      //     return ApiResponse.badRequest('Captcha inválido', 'INVALID_CAPTCHA');
      //   }
      // }
      
      // Validate input data
      let validatedData;
      try {
        validatedData = registrationSchema.parse(body);
        console.log('Validation successful');
      } catch (validationError: any) {
        console.error('Validation error:', validationError);
        return ApiResponse.badRequest(
          'Dados de registro inválidos',
          'VALIDATION_ERROR',
          validationError.errors || validationError.message
        );
      }
      
      // Check if email already exists
      console.log('Checking if email exists:', validatedData.email);
      let existingUser;
      try {
        existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email.toLowerCase() },
        });
      } catch (dbError) {
        console.error('Database error when checking email:', dbError);
        return ApiResponse.internalError('Erro ao verificar disponibilidade do email');
      }
      
      if (existingUser) {
        console.log('Email already exists:', validatedData.email);
        return ApiResponse.conflict(
          'Este email já está cadastrado',
          'USER_ALREADY_EXISTS'
        );
      }
      
      // Check if WhatsApp already exists
      if (validatedData.whatsapp) {
        const cleanPhone = validatedData.whatsapp.replace(/\D/g, '');
        console.log('Checking if phone exists:', cleanPhone);
        
        let existingPhone;
        try {
          existingPhone = await prisma.user.findFirst({
            where: { phone: cleanPhone },
          });
        } catch (dbError) {
          console.error('Database error when checking phone:', dbError);
          return ApiResponse.internalError('Erro ao verificar disponibilidade do WhatsApp');
        }
        
        if (existingPhone) {
          console.log('Phone already exists:', cleanPhone);
          return ApiResponse.conflict(
            'Este WhatsApp já está cadastrado',
            'PHONE_ALREADY_EXISTS'
          );
        }
      }
      
      // Hash password
      console.log('Hashing password...');
      let hashedPassword;
      try {
        hashedPassword = await hashPassword(validatedData.password);
      } catch (hashError) {
        console.error('Error hashing password:', hashError);
        return ApiResponse.internalError('Erro ao processar senha');
      }
      
      // Create user
      const nameParts = validatedData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Use first name if no last name
      
      console.log('Creating user with data:', {
        email: validatedData.email.toLowerCase(),
        firstName,
        lastName,
        phone: validatedData.whatsapp?.replace(/\D/g, ''),
        kycLevel: KYCLevel.PLATFORM_ACCESS,
        termsAcceptedAt: validatedData.acceptTerms ? new Date() : null,
        marketingConsent: validatedData.newsletter || false,
      });
      
      let user;
      try {
        user = await prisma.user.create({
          data: {
            email: validatedData.email.toLowerCase(),
            passwordHash: hashedPassword,
            firstName,
            lastName,
            phone: validatedData.whatsapp?.replace(/\D/g, ''),
            kycLevel: KYCLevel.PLATFORM_ACCESS,
            termsAcceptedAt: validatedData.acceptTerms ? new Date() : null,
            marketingConsent: validatedData.newsletter || false,
          },
        });
        console.log('User created successfully:', user.id);
      } catch (createError: any) {
        console.error('Error creating user:', createError);
        
        // Check for unique constraint violations
        if (createError.code === 'P2002') {
          const target = createError.meta?.target;
          if (target?.includes('email')) {
            return ApiResponse.conflict(
              'Este email já está cadastrado',
              'USER_ALREADY_EXISTS'
            );
          }
          if (target?.includes('phone')) {
            return ApiResponse.conflict(
              'Este WhatsApp já está cadastrado',
              'PHONE_ALREADY_EXISTS'
            );
          }
        }
        
        return ApiResponse.internalError('Erro ao criar conta: ' + (createError.message || 'Erro desconhecido'));
      }
      
      // Generate verification token for future use
      const verificationToken = generateVerificationToken();
      console.log('Generated verification token');
      
      // Asynchronous tasks (don't wait for these)
      try {
        console.log('Processing async tasks...');
        
        // Newsletter subscription
        if (validatedData.newsletter) {
          try {
            await newsletterApi.subscribe({
              email: validatedData.email,
              name: validatedData.name,
              language: 'pt',
            });
            console.log('Newsletter subscription successful');
          } catch (error) {
            console.error('Newsletter subscription failed:', error);
          }
        }
        
        // Lead capture
        try {
          await leadApi.capture({
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
          });
          console.log('Lead capture successful');
        } catch (error) {
          console.error('Lead capture failed:', error);
        }
      } catch (error) {
        console.error('Error in async tasks:', error);
        // Don't fail the registration because of these
      }
      
      const response = {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        kycLevel: user.kycLevel,
        requiresEmailVerification: true,
        verificationEmailSent: true,
      };
      
      console.log('Registration successful, returning response:', response);
      return ApiResponse.created(response);
      
    } catch (error: any) {
      console.error('Unexpected registration error:', error);
      console.error('Error stack:', error.stack);
      
      // Additional error handling for specific error types
      if (error.name === 'PrismaClientKnownRequestError') {
        return ApiResponse.internalError('Erro de banco de dados: ' + error.message);
      }
      
      if (error.name === 'PrismaClientInitializationError') {
        return ApiResponse.internalError('Erro de conexão com banco de dados');
      }
      
      if (error.name === 'PrismaClientRustPanicError') {
        return ApiResponse.internalError('Erro crítico no banco de dados');
      }
      
      return ApiResponse.internalError('Erro inesperado ao criar conta: ' + (error.message || 'Erro desconhecido'));
    }
}