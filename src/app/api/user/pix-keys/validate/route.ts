import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';
import { PixValidationService } from '@/services/pix/pix-validation.service';
import { z } from 'zod';

// Schema de validação
const validatePixKeySchema = z.object({
  pixKey: z.string().min(1, 'Chave PIX é obrigatória')
});

// POST /api/user/pix-keys/validate - Validar chave PIX
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    // Validar entrada
    const body = await req.json();
    const validation = validatePixKeySchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse.error(
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }

    const { pixKey } = validation.data;

    // Detectar tipo da chave
    const keyType = PixValidationService.detectKeyType(pixKey);
    if (!keyType) {
      return apiResponse.success({
        valid: false,
        error: 'Formato de chave PIX inválido',
        suggestion: 'Verifique se a chave está correta (CPF, CNPJ, Email, Telefone ou chave aleatória)'
      });
    }

    // Formatar chave
    const formattedKey = PixValidationService.formatPixKey(pixKey, keyType);

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        cpf: true,
        cpfVerified: true
      }
    });

    if (!user?.cpfVerified || !user?.cpf) {
      return apiResponse.success({
        valid: false,
        error: 'CPF não verificado',
        suggestion: 'Verifique seu CPF em Configurações > Verificação de Identidade'
      });
    }

    // Verificar se já está cadastrada para este usuário
    const existingKey = await prisma.userPixKey.findFirst({
      where: {
        pixKey: formattedKey,
        userId: session.user.id,
        isActive: true
      }
    });

    if (existingKey) {
      return apiResponse.success({
        valid: false,
        error: 'Chave PIX já cadastrada',
        suggestion: 'Esta chave já está cadastrada em sua conta'
      });
    }

    // Validar com Mercado Pago
    const pixValidation = await PixValidationService.validateWithMercadoPago(
      formattedKey,
      keyType
    );

    if (!pixValidation.valid) {
      return apiResponse.success({
        valid: false,
        error: pixValidation.error || 'Chave PIX inválida',
        suggestion: 'Verifique se a chave está ativa em seu banco'
      });
    }

    // Verificar titularidade
    const isOwner = PixValidationService.validateOwnership(
      user.cpf,
      pixValidation.accountHolderDocument
    );

    if (!isOwner) {
      return apiResponse.success({
        valid: false,
        error: 'Chave PIX não pertence ao seu CPF',
        suggestion: 'Use apenas chaves PIX registradas em seu nome',
        details: {
          expectedDocument: maskDocument(user.cpf),
          foundDocument: maskDocument(pixValidation.accountHolderDocument)
        }
      });
    }

    // Verificar duplicação com outros usuários
    const isDuplicate = await PixValidationService.checkDuplicateKey(
      formattedKey,
      session.user.id,
      prisma
    );

    if (isDuplicate) {
      return apiResponse.success({
        valid: false,
        error: 'Chave PIX já utilizada',
        suggestion: 'Esta chave já está cadastrada por outro usuário'
      });
    }

    // Tudo OK!
    return apiResponse.success({
      valid: true,
      keyType,
      accountHolderName: pixValidation.accountHolderName,
      bankName: pixValidation.bankName,
      formattedKey: maskPixKey(formattedKey, keyType),
      message: 'Chave PIX válida e pronta para cadastro'
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// Funções auxiliares
function maskDocument(doc: string): string {
  if (doc.length === 11) {
    // CPF: 123.***.***-45
    return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
  } else if (doc.length === 14) {
    // CNPJ: 12.***.***/**-90
    return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.***.***/$4-$5');
  }
  return doc;
}

function maskPixKey(pixKey: string, keyType: string): string {
  switch (keyType) {
    case 'CPF':
      return pixKey.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
    
    case 'CNPJ':
      return pixKey.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.***.***/$4-$5');
    
    case 'EMAIL':
      const [user, domain] = pixKey.split('@');
      const maskedUser = user.charAt(0) + '*'.repeat(Math.max(user.length - 2, 1)) + user.charAt(user.length - 1);
      return `${maskedUser}@${domain}`;
    
    case 'PHONE':
      return pixKey.replace(/(\+\d{2})(\d{2})(\d{5})(\d{4})/, '$1$2*****$4');
    
    case 'EVP':
      return pixKey.substring(0, 8) + '****-****-****-************';
    
    default:
      return pixKey;
  }
}