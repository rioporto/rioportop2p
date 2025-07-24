import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, generateVerificationToken } from '@/lib/auth/utils';
import { registrationSchema } from '@/lib/api/registration';
import { ApiResponse } from '@/lib/api/response';
import { KYCLevel } from '@prisma/client';
import { leadApi } from '@/lib/api/lead';
import { LeadSource, LeadInterest } from '@/lib/api/lead';
import { newsletterApi } from '@/lib/api/newsletter';
import { verifyCaptcha } from '@/lib/security/captcha';

export async function POST(req: NextRequest) {
  console.log('=== ENHANCED REGISTER ROUTE CALLED ===');
  
  try {
    const body = await req.json();
    console.log('Received registration data:', body);
    
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
      where: { email: validatedData.email.toLowerCase() },
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
    
    // Parse name
    const nameParts = validatedData.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours expiry
    
    // Create user with verification token in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
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
      
      // Create verification token
      await tx.verificationToken.create({
        data: {
          userId: newUser.id,
          token: verificationToken,
          type: 'email',
          expiresAt: tokenExpiry,
        },
      });
      
      return newUser;
    });
    
    console.log('User created successfully with verification token:', user.id);
    
    // Asynchronous tasks (don't wait for these)
    Promise.all([
      // Send verification email
      import('@/services/email.service').then(({ emailService }) =>
        emailService.sendVerificationEmail(user.email, verificationToken)
      ).catch((error) => {
        console.error('Error sending verification email:', error);
      }),
      
      // Send verification SMS if WhatsApp provided
      validatedData.whatsapp && import('@/services/sms.service').then(({ smsService }) =>
        smsService.sendVerificationSMS(validatedData.whatsapp, verificationToken)
      ).catch((error) => {
        console.error('Error sending verification SMS:', error);
      }),
      
      // Subscribe to newsletter if requested
      validatedData.newsletter && newsletterApi.subscribe({
        email: validatedData.email,
        name: validatedData.name,
        language: 'pt',
      }).catch((error) => {
        console.error('Error subscribing to newsletter:', error);
      }),
      
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
      }).catch((error) => {
        console.error('Error capturing lead:', error);
      }),
    ]);
    
    return ApiResponse.created({
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      kycLevel: user.kycLevel,
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
    
    // Database errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
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
    
    console.error('Registration error:', error);
    return ApiResponse.internalError('Erro ao criar conta');
  }
}