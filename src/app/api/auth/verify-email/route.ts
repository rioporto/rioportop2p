import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  console.log('=== EMAIL VERIFICATION ROUTE CALLED ===');
  
  try {
    // Get token from query parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return ApiResponse.badRequest('Token de verificação não fornecido', 'MISSING_TOKEN');
    }
    
    // Find verification token in database
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'email',
        usedAt: null, // Not used yet
      },
      include: {
        user: true,
      },
    });
    
    if (!verificationToken) {
      return ApiResponse.notFound('Token de verificação inválido ou já utilizado', 'INVALID_TOKEN');
    }
    
    // Check if token has expired
    if (new Date() > verificationToken.expiresAt) {
      return ApiResponse.badRequest('Token de verificação expirado', 'TOKEN_EXPIRED');
    }
    
    // Update user and token in a transaction
    await prisma.$transaction(async (tx) => {
      // Mark user email as verified
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
      
      // Mark token as used
      await tx.verificationToken.update({
        where: { id: verificationToken.id },
        data: {
          usedAt: new Date(),
        },
      });
    });
    
    console.log('Email verified successfully for user:', verificationToken.userId);
    
    // Redirect to login page with success message
    const redirectUrl = new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('verified', 'true');
    redirectUrl.searchParams.set('email', verificationToken.user.email);
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Email verification error:', error);
    
    // Redirect to login page with error
    const redirectUrl = new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('error', 'verification_failed');
    
    return NextResponse.redirect(redirectUrl);
  }
}

export async function POST(req: NextRequest) {
  console.log('=== RESEND EMAIL VERIFICATION ROUTE CALLED ===');
  
  try {
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return ApiResponse.badRequest('Email não fornecido', 'MISSING_EMAIL');
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (!user) {
      return ApiResponse.notFound('Usuário não encontrado', 'USER_NOT_FOUND');
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return ApiResponse.badRequest('Email já verificado', 'ALREADY_VERIFIED');
    }
    
    // Check for rate limiting - only allow resend every 5 minutes
    const recentToken = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        type: 'email',
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (recentToken) {
      const waitTime = Math.ceil((5 * 60 * 1000 - (Date.now() - recentToken.createdAt.getTime())) / 1000);
      return ApiResponse.tooManyRequests(
        `Por favor, aguarde ${waitTime} segundos antes de solicitar outro email de verificação`,
        'RATE_LIMITED'
      );
    }
    
    // Generate new verification token
    const { generateVerificationToken } = await import('@/lib/auth/utils');
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours expiry
    
    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'email',
        expiresAt: tokenExpiry,
      },
    });
    
    // Send verification email
    const { emailService } = await import('@/services/email.service');
    const emailSent = await emailService.sendVerificationEmail(user.email, verificationToken);
    
    if (!emailSent) {
      return ApiResponse.internalError('Erro ao enviar email de verificação');
    }
    
    return ApiResponse.success({
      message: 'Email de verificação enviado com sucesso',
      email: user.email,
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    return ApiResponse.internalError('Erro ao reenviar email de verificação');
  }
}