// Serviço de email preparado para integração com Resend

interface ISendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private apiKey: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@rioporto.com';
  }

  async sendEmail({ to, subject, html, text }: ISendEmailParams): Promise<boolean> {
    try {
      // TODO: Implementar integração com Resend
      console.log('Email seria enviado:', {
        from: this.fromEmail,
        to,
        subject,
        html: html.substring(0, 100) + '...',
      });

      // Simulação de envio bem-sucedido
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verifique seu email - Rio Porto P2P</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Bem-vindo ao Rio Porto P2P!</h1>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
              Para completar seu cadastro e começar a negociar, verifique seu email clicando no botão abaixo:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Verificar Email
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin-bottom: 20px;">
              Ou use este código de verificação:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin-bottom: 30px;">
              <code style="font-size: 24px; font-weight: bold; color: #111827; letter-spacing: 2px;">${token}</code>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; line-height: 18px;">
              Este link é válido por 24 horas. Se você não criou uma conta no Rio Porto P2P, ignore este email.
            </p>
          </div>
        </body>
      </html>
    `;
    
    const text = `
      Bem-vindo ao Rio Porto P2P!
      
      Para verificar seu email, acesse: ${verificationUrl}
      
      Ou use o código: ${token}
      
      Este link é válido por 24 horas.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verifique seu email - Rio Porto P2P',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redefinir senha - Rio Porto P2P</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Redefinir sua senha</h1>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
              Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; line-height: 18px;">
              Este link é válido por 1 hora. Se você não solicitou a redefinição de senha, ignore este email.
            </p>
          </div>
        </body>
      </html>
    `;
    
    const text = `
      Redefinir sua senha - Rio Porto P2P
      
      Para redefinir sua senha, acesse: ${resetUrl}
      
      Este link é válido por 1 hora.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Redefinir senha - Rio Porto P2P',
      html,
      text,
    });
  }
}

export const emailService = new EmailService();