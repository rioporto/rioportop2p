import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateUUID } from '@/lib/utils/uuid';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('Testing specific user creation with:', body);
    
    // Verificações detalhadas
    const checks = {
      email: null as any,
      phone: null as any,
      cpf: null as any
    };
    
    // 1. Verificar email
    if (body.email) {
      checks.email = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
        select: { id: true, email: true, emailVerified: true }
      });
    }
    
    // 2. Verificar telefone
    if (body.whatsapp) {
      const cleanPhone = body.whatsapp.replace(/\D/g, '');
      checks.phone = await prisma.user.findFirst({
        where: { phone: cleanPhone },
        select: { id: true, email: true, phone: true }
      });
    }
    
    // 3. Verificar CPF se fornecido
    if (body.cpf) {
      const cleanCpf = body.cpf.replace(/\D/g, '');
      checks.cpf = await prisma.user.findFirst({
        where: { cpf: cleanCpf },
        select: { id: true, email: true, cpf: true }
      });
    }
    
    // Se algum já existe, retornar detalhes
    if (checks.email || checks.phone || checks.cpf) {
      return NextResponse.json({
        success: false,
        message: 'Dados já cadastrados',
        conflicts: {
          email: checks.email ? {
            exists: true,
            user: checks.email
          } : { exists: false },
          phone: checks.phone ? {
            exists: true,
            user: checks.phone
          } : { exists: false },
          cpf: checks.cpf ? {
            exists: true,
            user: checks.cpf
          } : { exists: false }
        }
      }, { status: 409 });
    }
    
    // Tentar criar exatamente como no registro real
    try {
      const passwordHash = await bcrypt.hash(body.password || 'Test123!', 10);
      
      const userData = {
        id: generateUUID(),
        email: body.email.toLowerCase(),
        firstName: body.name.split(' ')[0],
        lastName: body.name.split(' ').slice(1).join(' ') || body.name.split(' ')[0],
        passwordHash,
        phone: body.whatsapp?.replace(/\D/g, ''),
        cpf: body.cpf?.replace(/\D/g, ''),
        kycLevel: 'PLATFORM_ACCESS' as const,
        status: 'ACTIVE' as const,
        termsAcceptedAt: body.acceptTerms ? new Date() : null,
        marketingConsent: body.newsletter || false
      };
      
      console.log('Attempting to create user with:', userData);
      
      const user = await prisma.user.create({
        data: userData
      });
      
      return NextResponse.json({
        success: true,
        message: 'User created successfully!',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone
        },
        note: 'User was created but NOT deleted - you may want to clean up manually'
      });
      
    } catch (createError: any) {
      console.error('Create error:', createError);
      
      return NextResponse.json({
        success: false,
        message: 'Creation failed',
        error: {
          code: createError.code,
          message: createError.message,
          meta: createError.meta,
          target: createError.meta?.target,
          modelName: createError.meta?.modelName
        },
        requestData: body
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error
    }, { status: 500 });
  }
}