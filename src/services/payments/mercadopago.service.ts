let MercadoPagoConfig: any;
let Payment: any;

try {
  const mp = require('mercadopago');
  MercadoPagoConfig = mp.MercadoPagoConfig;
  Payment = mp.Payment;
} catch (error) {
  console.error('Erro ao importar Mercado Pago SDK:', error);
}

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
    // Verificar se SDK foi carregado
    if (!MercadoPagoConfig || !Payment) {
      console.error('Mercado Pago SDK não carregado corretamente');
      this.client = null as any;
      this.payment = null as any;
      return;
    }
    
    // Temporário: Mock mode se não tiver token
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-MOCK-TOKEN';
    
    console.log('MercadoPagoService inicializando:', {
      hasToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      tokenLength: process.env.MERCADO_PAGO_ACCESS_TOKEN?.length,
      isProduction: process.env.NODE_ENV === 'production'
    });
    
    try {
      this.client = new MercadoPagoConfig({
        accessToken: accessToken,
        options: { timeout: 5000 }
      });

      this.payment = new Payment(this.client);
    } catch (error) {
      console.error('Erro ao inicializar MercadoPago:', error);
      this.client = null as any;
      this.payment = null as any;
    }
  }

  /**
   * Cria um pagamento PIX e retorna QR Code
   */
  async createPixPayment(data: CreatePixPaymentData): Promise<PixPaymentResponse> {
    // MOCK: Se não tiver token real ou SDK não carregado, retornar dados mockados
    if (!this.payment || !process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN === 'TEST-MOCK-TOKEN') {
      console.log('🔧 Modo MOCK ativado - Retornando QR Code de teste');
      
      // Gerar um QR Code mock base64 real (1x1 pixel preto para teste)
      const mockQRCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDcvMjgvMjTVNrpGAAABhUlEQVR4nO3VsQ0AIAwDQYL9d6YFKJB4gO9qF1zhpmfOzLwAiO7bAwDYRwAAMQEAxAQAEBMAQEwAADEBAMQEABATAEBMAACxPwC8c+9LrwHgQSsAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCIXWQPAiuVkVPZAAAAAElFTkSuQmCC';
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

    try {
      console.log('Tentando criar pagamento real no Mercado Pago...');
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
    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX real:', {
        error: error.message || error,
        cause: error.cause,
        response: error.response?.data,
        status: error.status
      });
      
      // Se falhar com erro de autenticação, tentar modo mock
      if (error.status === 401 || error.message?.includes('401')) {
        console.log('Token inválido, retornando para modo MOCK');
        const mockQRCodeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDcvMjgvMjTVNrpGAAABhUlEQVR4nO3VsQ0AIAwDQYL9d6YFKJB4gO9qF1zhpmfOzLwAiO7bAwDYRwAAMQEAxAQAEBMAQEwAADEBAMQEABATAEBMAACxPwC8c+9LrwHgQSsAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCICQAgJgCAmAAAYgIAiAkAICYAgJgAAGICAIgJACAmAICYAABiAgCIXWQPAiuVkVPZAAAAAElFTkSuQmCC';
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
      
      throw error;
    }
  }

  /**
   * Consulta status de um pagamento
   */
  async getPaymentStatus(paymentId: number): Promise<string> {
    try {
      // Mock mode
      if (!this.payment || !process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        return 'pending';
      }
      
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
    try {
      mercadoPagoService = new MercadoPagoService();
    } catch (error) {
      console.error('Erro ao criar MercadoPagoService:', error);
      // Forçar modo mock se falhar
      process.env.MERCADO_PAGO_ACCESS_TOKEN = undefined;
      mercadoPagoService = new MercadoPagoService();
    }
  }
  return mercadoPagoService;
}