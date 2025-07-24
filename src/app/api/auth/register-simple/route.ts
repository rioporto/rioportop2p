import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  console.log('=== REGISTER SIMPLE ROUTE ===');
  
  try {
    const body = await req.json();
    console.log('Body received (password hidden):', {
      ...body,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });
    
    // Validações básicas
    if (!body.name || body.name.length < 3) {
      return NextResponse.json({
        success: false,
        error: { message: 'Nome deve ter pelo menos 3 caracteres' }
      }, { status: 400 });
    }
    
    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json({
        success: false,
        error: { message: 'Email inválido' }
      }, { status: 400 });
    }
    
    if (!body.whatsapp || body.whatsapp.replace(/\D/g, '').length < 10) {
      return NextResponse.json({
        success: false,
        error: { message: 'WhatsApp inválido' }
      }, { status: 400 });
    }
    
    if (!body.password || body.password.length < 8) {
      return NextResponse.json({
        success: false,
        error: { message: 'Senha deve ter pelo menos 8 caracteres' }
      }, { status: 400 });
    }
    
    if (body.password !== body.confirmPassword) {
      return NextResponse.json({
        success: false,
        error: { message: 'As senhas não coincidem' }
      }, { status: 400 });
    }
    
    // Verificar email existente
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: { message: 'Este email já está cadastrado' }
      }, { status: 409 });
    }
    
    // Verificar WhatsApp existente
    const cleanPhone = body.whatsapp.replace(/\D/g, '');
    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone }
    });
    
    if (existingPhone) {
      return NextResponse.json({
        success: false,
        error: { message: 'Este WhatsApp já está cadastrado' }
      }, { status: 409 });
    }
    
    // Hash simples da senha (temporário - não usar em produção!)
    const hashedPassword = Buffer.from(body.password).toString('base64');
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phone: cleanPhone,
        acceptedTermsAt: body.acceptTerms ? new Date() : null,
      }
    });
    
    console.log('User created:', user.id);
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        message: 'Conta criada com sucesso! (Temporário - sem bcrypt)'
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Register error:', error);
    
    // Se for erro do Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: { message: 'Email ou WhatsApp já cadastrado' }
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erro ao criar conta',
        details: error.message
      }
    }, { status: 500 });
  }
}