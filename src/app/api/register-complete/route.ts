import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '@/services/email';
import { generateUUID } from '@/lib/utils/uuid';

export async function POST(req: NextRequest) {
  console.log('========== REGISTER-COMPLETE INICIO ==========');
  
  try {
    const body = await req.json();
    console.log('Registration attempt for:', body.email);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validação básica com log detalhado
    const missingFields = [];
    if (!body.email) missingFields.push('email');
    if (!body.password) missingFields.push('password');
    if (!body.name) missingFields.push('name');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios faltando: ' + missingFields.join(', ')
      }, { status: 400 });
    }
    
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: {
        verificationTokens: {
          where: {
            type: 'email',
            expiresAt: {
              gt: new Date()
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    if (existingUser) {
      // Se o email já foi verificado, bloquear completamente
      if (existingUser.emailVerified) {
        return NextResponse.json({
          success: false,
          error: 'Este email já está cadastrado e verificado. Faça login ou use outro email.',
          code: 'EMAIL_ALREADY_VERIFIED'
        }, { status: 409 });
      }
      
      // Se não foi verificado, permitir recadastro (sobrescrever dados)
      // Mas primeiro vamos deletar o usuário antigo não verificado
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
      console.log('Deleted unverified user:', existingUser.id);
    }
    
    // Hash da senha
    const passwordHash = await bcrypt.hash(body.password, 10);
    
    // Gerar código de verificação de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos para código
    
    // Criar usuário com logs detalhados
    console.log('Creating user with data:', {
      email: body.email.toLowerCase(),
      firstName: body.name.split(' ')[0],
      lastName: body.name.split(' ').slice(1).join(' ') || body.name.split(' ')[0],
      phone: body.whatsapp?.replace(/\D/g, ''),
      acceptTerms: body.acceptTerms,
      newsletter: body.newsletter
    });
    
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
    
    console.log('User created successfully:', user.id);
    
    // Criar token de verificação separadamente (armazenamos o código curto)
    const verification = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationCode,
        type: 'email',
        expiresAt: verificationExpires
      }
    });
    
    // Enviar email de verificação com código
    try {
      await sendEmail({
        to: user.email,
        subject: 'Código de verificação - Rio Porto P2P',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Código de verificação</title>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background-color: #f5f5f5; border-radius: 0 0 8px 8px; }
                .code-box { 
                  background-color: #ffffff; 
                  border: 2px solid #4CAF50; 
                  border-radius: 8px; 
                  padding: 20px; 
                  text-align: center; 
                  margin: 20px 0;
                }
                .code { 
                  font-size: 32px; 
                  font-weight: bold; 
                  color: #1a1a1a; 
                  letter-spacing: 8px; 
                  font-family: monospace;
                }
                .timer { 
                  color: #666; 
                  font-size: 14px; 
                  margin-top: 10px;
                }
                .footer { 
                  text-align: center; 
                  color: #999; 
                  font-size: 12px; 
                  margin-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Rio Porto P2P</h1>
                </div>
                <div class="content">
                  <h2>Olá ${user.firstName}!</h2>
                  <p>Use o código abaixo para verificar seu email e completar seu cadastro:</p>
                  
                  <div class="code-box">
                    <div class="code">${verificationCode}</div>
                    <div class="timer">Válido por 30 minutos</div>
                  </div>
                  
                  <p>Digite este código na tela de verificação para ativar sua conta.</p>
                  
                  <div class="footer">
                    <p>Se você não criou uma conta na Rio Porto P2P, pode ignorar este email.</p>
                    <p>Este é um email automático, não responda.</p>
                  </div>
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
      
      // Em desenvolvimento, mostrar código de verificação no console
      if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
        console.log('');
        console.log('📧 CÓDIGO DE VERIFICAÇÃO:');
        console.log(`   ${verificationCode}`);
        console.log('   (válido por 30 minutos)');
        console.log('');
      }
    }
    
    // Se não há API key, incluir código de verificação na resposta
    const response: any = {
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para o código de verificação.',
      requiresVerification: true
    };
    
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === '') {
      response.verificationCode = verificationCode;
      response.message = 'Conta criada! Use o código abaixo para verificar (email não configurado):';
    }
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('========== REGISTER-COMPLETE ERRO ==========');
    console.error('Registration error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Verificar se é erro do Prisma
      if (error.message.includes('Unique constraint')) {
        console.error('Unique constraint violation detected');
        return NextResponse.json({
          success: false,
          error: 'Email ou telefone já cadastrado',
          code: 'UNIQUE_CONSTRAINT'
        }, { status: 409 });
      }
      
      if (error.message.includes('Foreign key constraint')) {
        console.error('Foreign key constraint error');
        return NextResponse.json({
          success: false,
          error: 'Erro de integridade de dados',
          code: 'FK_CONSTRAINT'
        }, { status: 400 });
      }
    }
    
    // Retorna erro mais específico
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar conta. Tente novamente.',
      details: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        type: error?.constructor?.name,
        stack: error instanceof Error ? error.stack : undefined
      } : undefined
    }, { status: 500 });
  }
  
  finally {
    console.log('========== REGISTER-COMPLETE FIM ==========');
  }
}