import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';

interface IRouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/user/pix-keys/[id] - Atualizar chave PIX
export async function PATCH(req: NextRequest, props: IRouteParams) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const { setAsDefault } = await req.json();

    // Verificar se a chave pertence ao usuário
    const pixKey = await prisma.userPixKey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isActive: true
      }
    });

    if (!pixKey) {
      return apiResponse.error('PIX_KEY_NOT_FOUND', 'Chave PIX não encontrada', 404);
    }

    // Atualizar chave como padrão
    if (setAsDefault) {
      await prisma.$transaction(async (tx) => {
        // Remover flag padrão das outras
        await tx.userPixKey.updateMany({
          where: {
            userId: session.user.id,
            isDefault: true,
            id: { not: params.id }
          },
          data: {
            isDefault: false
          }
        });

        // Definir esta como padrão
        await tx.userPixKey.update({
          where: { id: params.id },
          data: {
            isDefault: true,
            lastUsedAt: new Date()
          }
        });

        // Log de auditoria
        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'PIX_KEY_SET_DEFAULT',
            entityType: 'USER_PIX_KEY',
            entityId: params.id,
            metadata: {
              keyType: pixKey.keyType
            }
          }
        });
      });
    }

    return apiResponse.success({
      message: 'Chave PIX atualizada com sucesso'
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/user/pix-keys/[id] - Desativar chave PIX
export async function DELETE(req: NextRequest, props: IRouteParams) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    // Verificar se a chave pertence ao usuário
    const pixKey = await prisma.userPixKey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
        isActive: true
      }
    });

    if (!pixKey) {
      return apiResponse.error('PIX_KEY_NOT_FOUND', 'Chave PIX não encontrada', 404);
    }

    // Verificar se é a única chave ativa
    const activeKeysCount = await prisma.userPixKey.count({
      where: {
        userId: session.user.id,
        isActive: true
      }
    });

    if (activeKeysCount === 1) {
      return apiResponse.error(
        'LAST_PIX_KEY',
        'Você precisa manter pelo menos uma chave PIX ativa',
        400
      );
    }

    // Verificar se há transações pendentes usando esta chave
    const pendingTrades = await prisma.p2PTrade.count({
      where: {
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id }
        ],
        status: {
          in: ['PENDING', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED']
        }
      }
    });

    if (pendingTrades > 0) {
      return apiResponse.error(
        'PENDING_TRADES',
        'Não é possível remover esta chave PIX enquanto houver transações pendentes',
        409
      );
    }

    // Desativar a chave (soft delete)
    await prisma.$transaction(async (tx) => {
      await tx.userPixKey.update({
        where: { id: params.id },
        data: {
          isActive: false,
          isDefault: false,
          deactivatedAt: new Date()
        }
      });

      // Se era a padrão, definir outra como padrão
      if (pixKey.isDefault) {
        const nextDefault = await tx.userPixKey.findFirst({
          where: {
            userId: session.user.id,
            isActive: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (nextDefault) {
          await tx.userPixKey.update({
            where: { id: nextDefault.id },
            data: { isDefault: true }
          });
        }
      }

      // Log de auditoria
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'PIX_KEY_REMOVED',
          entityType: 'USER_PIX_KEY',
          entityId: params.id,
          metadata: {
            keyType: pixKey.keyType,
            wasDefault: pixKey.isDefault
          }
        }
      });
    });

    return apiResponse.success({
      message: 'Chave PIX removida com sucesso'
    });

  } catch (error) {
    return handleApiError(error);
  }
}