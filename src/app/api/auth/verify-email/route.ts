import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyEmailSchema } from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Valida os dados de entrada
    const { token } = verifyEmailSchema.parse(body);
    
    // Busca o token de verificação
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token de verificação inválido',
          },
        },
        { status: 400 }
      );
    }
    
    // Verifica se o token expirou
    if (verificationToken.expires < new Date()) {
      // Remove o token expirado
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXPIRED_TOKEN',
            message: 'Token de verificação expirado',
          },
        },
        { status: 400 }
      );
    }
    
    // Atualiza o usuário como verificado
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });
    
    // Remove o token usado
    await prisma.verificationToken.delete({
      where: { token },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Email verificado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }
    
    console.error('Verify email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao verificar email',
        },
      },
      { status: 500 }
    );
  }
}