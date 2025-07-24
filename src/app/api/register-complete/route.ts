import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '@/services/email';
import { generateUUID } from '@/lib/utils/uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Registration attempt for:', body.email);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validação básica
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      }, { status: 400 });
    }
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() }
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Este email já está cadastrado'
      }, { status: 409 });
    }
    
    // Hash da senha
    const passwordHash = await bcrypt.hash(body.password, 10);
    
    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        id: generateUUID(),
        email: body.email.toLowerCase(),
        firstName: body.name.split(' ')[0],
        lastName: body.name.split(' ').slice(1).join(' ') || body.name.split(' ')[0],
        passwordHash,
        phone: body.whatsapp?.replace(/\D/g, ''), // Remove caracteres não numéricos
        kycLevel: 'PLATFORM_ACCESS',
        status: 'ACTIVE',
        termsAcceptedAt: body.acceptTerms ? new Date() : null,
        marketingConsent: body.newsletter || false
      }
    });
    
    // Criar token de verificação separadamente
    const verification = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'email',
        expiresAt: verificationExpires
      }
    });
    
    // URL de verificação
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'https://rioporto.com.br'}/verify?token=${verificationToken}`;
    
    // Enviar email de verificação
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verifique seu email - Rio Porto P2P',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Verifique seu email</title>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f5f5f5; }
                .button { background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Rio Porto P2P</h1>
                </div>
                <div class="content">
                  <h2>Olá ${user.name}!</h2>
                  <p>Obrigado por se cadastrar na Rio Porto P2P. Para completar seu cadastro, por favor verifique seu email clicando no botão abaixo:</p>
                  <p style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verificar Email</a>
                  </p>
                  <p>Ou copie e cole este link no seu navegador:</p>
                  <p style="word-break: break-all;">${verificationUrl}</p>
                  <p>Este link é válido por 24 horas.</p>
                  <p>Se você não criou uma conta na Rio Porto P2P, pode ignorar este email.</p>
                </div>
              </div>
            </body>
          </html>
        `
      });
      
      console.log('Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Não falhar o registro se o email falhar
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para ativar sua conta.',
      requiresVerification: true
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Retorna erro mais específico
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? `Erro: ${errorMessage}` 
        : 'Erro ao criar conta. Tente novamente.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}