import { MercadoPagoConfig, Payment } from 'mercadopago';

interface CreatePixPaymentData {
  tradeId: string;
  amount: number;
  buyerEmail: string;
  buyerName: string;
  description: string;
}

interface PixPaymentResponse {
  id: number;
  qrCode: string;
  qrCodeBase64: string;
  copyPaste: string;
  status: string;
  expirationDate: string;
}

export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private payment: Payment;

  constructor() {
    // Temporário: Mock mode se não tiver token
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-MOCK-TOKEN';
    
    this.client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: { timeout: 5000 }
    });

    this.payment = new Payment(this.client);
  }

  /**
   * Cria um pagamento PIX e retorna QR Code
   */
  async createPixPayment(data: CreatePixPaymentData): Promise<PixPaymentResponse> {
    try {
      // MOCK: Se não tiver token real, retornar dados mockados
      if (process.env.MERCADO_PAGO_ACCESS_TOKEN === undefined) {
        console.log('🔧 Modo MOCK ativado - Retornando QR Code de teste');
        
        // Gerar um QR Code mock base64 simples
        const mockQRCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        const mockPixKey = `00020126330014BR.GOV.BCB.PIX0114${Date.now()}5204000053039865802BR5913RIO PORTO P2P6009SAO PAULO62070503***63041234`;
        
        return {
          id: Date.now(),
          qrCode: mockPixKey,
          qrCodeBase64: mockQRCodeBase64,
          copyPaste: mockPixKey,
          status: 'pending',
          expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };
      }

      const payment = await this.payment.create({
        body: {
          transaction_amount: data.amount,
          description: data.description,
          payment_method_id: 'pix',
          payer: {
            email: data.buyerEmail,
            first_name: data.buyerName.split(' ')[0],
            last_name: data.buyerName.split(' ').slice(1).join(' ') || '',
          },
          // Metadata para rastrear no webhook
          metadata: {
            trade_id: data.tradeId,
            type: 'p2p_trade'
          },
          // PIX expira em 30 minutos
          date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          // URL de notificação (webhook)
          notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`
        }
      });

      if (!payment.point_of_interaction?.transaction_data) {
        throw new Error('Resposta do Mercado Pago inválida');
      }

      const pixData = payment.point_of_interaction.transaction_data;

      return {
        id: payment.id!,
        qrCode: pixData.qr_code!,
        qrCodeBase64: pixData.qr_code_base64!,
        copyPaste: pixData.qr_code!,
        status: payment.status!,
        expirationDate: payment.date_of_expiration!
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }

  /**
   * Consulta status de um pagamento
   */
  async getPaymentStatus(paymentId: number): Promise<string> {
    try {
      const payment = await this.payment.get({ id: paymentId });
      return payment.status || 'unknown';
    } catch (error) {
      console.error('Erro ao consultar pagamento:', error);
      throw error;
    }
  }

  /**
   * Cancela um pagamento pendente
   */
  async cancelPayment(paymentId: number): Promise<boolean> {
    try {
      const payment = await this.payment.cancel({ 
        id: paymentId,
        requestOptions: { idempotencyKey: `cancel-${paymentId}` }
      });
      return payment.status === 'cancelled';
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      return false;
    }
  }

  /**
   * Valida assinatura do webhook
   */
  validateWebhookSignature(
    signature: string | null,
    requestId: string | null,
    dataId: string
  ): boolean {
    // TODO: Implementar validação de assinatura quando MP disponibilizar
    // Por enquanto, validamos apenas se os headers existem
    return !!(signature && requestId);
  }
}

// Singleton
let mercadoPagoService: MercadoPagoService | null = null;

export function getMercadoPagoService(): MercadoPagoService {
  if (!mercadoPagoService) {
    mercadoPagoService = new MercadoPagoService();
  }
  return mercadoPagoService;
}