import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, generateVerificationToken } from '@/lib/auth/utils';
import { registerSchema } from '@/lib/validations/auth';
import { KYCLevel } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Valida os dados de entrada
    const validatedData = registerSchema.parse(body);
    
    // Verifica se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Este email já está cadastrado',
          },
        },
        { status: 400 }
      );
    }
    
    // Verifica se o CPF já existe (se fornecido)
    if (validatedData.cpf) {
      const existingCPF = await prisma.user.findUnique({
        where: { cpf: validatedData.cpf.replace(/\D/g, '') },
      });
      
      if (existingCPF) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CPF_EXISTS',
              message: 'Este CPF já está cadastrado',
            },
          },
          { status: 400 }
        );
      }
    }
    
    // Hash da senha
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        cpf: validatedData.cpf?.replace(/\D/g, ''),
        phone: validatedData.phone?.replace(/\D/g, ''),
        kycLevel: validatedData.cpf ? KYCLevel.BASIC : KYCLevel.PLATFORM_ACCESS,
      },
    });
    
    // Gera token de verificação de email
    const verificationToken = generateVerificationToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Expira em 24 horas
    
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires,
      },
    });
    
    // Enviar email de verificação
    const { emailService } = await import('@/services/email.service');
    await emailService.sendVerificationEmail(user.email, verificationToken);
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          kycLevel: user.kycLevel,
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
    
    console.error('Register error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao criar conta',
        },
      },
      { status: 500 }
    );
  }
}