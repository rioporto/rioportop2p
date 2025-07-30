import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/services/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email é obrigatório'
      }, { status: 400 });
    }
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Email não encontrado. Por favor, faça o cadastro primeiro.'
      }, { status: 404 });
    }
    
    if (user.emailVerified) {
      return NextResponse.json({
        success: false,
        error: 'Este email já foi verificado. Faça login para acessar sua conta.'
      }, { status: 400 });
    }
    
    // Verificar se já existe um token válido
    if (user.verificationTokens.length > 0) {
      const existingToken = user.verificationTokens[0];
      const tokenAge = Date.now() - existingToken.createdAt.getTime();
      const minWaitTime = 60 * 1000; // 1 minuto
      
      // Se o token foi criado há menos de 1 minuto, não permitir reenvio
      if (tokenAge < minWaitTime) {
        const waitSeconds = Math.ceil((minWaitTime - tokenAge) / 1000);
        return NextResponse.json({
          success: false,
          error: `Aguarde ${waitSeconds} segundos antes de solicitar um novo código.`
        }, { status: 429 });
      }
    }
    
    // Gerar novo código de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    
    // Invalidar tokens anteriores
    await prisma.verificationToken.updateMany({
      where: {
        userId: user.id,
        type: 'email'
      },
      data: {
        expiresAt: new Date() // Expira imediatamente
      }
    });
    
    // Criar novo token
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationCode,
        type: 'email',
        expiresAt: verificationExpires
      }
    });
    
    // Enviar email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Novo código de verificação - Rio Porto P2P',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Novo código de verificação</title>
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
                  <p>Você solicitou um novo código de verificação. Use o código abaixo para verificar seu email:</p>
                  
                  <div class="code-box">
                    <div class="code">${verificationCode}</div>
                    <div class="timer">Válido por 30 minutos</div>
                  </div>
                  
                  <p>Digite este código na tela de verificação para ativar sua conta.</p>
                  
                  <div class="footer">
                    <p>Se você não solicitou este código, pode ignorar este email.</p>
                    <p>Este é um email automático, não responda.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });
      
      console.log('Verification code resent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      
      // Em desenvolvimento, mostrar código no console
      if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
        console.log('');
        console.log('📧 NOVO CÓDIGO DE VERIFICAÇÃO:');
        console.log(`   ${verificationCode}`);
        console.log('   (válido por 30 minutos)');
        console.log('');
      }
    }
    
    // Resposta com ou sem código (desenvolvimento)
    const response: any = {
      success: true,
      message: 'Novo código de verificação enviado para seu email.'
    };
    
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === '') {
      response.verificationCode = verificationCode;
      response.message = 'Novo código gerado (email não configurado):';
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao reenviar código. Tente novamente.'
    }, { status: 500 });
  }
}