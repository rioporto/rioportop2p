import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
// import { hashPassword } from '@/lib/auth/utils';
import { z } from 'zod';

// Schema simplificado para teste
const testSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  whatsapp: z.string().min(10),
  password: z.string().min(8),
  confirmPassword: z.string(),
  acceptTerms: z.boolean(),
});

export async function POST(req: NextRequest) {
  console.log('=== REGISTER TEST ROUTE CALLED ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL exists:', !!process.env.DATABASE_URL);
  
  try {
    // 1. Parse do body
    const body = await req.json();
    console.log('1. Body received:', JSON.stringify(body, null, 2));
    
    // 2. Validação
    let validatedData;
    try {
      validatedData = testSchema.parse(body);
      console.log('2. Validation passed');
    } catch (zodError: any) {
      console.error('2. Validation failed:', zodError.errors);
      return NextResponse.json({
        success: false,
        error: {
          message: 'Dados inválidos',
          details: zodError.errors
        }
      }, { status: 400 });
    }
    
    // 3. Verificar se senhas coincidem
    if (validatedData.password !== validatedData.confirmPassword) {
      console.error('3. Passwords do not match');
      return NextResponse.json({
        success: false,
        error: { message: 'As senhas não coincidem' }
      }, { status: 400 });
    }
    
    // 4. Testar conexão com banco
    console.log('4. Testing database connection...');
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('4a. Database connection OK');
    } catch (dbError: any) {
      console.error('4b. Database connection failed:', dbError.message);
      return NextResponse.json({
        success: false,
        error: { message: 'Erro de conexão com banco de dados' }
      }, { status: 503 });
    }
    
    // 5. Verificar se email já existe
    console.log('5. Checking if email exists...');
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      console.log('4. Email already exists');
      return NextResponse.json({
        success: false,
        error: { message: 'Este email já está cadastrado' }
      }, { status: 409 });
    }
    
    // 6. Verificar se WhatsApp já existe
    console.log('6. Checking if WhatsApp exists...');
    const cleanPhone = validatedData.whatsapp.replace(/\D/g, '');
    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone }
    });
    
    if (existingPhone) {
      console.log('6. WhatsApp already exists');
      return NextResponse.json({
        success: false,
        error: { message: 'Este WhatsApp já está cadastrado' }
      }, { status: 409 });
    }
    
    // 7. Hash da senha
    console.log('6. Hashing password...');
    let hashedPassword;
    try {
      // Tentar usar bcrypt
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(validatedData.password, salt);
      console.log('6a. Password hashed with bcrypt');
    } catch (bcryptError) {
      console.error('6b. Bcrypt error:', bcryptError);
      // Fallback simples para teste (NÃO USAR EM PRODUÇÃO)
      hashedPassword = Buffer.from(validatedData.password).toString('base64');
      console.log('6c. Using fallback hash (NOT SECURE)');
    }
    
    // 8. Criar usuário
    console.log('7. Creating user...');
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: cleanPhone,
        acceptedTermsAt: validatedData.acceptTerms ? new Date() : null,
      }
    });
    
    console.log('9. User created successfully:', user.id);
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        message: 'Conta criada com sucesso!'
      }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('=== REGISTER TEST ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Erro interno ao criar conta',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }, { status: 500 });
  }
}