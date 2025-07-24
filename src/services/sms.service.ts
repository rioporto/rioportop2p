// Serviço de SMS integrado com SMSDev

interface ISendSMSParams {
  to: string;
  message: string;
}

interface SMSDevResponse {
  success: boolean;
  message?: string;
  id?: string;
  error?: string;
}

export class SMSService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SMS_DEV_API_KEY || '';
    this.baseUrl = 'https://api.smsdev.com.br/v1';
    
    if (!this.apiKey) {
      console.warn('SMS_DEV_API_KEY not configured - SMS will not be sent');
    }
  }

  async sendSMS({ to, message }: ISendSMSParams): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.log('SMS_DEV_API_KEY não configurada. SMS simulado:', { to, message });
        return true; // Simula sucesso em desenvolvimento
      }

      const formattedPhone = this.formatPhoneForSMS(to);
      
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: formattedPhone,
          message: message,
        }),
      });

      const data: SMSDevResponse = await response.json();

      if (data.success) {
        console.log(`SMS enviado com sucesso para ${formattedPhone}`);
        return true;
      } else {
        console.error('Falha ao enviar SMS:', data.error || data.message);
        return false;
      }
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      return false;
    }
  }

  async sendVerificationSMS(phone: string, code: string): Promise<boolean> {
    const message = `Rio Porto P2P: Seu código de verificação é ${code}. Válido por 10 minutos.`;
    
    return this.sendSMS({
      to: phone,
      message,
    });
  }

  async sendTransactionAlertSMS(phone: string, type: string, amount: string): Promise<boolean> {
    const message = `Rio Porto P2P: ${type} de R$ ${amount} realizado com sucesso. Acesse sua conta para detalhes.`;
    
    return this.sendSMS({
      to: phone,
      message,
    });
  }

  generateVerificationCode(): string {
    // Gera código de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  formatPhoneForSMS(phone: string): string {
    // Remove formatação e adiciona código do país se necessário
    let cleaned = phone.replace(/\D/g, '');
    
    // Se não tem código do país, adiciona +55
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    return '+' + cleaned;
  }
}

export const smsService = new SMSService();