import axios, { AxiosInstance } from 'axios';
import { IPixPayment, ICreatePixPaymentDto } from '@/types/api';
import QRCode from 'qrcode';

// Mercado Pago PIX Service configuration
const MERCADOPAGO_API_BASE = process.env.MERCADOPAGO_API_URL || 'https://api.mercadopago.com';
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

// Mock configuration for development
const USE_MOCK = process.env.NODE_ENV === 'development' || !MERCADOPAGO_ACCESS_TOKEN;

// PIX payment interfaces
interface MercadoPagoPixRequest {
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

interface MercadoPagoPixResponse {
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

interface WebhookNotification {
  id: string;
  type: 'payment';
  action: 'payment.created' | 'payment.updated';
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  user_id: string;
  version: number;
}

class PixService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: MERCADOPAGO_API_BASE,
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request interceptor for idempotency key
    this.axiosInstance.interceptors.request.use((config) => {
      if (config.method === 'post') {
        config.headers['X-Idempotency-Key'] = this.generateIdempotencyKey();
      }
      return config;
    });
  }

  /**
   * Creates a PIX payment in Mercado Pago
   * @param transactionId - Internal transaction ID
   * @param amount - Payment amount in BRL
   * @returns PIX payment data with QR code
   */
  async createPixPayment(
    transactionId: string,
    amount: number,
    userEmail: string = 'user@example.com',
    userCpf?: string
  ): Promise<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    pixKey: string;
    status: IPixPayment['status'];
  }> {
    try {
      if (USE_MOCK) {
        return await this.createMockPixPayment(transactionId, amount);
      }

      const request: MercadoPagoPixRequest = {
        transaction_amount: amount,
        description: `Rio Porto P2P - Transaction ${transactionId}`,
        payment_method_id: 'pix',
        payer: {
          email: userEmail,
        },
      };

      // Add CPF if available
      if (userCpf) {
        request.payer.identification = {
          type: 'CPF',
          number: userCpf.replace(/\D/g, ''),
        };
      }

      const response = await this.axiosInstance.post<MercadoPagoPixResponse>(
        '/v1/payments',
        request
      );

      // Save payment_id to database (this would be handled by the caller)
      const paymentData = {
        paymentId: response.data.id.toString(),
        qrCode: response.data.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: response.data.point_of_interaction.transaction_data.qr_code_base64,
        pixKey: response.data.point_of_interaction.transaction_data.qr_code,
        status: this.mapPaymentStatus(response.data.status),
      };

      return paymentData;
    } catch (error) {
      console.error('Error creating PIX payment:', error);
      throw new Error('Failed to create PIX payment');
    }
  }

  /**
   * Checks payment status in Mercado Pago
   * @param paymentId - Mercado Pago payment ID
   * @returns Payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<{
    isPaid: boolean;
    status: IPixPayment['status'];
    paidAt?: Date;
  }> {
    try {
      if (USE_MOCK) {
        return await this.checkMockPaymentStatus(paymentId);
      }

      const response = await this.axiosInstance.get<MercadoPagoPixResponse>(
        `/v1/payments/${paymentId}`
      );

      const status = this.mapPaymentStatus(response.data.status);
      const isPaid = status === 'COMPLETED';
      const paidAt = response.data.date_approved 
        ? new Date(response.data.date_approved) 
        : undefined;

      return {
        isPaid,
        status,
        paidAt,
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw new Error('Failed to check payment status');
    }
  }

  /**
   * Generates QR code image in base64 format
   * @param pixData - PIX payment data (usually the copia e cola string)
   * @returns Base64 encoded QR code image
   */
  async generateQRCode(pixData: string): Promise<string> {
    try {
      const qrCodeOptions = {
        type: 'png' as const,
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      };

      const base64 = await QRCode.toDataURL(pixData, qrCodeOptions);
      return base64;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Handles webhook notification from Mercado Pago
   * @param webhookData - Webhook payload from Mercado Pago
   * @returns Processing result
   */
  async handleWebhook(webhookData: WebhookNotification): Promise<{
    processed: boolean;
    paymentId?: string;
    transactionUpdate?: {
      status: IPixPayment['status'];
      isPaid: boolean;
    };
  }> {
    try {
      // Validate webhook data
      if (!webhookData || webhookData.type !== 'payment') {
        return { processed: false };
      }

      const paymentId = webhookData.data.id;

      // Check payment status
      const paymentStatus = await this.checkPaymentStatus(paymentId);

      // Process based on action
      if (webhookData.action === 'payment.updated' && paymentStatus.isPaid) {
        // Payment was completed - update transaction status
        return {
          processed: true,
          paymentId,
          transactionUpdate: {
            status: 'COMPLETED',
            isPaid: true,
          },
        };
      }

      return {
        processed: true,
        paymentId,
        transactionUpdate: {
          status: paymentStatus.status,
          isPaid: paymentStatus.isPaid,
        },
      };
    } catch (error) {
      console.error('Error handling webhook:', error);
      return { processed: false };
    }
  }

  /**
   * Maps Mercado Pago payment status to internal status
   */
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

  /**
   * Generates unique idempotency key for requests
   */
  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Mock implementations for development
  private async createMockPixPayment(
    transactionId: string,
    amount: number
  ): Promise<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    pixKey: string;
    status: IPixPayment['status'];
  }> {
    console.log('[MOCK] Creating PIX payment:', { transactionId, amount });

    // Generate mock PIX data
    const mockPaymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockPixKey = `00020126330014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2)}5802BR6009Rio Porto62140510${transactionId}6304`;
    
    // Generate QR code from mock data
    const qrCodeBase64 = await this.generateQRCode(mockPixKey);

    return {
      paymentId: mockPaymentId,
      qrCode: mockPixKey,
      qrCodeBase64,
      pixKey: mockPixKey,
      status: 'PENDING',
    };
  }

  private async checkMockPaymentStatus(paymentId: string): Promise<{
    isPaid: boolean;
    status: IPixPayment['status'];
    paidAt?: Date;
  }> {
    console.log('[MOCK] Checking payment status:', paymentId);

    // Simulate payment completion after 30 seconds
    const paymentCreatedTime = parseInt(paymentId.split('_')[1]) || Date.now();
    const elapsedTime = Date.now() - paymentCreatedTime;
    const isPaid = elapsedTime > 30000; // 30 seconds

    return {
      isPaid,
      status: isPaid ? 'COMPLETED' : 'PENDING',
      paidAt: isPaid ? new Date() : undefined,
    };
  }
}

// Export singleton instance
let pixServiceInstance: PixService | null = null;

export const getPixService = (): PixService => {
  if (!pixServiceInstance) {
    pixServiceInstance = new PixService();
  }
  return pixServiceInstance;
};

// Export convenience functions
export const pixService = {
  createPixPayment: async (
    transactionId: string,
    amount: number,
    userEmail?: string,
    userCpf?: string
  ) => getPixService().createPixPayment(transactionId, amount, userEmail, userCpf),
  
  checkPaymentStatus: async (paymentId: string) => 
    getPixService().checkPaymentStatus(paymentId),
  
  generateQRCode: async (pixData: string) => 
    getPixService().generateQRCode(pixData),
  
  handleWebhook: async (webhookData: WebhookNotification) => 
    getPixService().handleWebhook(webhookData),
};

// Utility functions
export const formatBRL = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const validatePixKey = (pixKey: string): boolean => {
  // Basic PIX key validation
  // Email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // CPF/CNPJ pattern (numbers only)
  const documentPattern = /^\d{11}$|^\d{14}$/;
  // Phone pattern
  const phonePattern = /^\+?55\d{10,11}$/;
  // Random key pattern
  const randomKeyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return (
    emailPattern.test(pixKey) ||
    documentPattern.test(pixKey.replace(/\D/g, '')) ||
    phonePattern.test(pixKey.replace(/\D/g, '')) ||
    randomKeyPattern.test(pixKey)
  );
};