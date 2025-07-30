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

const typingSchema = z.object({
  transactionId: z.string().uuid(),
  isTyping: z.boolean()
});

// POST /api/chat/typing - Enviar evento de digitação
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const body = await req.json();
    const validation = typingSchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse.error(
        'VALIDATION_ERROR',
        validation.error.errors[0].message,
        400
      );
    }

    const { transactionId, isTyping } = validation.data;

    // Verificar se o usuário tem acesso à transação
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        OR: [
          { buyerId: session.user.id },
          { sellerId: session.user.id }
        ]
      },
      select: {
        buyerId: true,
        sellerId: true
      }
    });

    if (!transaction) {
      return apiResponse.error(
        'TRANSACTION_NOT_FOUND',
        'Transação não encontrada',
        404
      );
    }

    // Enviar evento via Pusher
    const channelName = PUSHER_CONFIG.channels.transaction(transactionId);
    const eventName = isTyping ? PUSHER_CONFIG.events.typing : 'stop-typing';
    
    await pusher.trigger(channelName, eventName, {
      userId: session.user.id,
      userName: session.user.name || 'Usuário',
      timestamp: new Date().toISOString()
    });

    return apiResponse.success({
      message: 'Evento de digitação enviado'
    });

  } catch (error) {
    return handleApiError(error);
  }
}