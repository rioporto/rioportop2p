import { PixKeyType } from '@prisma/client';

export interface PixKeyValidationResult {
  valid: boolean;
  keyType: PixKeyType;
  accountHolderName: string;
  accountHolderDocument: string;
  bankName: string;
  bankCode?: string;
  error?: string;
}

export class PixValidationService {
  /**
   * Detecta o tipo de chave PIX baseado no formato
   */
  static detectKeyType(pixKey: string): PixKeyType | null {
    const cleaned = pixKey.replace(/[^a-zA-Z0-9@.\-]/g, '');
    
    // CPF: 11 dígitos
    if (/^\d{11}$/.test(cleaned)) {
      return PixKeyType.CPF;
    }
    
    // CNPJ: 14 dígitos
    if (/^\d{14}$/.test(cleaned)) {
      return PixKeyType.CNPJ;
    }
    
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      return PixKeyType.EMAIL;
    }
    
    // Telefone: +55 + 2 dígitos área + 8 ou 9 dígitos
    if (/^\+?55?\d{10,11}$/.test(cleaned)) {
      return PixKeyType.PHONE;
    }
    
    // EVP (chave aleatória): UUID v4
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleaned)) {
      return PixKeyType.EVP;
    }
    
    return null;
  }

  /**
   * Formata a chave PIX para o padrão correto
   */
  static formatPixKey(pixKey: string, keyType: PixKeyType): string {
    const cleaned = pixKey.replace(/[^a-zA-Z0-9@.\-]/g, '');
    
    switch (keyType) {
      case PixKeyType.CPF:
        // Formato: 12345678901
        return cleaned;
        
      case PixKeyType.CNPJ:
        // Formato: 12345678901234
        return cleaned;
        
      case PixKeyType.EMAIL:
        // Formato: email@example.com (lowercase)
        return cleaned.toLowerCase();
        
      case PixKeyType.PHONE:
        // Formato: +5511999999999
        let phone = cleaned.replace(/^\+?55?/, '');
        return `+55${phone}`;
        
      case PixKeyType.EVP:
        // Formato: uuid (lowercase)
        return cleaned.toLowerCase();
        
      default:
        return cleaned;
    }
  }

  /**
   * Valida chave PIX com Mercado Pago
   */
  static async validateWithMercadoPago(
    pixKey: string,
    keyType: PixKeyType
  ): Promise<PixKeyValidationResult> {
    try {
      if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        throw new Error('Mercado Pago não configurado');
      }

      const formattedKey = this.formatPixKey(pixKey, keyType);
      
      console.log('Validando chave PIX:', {
        original: pixKey,
        formatted: formattedKey,
        type: keyType
      });

      // NOTA: A API do Mercado Pago para validar chaves PIX pode não estar
      // disponível publicamente. Vamos implementar uma validação simulada
      // e preparar para quando a API estiver disponível.
      
      // Por enquanto, vamos validar o formato e retornar dados mockados
      // Em produção real, você precisará:
      // 1. Usar a API de validação do Mercado Pago (se disponível)
      // 2. Ou integrar com outro provedor que ofereça esse serviço
      // 3. Ou implementar via Open Banking quando disponível
      
      // Simulação de validação (REMOVER EM PRODUÇÃO)
      if (keyType === null) {
        return {
          valid: false,
          keyType: PixKeyType.CPF,
          accountHolderName: '',
          accountHolderDocument: '',
          bankName: '',
          error: 'Formato de chave PIX inválido'
        };
      }

      // Em produção, fazer chamada real para API
      // const response = await fetch('https://api.mercadopago.com/v1/pix/keys/validate', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     key: formattedKey,
      //     key_type: keyType.toLowerCase()
      //   })
      // });

      // Simulação de resposta (REMOVER EM PRODUÇÃO)
      const mockResponses: Record<string, PixKeyValidationResult> = {
        '12345678901': {
          valid: true,
          keyType: PixKeyType.CPF,
          accountHolderName: 'USUARIO TESTE',
          accountHolderDocument: '12345678901',
          bankName: 'Banco do Brasil',
          bankCode: '001'
        },
        'teste@example.com': {
          valid: true,
          keyType: PixKeyType.EMAIL,
          accountHolderName: 'USUARIO TESTE',
          accountHolderDocument: '12345678901',
          bankName: 'Nubank',
          bankCode: '260'
        }
      };

      const mockResponse = mockResponses[formattedKey] || {
        valid: true,
        keyType,
        accountHolderName: 'NOME DO TITULAR',
        accountHolderDocument: '00000000000',
        bankName: 'Banco Exemplo',
        bankCode: '999'
      };

      return mockResponse;

    } catch (error: any) {
      console.error('Erro ao validar chave PIX:', error);
      return {
        valid: false,
        keyType: keyType || PixKeyType.CPF,
        accountHolderName: '',
        accountHolderDocument: '',
        bankName: '',
        error: error.message || 'Erro ao validar chave PIX'
      };
    }
  }

  /**
   * Valida se o CPF/CNPJ da chave PIX corresponde ao do usuário
   */
  static validateOwnership(
    userDocument: string,
    pixKeyDocument: string
  ): boolean {
    // Remove caracteres não numéricos
    const cleanUserDoc = userDocument.replace(/[^\d]/g, '');
    const cleanPixDoc = pixKeyDocument.replace(/[^\d]/g, '');
    
    return cleanUserDoc === cleanPixDoc;
  }

  /**
   * Verifica se uma chave PIX já está cadastrada para outro usuário
   */
  static async checkDuplicateKey(
    pixKey: string,
    currentUserId: string,
    prisma: any
  ): Promise<boolean> {
    const existing = await prisma.userPixKey.findFirst({
      where: {
        pixKey,
        userId: {
          not: currentUserId
        },
        isActive: true
      }
    });
    
    return !!existing;
  }
}