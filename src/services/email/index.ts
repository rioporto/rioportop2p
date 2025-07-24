import { Resend } from 'resend';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = 'Rio Porto P2P <noreply@rioporto.com.br>' }: SendEmailOptions) {
  try {
    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      // Em dev/teste, apenas loga
      console.log('Email content:', html.substring(0, 200) + '...');
      return { success: true, id: 'mock-email-id' };
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