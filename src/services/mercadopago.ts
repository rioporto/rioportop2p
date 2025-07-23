import { IPixPayment, ICreatePixPaymentDto } from '@/types/api';

// Mercado Pago configuration
const MERCADOPAGO_API_BASE = 'https://api.mercadopago.com';
const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

// PIX payment types
export interface IMercadoPagoPixRequest {
  transaction_amount: number;
  description?: string;
  payment_method_id: 'pix';
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type: 'CPF';
      number: string;
    };
  };
}

export interface IMercadoPagoPixResponse {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  description?: string;
  point_of_interaction: {
    transaction_data: {
      qr_code: string;
      qr_code_base64: string;
      ticket_url: string;
    };
  };
  date_created: string;
  date_approved?: string;
}

// Mercado Pago service class
export class MercadoPagoService {
  private accessToken: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || MERCADOPAGO_ACCESS_TOKEN;
    
    if (!this.accessToken && typeof window !== 'undefined') {
      console.warn('MercadoPago access token not configured');
    }
  }

  private async fetchFromAPI<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${MERCADOPAGO_API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          `MercadoPago API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('MercadoPago API error:', error);
      throw error;
    }
  }

  // Create a PIX payment
  async createPixPayment(
    data: ICreatePixPaymentDto,
    userEmail: string,
    userCpf?: string
  ): Promise<IPixPayment> {
    // Validate access token
    if (!this.accessToken) {
      throw new Error('MercadoPago access token not configured');
    }

    const request: IMercadoPagoPixRequest = {
      transaction_amount: data.amount,
      description: data.description || 'Rio Porto P2P - Compra de Criptomoeda',
      payment_method_id: 'pix',
      payer: {
        email: userEmail,
      },
    };

    // Add CPF if available
    if (userCpf) {
      request.payer.identification = {
        type: 'CPF',
        number: userCpf.replace(/\D/g, ''), // Remove non-digits
      };
    }

    const response = await this.fetchFromAPI<IMercadoPagoPixResponse>(
      '/v1/payments',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    // Map response to our payment model
    return {
      id: response.id.toString(),
      transactionId: response.id.toString(),
      pixKey: response.point_of_interaction.transaction_data.qr_code,
      amount: response.transaction_amount,
      status: this.mapPaymentStatus(response.status),
      qrCode: response.point_of_interaction.transaction_data.qr_code_base64,
      qrCodeData: response.point_of_interaction.transaction_data.qr_code,
      createdAt: new Date(response.date_created),
      updatedAt: new Date(response.date_created),
    };
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<IPixPayment['status']> {
    const response = await this.fetchFromAPI<IMercadoPagoPixResponse>(
      `/v1/payments/${paymentId}`,
      { method: 'GET' }
    );

    return this.mapPaymentStatus(response.status);
  }

  // Cancel payment
  async cancelPayment(paymentId: string): Promise<void> {
    await this.fetchFromAPI(`/v1/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
    });
  }

  // Map MercadoPago status to our status
  private mapPaymentStatus(mpStatus: string): IPixPayment['status'] {
    const statusMap: Record<string, IPixPayment['status']> = {
      pending: 'PENDING',
      approved: 'COMPLETED',
      authorized: 'PROCESSING',
      in_process: 'PROCESSING',
      in_mediation: 'PROCESSING',
      rejected: 'FAILED',
      cancelled: 'FAILED',
      refunded: 'FAILED',
      charged_back: 'FAILED',
    };

    return statusMap[mpStatus] || 'PENDING';
  }

  // Webhook signature validation
  validateWebhookSignature(
    signature: string | null,
    requestId: string | null,
    data: any
  ): boolean {
    // TODO: Implement webhook signature validation
    // This requires the webhook secret from MercadoPago
    console.warn('Webhook signature validation not implemented');
    return true;
  }

  // Process webhook notification
  async processWebhookNotification(data: any): Promise<void> {
    if (data.type === 'payment' && data.action === 'payment.updated') {
      const paymentId = data.data.id;
      // TODO: Update payment status in database
      console.log(`Payment ${paymentId} updated via webhook`);
    }
  }
}

// Lazy-loaded singleton instance
let _mercadoPagoService: MercadoPagoService | null = null;

export const getMercadoPagoService = () => {
  if (!_mercadoPagoService) {
    _mercadoPagoService = new MercadoPagoService();
  }
  return _mercadoPagoService;
};

// For backward compatibility
export const mercadoPagoService = {
  createPixPayment: (...args: Parameters<MercadoPagoService['createPixPayment']>) => 
    getMercadoPagoService().createPixPayment(...args),
  getPaymentStatus: (...args: Parameters<MercadoPagoService['getPaymentStatus']>) => 
    getMercadoPagoService().getPaymentStatus(...args),
  cancelPayment: (...args: Parameters<MercadoPagoService['cancelPayment']>) => 
    getMercadoPagoService().cancelPayment(...args),
  validateWebhookSignature: (...args: Parameters<MercadoPagoService['validateWebhookSignature']>) => 
    getMercadoPagoService().validateWebhookSignature(...args),
  processWebhookNotification: (...args: Parameters<MercadoPagoService['processWebhookNotification']>) => 
    getMercadoPagoService().processWebhookNotification(...args),
};

// Utility functions
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(digits)) return false;
  
  // Validate check digits
  let sum = 0;
  let remainder: number;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(digits.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(digits.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits.substring(10, 11))) return false;
  
  return true;
}