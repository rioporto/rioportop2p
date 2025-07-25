import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { checkAuth } from '@/lib/auth/utils';
import { z } from 'zod';
import { MessageType } from '@prisma/client';
import { triggerPusherEvent } from '@/lib/pusher/server';

// Schema de validação para POST
const createMessageSchema = z.object({
  transactionId: z.string().uuid('ID da transação inválido'),
  content: z.string().min(1, 'Mensagem é obrigatória').max(1000, 'Mensagem muito longa'),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  fileUrl: z.string().url().optional()
});

export async function POST(req: NextRequest) {
  // Verificar autenticação
  const authResult = await checkAuth(req);
  if ('status' in authResult) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const body = await req.json();
    
    // Validar dados
    const validation = createMessageSchema.safeParse(body);
    if (!validation.success) {
      return ApiResponse.badRequest(
        'Dados inválidos',
        'VALIDATION_ERROR',
        validation.error.errors
      );
    }

    const { transactionId, content, type, fileUrl } = validation.data;

    // Verificar se usuário faz parte da transação
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        status: true
      }
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return ApiResponse.forbidden('Você não faz parte desta transação');
    }

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        transactionId,
        senderId: userId,
        content,
        type,
        fileUrl
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Enviar evento via Pusher
    await triggerPusherEvent(
      `private-transaction-${transactionId}`,
      'new-message',
      message
    );

    return ApiResponse.success(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return ApiResponse.internalError('Erro ao enviar mensagem');
  }
}

export async function GET(req: NextRequest) {
  // Verificar autenticação
  const authResult = await checkAuth(req);
  if ('status' in authResult) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return ApiResponse.badRequest('ID da transação é obrigatório');
    }

    // Verificar se usuário faz parte da transação
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true
      }
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return ApiResponse.forbidden('Você não faz parte desta transação');
    }

    // Buscar mensagens
    const messages = await prisma.message.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return ApiResponse.success(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return ApiResponse.internalError('Erro ao buscar mensagens');
  }
}

// Rota para notificar digitação
export async function PUT(req: NextRequest) {
  // Verificar autenticação
  const authResult = await checkAuth(req);
  if ('status' in authResult) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return ApiResponse.badRequest('ID da transação é obrigatório');
    }

    // Verificar se usuário faz parte da transação
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true
      }
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return ApiResponse.forbidden('Você não faz parte desta transação');
    }

    // Enviar evento de digitação via Pusher
    await triggerPusherEvent(
      `private-transaction-${transactionId}`,
      'typing',
      { userId }
    );

    return ApiResponse.success({ message: 'Evento de digitação enviado' });
  } catch (error) {
    console.error('Error sending typing event:', error);
    return ApiResponse.internalError('Erro ao enviar evento de digitação');
  }
}