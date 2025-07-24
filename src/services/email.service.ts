// Serviço de email com integração Resend
import { Resend } from 'resend';

interface ISendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@rioporto.com';
  }

  async sendEmail({ to, subject, html, text }: ISendEmailParams): Promise<boolean> {
    try {
      // Se não tiver API key configurada, apenas loga
      if (!this.resend) {
        console.log('Email seria enviado (Resend não configurado):', {
          from: this.fromEmail,
          to,
          subject,
          html: html.substring(0, 100) + '...',
        });
        return true;
      }

      // Envia email via Resend
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
      });

      if (error) {
        console.error('Erro ao enviar email via Resend:', error);
        return false;
      }

      console.log('Email enviado com sucesso:', data?.id);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifique seu email - Rio Porto P2P</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <tr>
                    <td style="padding: 48px 40px 40px;">
                      <!-- Logo -->
                      <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="margin: 0; color: #111827; font-size: 28px; font-weight: 700;">Rio Porto P2P</h1>
                      </div>
                      
                      <!-- Título -->
                      <h2 style="margin: 0 0 24px; color: #111827; font-size: 24px; font-weight: 600; text-align: center;">
                        Verifique seu email
                      </h2>
                      
                      <!-- Mensagem -->
                      <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 24px; text-align: center;">
                        Obrigado por se cadastrar! Para completar seu registro e começar a negociar com segurança, por favor verifique seu email.
                      </p>
                      
                      <!-- Botão CTA -->
                      <div style="text-align: center; margin-bottom: 32px;">
                        <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                          Verificar Email
                        </a>
                      </div>
                      
                      <!-- Divisor -->
                      <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>
                      
                      <!-- Código alternativo -->
                      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; text-align: center;">
                        Ou copie e cole este link no seu navegador:
                      </p>
                      
                      <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px; word-break: break-all;">
                        <code style="font-size: 14px; color: #4b5563;">${verificationUrl}</code>
                      </div>
                      
                      <!-- Aviso de segurança -->
                      <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                          <strong>Importante:</strong> Este link expira em 24 horas por motivos de segurança.
                        </p>
                      </div>
                      
                      <!-- Footer -->
                      <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 18px; text-align: center;">
                        Se você não criou uma conta no Rio Porto P2P, pode ignorar este email com segurança.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
    
    const text = `
      Rio Porto P2P - Verificação de Email
      
      Obrigado por se cadastrar! Para completar seu registro, verifique seu email acessando o link abaixo:
      
      ${verificationUrl}
      
      Este link expira em 24 horas.
      
      Se você não criou uma conta no Rio Porto P2P, pode ignorar este email.
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