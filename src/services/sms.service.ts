// Serviço de SMS preparado para integração com SMSDev

interface ISendSMSParams {
  to: string;
  message: string;
}

export class SMSService {
  private apiKey: string;
  private from: string;

  constructor() {
    this.apiKey = process.env.SMSDEV_API_KEY || '';
    this.from = process.env.SMSDEV_FROM || 'RioPorto';
  }

  async sendSMS({ to, message }: ISendSMSParams): Promise<boolean> {
    try {
      // TODO: Implementar integração com SMSDev
      console.log('SMS seria enviado:', {
        from: this.from,
        to,
        message,
      });

      // Simulação de envio bem-sucedido
      return true;
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