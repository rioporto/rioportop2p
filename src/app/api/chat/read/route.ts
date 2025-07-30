import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/errors';
import { z } from 'zod';
import Pusher from 'pusher';
import { PUSHER_CONFIG } from '@/config/pusher';

// Inicializar Pusher server-side
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

const readSchema = z.object({
  transactionId: z.string().uuid(),
  messageId: z.string().uuid()
});

// POST /api/chat/read - Marcar mensagem como lida
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const body = await req.json();
    const validation = readSchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse.error(
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }

    const { transactionId, messageId } = validation.data;

    // Verificar se a mensagem existe e o usuário tem acesso
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId: transactionId,
        senderId: {
          not: session.user.id // Só pode marcar como lida mensagens dos outros
        }
      },
      include: {
        conversation: {
          include: {
            transaction: {
              select: {
                buyerId: true,
                sellerId: true
              }
            }
          }
        }
      }
    });

    if (!message) {
      return apiResponse.error(
        'MESSAGE_NOT_FOUND',
        'Mensagem não encontrada',
        404
      );
    }

    // Verificar se o usuário é parte da transação
    const transaction = message.conversation.transaction;
    if (transaction.buyerId !== session.user.id && transaction.sellerId !== session.user.id) {
      return apiResponse.error(
        'FORBIDDEN',
        'Sem permissão para acessar esta mensagem',
        403
      );
    }

    // Atualizar status de leitura
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    // Enviar evento via Pusher
    const channelName = PUSHER_CONFIG.channels.transaction(transactionId);
    await pusher.trigger(channelName, 'message-read', {
      messageId,
      userId: session.user.id,
      timestamp: new Date().toISOString()
    });

    return apiResponse.success({
      message: 'Mensagem marcada como lida'
    });

  } catch (error) {
    return handleApiError(error);
  }
}