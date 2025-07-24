import { NextRequest, NextResponse } from 'next/server';
import { KYCLevel } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  console.log('=== REGISTER V2 - MINIMAL VERSION ===');
  
  try {
    // 1. Parse body
    const body = await req.json();
    console.log('Body received:', { ...body, password: '[HIDDEN]' });
    
    // 2. Validações básicas
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({
        success: false,
        error: 'Dados obrigatórios faltando',
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }
    
    // 3. Verificar email duplicado
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() }
      });
      
      if (existingUser) {
        console.log('Email já existe:', body.email);
        return NextResponse.json({
          success: false,
          error: 'Este email já está cadastrado',
          code: 'USER_ALREADY_EXISTS'
        }, { status: 409 });
      }
    } catch (dbError: any) {
      console.error('Erro ao verificar email:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao verificar email',
        details: dbError.message
      }, { status: 500 });
    }
    
    // 4. Verificar WhatsApp se fornecido
    if (body.whatsapp) {
      const cleanPhone = body.whatsapp.replace(/\D/g, '');
      
      try {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: cleanPhone }
        });
        
        if (existingPhone) {
          console.log('WhatsApp já existe:', cleanPhone);
          return NextResponse.json({
            success: false,
            error: 'Este WhatsApp já está cadastrado',
            code: 'PHONE_ALREADY_EXISTS'
          }, { status: 409 });
        }
      } catch (dbError: any) {
        console.error('Erro ao verificar WhatsApp:', dbError);
      }
    }
    
    // 5. Hash de senha simples (temporário - sem bcrypt)
    const passwordHash = Buffer.from(body.password).toString('base64');
    
    // 6. Preparar dados do usuário
    const nameParts = body.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    
    // 7. Criar usuário
    try {
      const user = await prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash: passwordHash,
          firstName: firstName,
          lastName: lastName,
          phone: body.whatsapp ? body.whatsapp.replace(/\D/g, '') : null,
          kycLevel: KYCLevel.PLATFORM_ACCESS,
          termsAcceptedAt: body.acceptTerms ? new Date() : null,
          marketingConsent: body.newsletter || false,
        }
      });
      
      console.log('Usuário criado com sucesso:', user.id);
      
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          message: 'Conta criada com sucesso!'
        }
      }, { status: 201 });
      
    } catch (createError: any) {
      console.error('Erro ao criar usuário:', createError);
      
      // Verificar violação de constraint única
      if (createError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Email ou WhatsApp já cadastrado',
          code: 'DUPLICATE_ENTRY'
        }, { status: 409 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar conta',
        details: createError.message
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Erro geral:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro inesperado',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  } finally {
    // Não desconectar quando usando cliente compartilhado
    // await prisma.$disconnect();
  }
}