import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Importar Prisma localmente para evitar problemas
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // Verificar se email existe
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() }
      });
      
      if (existingUser) {
        await prisma.$disconnect();
        return NextResponse.json({
          success: false,
          error: 'Este email já está cadastrado',
          code: 'USER_ALREADY_EXISTS'
        }, { status: 409 });
      }
      
      // Verificar WhatsApp se fornecido
      if (body.whatsapp) {
        const cleanPhone = body.whatsapp.replace(/\D/g, '');
        const existingPhone = await prisma.user.findFirst({
          where: { phone: cleanPhone }
        });
        
        if (existingPhone) {
          await prisma.$disconnect();
          return NextResponse.json({
            success: false,
            error: 'Este WhatsApp já está cadastrado',
            code: 'PHONE_ALREADY_EXISTS'
          }, { status: 409 });
        }
      }
      
      // Hash simples temporário
      const passwordHash = Buffer.from(body.password).toString('base64');
      
      // Preparar dados
      const nameParts = body.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];
      
      // Criar usuário
      const user = await prisma.user.create({
        data: {
          email: body.email.toLowerCase(),
          passwordHash: passwordHash,
          firstName: firstName,
          lastName: lastName,
          phone: body.whatsapp ? body.whatsapp.replace(/\D/g, '') : null,
          kycLevel: 'PLATFORM_ACCESS',
          termsAcceptedAt: body.acceptTerms ? new Date() : null,
          marketingConsent: false,
        }
      });
      
      await prisma.$disconnect();
      
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          message: 'Conta criada com sucesso!'
        }
      }, { status: 201 });
      
    } catch (dbError: any) {
      await prisma.$disconnect();
      
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          error: 'Email ou WhatsApp já cadastrado',
          code: 'DUPLICATE_ENTRY'
        }, { status: 409 });
      }
      
      throw dbError;
    }
    
  } catch (error: any) {
    console.error('Register error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar conta',
      details: error.message
    }, { status: 500 });
  }
}