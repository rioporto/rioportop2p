import { Resend } from 'resend';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = 'Rio Porto P2P <noreply@rioporto.com.br>' }: SendEmailOptions) {
  try {
    console.log('📧 Iniciando envio de email...');
    console.log('Para:', to);
    console.log('Assunto:', subject);
    console.log('RESEND_API_KEY configurada:', !!process.env.RESEND_API_KEY);
    
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === '') {
      console.error('⚠️ RESEND_API_KEY não configurada - Email não será enviado!');
      console.error('Configure a variável RESEND_API_KEY no arquivo .env');
      console.log('📧 Email que seria enviado para:', to);
      console.log('📧 Assunto:', subject);
      console.log('📧 Preview:', html.substring(0, 200) + '...');
      
      // Retorna sucesso para não bloquear o fluxo
      return { success: true, id: 'mock-email-' + Date.now() };
    }
    
    // Inicializa Resend apenas quando há API key
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html
    });
    
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}