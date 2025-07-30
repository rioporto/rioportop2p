import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';
import { PixValidationService } from '@/services/pix/pix-validation.service';
import { z } from 'zod';

// Schema de validação
const createPixKeySchema = z.object({
  pixKey: z.string().min(1, 'Chave PIX é obrigatória'),
  setAsDefault: z.boolean().optional()
});

// GET /api/user/pix-keys - Listar chaves PIX do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const pixKeys = await prisma.userPixKey.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        id: true,
        pixKey: true,
        keyType: true,
        accountHolderName: true,
        accountHolderDoc: true,
        bankName: true,
        bankCode: true,
        isDefault: true,
        isActive: true,
        verifiedAt: true,
        lastUsedAt: true,
        createdAt: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Mascarar chaves PIX para segurança
    const maskedKeys = pixKeys.map(key => ({
      ...key,
      pixKey: maskPixKey(key.pixKey, key.keyType)
    }));

    return apiResponse.success({
      pixKeys: maskedKeys,
      count: maskedKeys.length
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/user/pix-keys - Adicionar nova chave PIX
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    // Validar entrada
    const body = await req.json();
    const validation = createPixKeySchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse.error(
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }

    const { pixKey, setAsDefault } = validation.data;

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        cpf: true,
        cpfVerified: true,
        kycLevel: true
      }
    });

    if (!user) {
      return apiResponse.error('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    // Verificar KYC
    if (!user.cpfVerified || !user.cpf) {
      return apiResponse.error(
        'KYC_REQUIRED',
        'É necessário verificar seu CPF antes de cadastrar chaves PIX',
        403
      );
    }

    // Detectar tipo da chave
    const keyType = PixValidationService.detectKeyType(pixKey);
    if (!keyType) {
      return apiResponse.error(
        'INVALID_PIX_KEY',
        'Formato de chave PIX inválido',
        400
      );
    }

    // Formatar chave
    const formattedKey = PixValidationService.formatPixKey(pixKey, keyType);

    // Verificar se já existe
    const existingKey = await prisma.userPixKey.findFirst({
      where: {
        pixKey: formattedKey,
        userId: session.user.id
      }
    });

    if (existingKey) {
      return apiResponse.error(
        'DUPLICATE_KEY',
        'Esta chave PIX já está cadastrada',
        409
      );
    }

    // Validar com Mercado Pago
    const pixValidation = await PixValidationService.validateWithMercadoPago(
      formattedKey,
      keyType
    );

    if (!pixValidation.valid) {
      return apiResponse.error(
        'INVALID_PIX_KEY',
        pixValidation.error || 'Chave PIX inválida',
        400
      );
    }

    // Verificar titularidade
    const isOwner = PixValidationService.validateOwnership(
      user.cpf,
      pixValidation.accountHolderDocument
    );

    if (!isOwner) {
      return apiResponse.error(
        'PIX_NOT_OWNED',
        'Esta chave PIX não está registrada em seu CPF',
        403
      );
    }

    // Verificar duplicação com outros usuários
    const isDuplicate = await PixValidationService.checkDuplicateKey(
      formattedKey,
      session.user.id,
      prisma
    );

    if (isDuplicate) {
      return apiResponse.error(
        'PIX_ALREADY_USED',
        'Esta chave PIX já está cadastrada por outro usuário',
        409
      );
    }

    // Criar transação para salvar a chave
    const result = await prisma.$transaction(async (tx) => {
      // Se for definir como padrão, remover flag das outras
      if (setAsDefault) {
        await tx.userPixKey.updateMany({
          where: {
            userId: session.user.id,
            isDefault: true
          },
          data: {
            isDefault: false
          }
        });
      }

      // Criar nova chave
      const newKey = await tx.userPixKey.create({
        data: {
          userId: session.user.id,
          pixKey: formattedKey,
          keyType,
          accountHolderName: pixValidation.accountHolderName,
          accountHolderDoc: pixValidation.accountHolderDocument,
          bankName: pixValidation.bankName,
          bankCode: pixValidation.bankCode,
          isDefault: setAsDefault || false,
          verifiedAt: new Date()
        }
      });

      // Log de auditoria
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'PIX_KEY_ADDED',
          entityType: 'USER_PIX_KEY',
          entityId: newKey.id,
          metadata: {
            keyType,
            bankName: validation.bankName,
            maskedKey: maskPixKey(formattedKey, keyType)
          }
        }
      });

      return newKey;
    });

    return apiResponse.success({
      message: 'Chave PIX cadastrada com sucesso',
      pixKey: {
        id: result.id,
        pixKey: maskPixKey(result.pixKey, result.keyType),
        keyType: result.keyType,
        accountHolderName: result.accountHolderName,
        bankName: result.bankName,
        isDefault: result.isDefault
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// Função auxiliar para mascarar chave PIX
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