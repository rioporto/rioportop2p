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
  console.log('=== EMAIL VERIFICATION BY CODE ROUTE CALLED ===');
  
  try {
    const body = await req.json();
    const { token } = body;
    
    if (!token) {
      return ApiResponse.badRequest('Código de verificação não fornecido', 'MISSING_TOKEN');
    }
    
    // Find verification token in database (código de 6 dígitos)
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: token.toString(),
        type: 'email',
        usedAt: null, // Not used yet
        expiresAt: {
          gt: new Date() // Not expired
        }
      },
      include: {
        user: true,
      },
    });
    
    if (!verificationToken) {
      return ApiResponse.badRequest('Código de verificação inválido ou expirado', 'INVALID_TOKEN');
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
    
    return ApiResponse.success({
      message: 'Email verificado com sucesso',
      email: verificationToken.user.email,
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    return ApiResponse.internalError('Erro ao verificar email');
  }
}