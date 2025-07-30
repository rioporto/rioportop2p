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
        status: true,
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!transaction) {
      return ApiResponse.notFound('Transação não encontrada');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return ApiResponse.forbidden('Você não faz parte desta transação');
    }

    // Buscar ou criar conversation
    let conversation = await prisma.conversation.findUnique({
      where: { transactionId }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          transactionId,
          lastMessageAt: new Date()
        }
      });
    }

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
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

    // Atualizar lastMessageAt da conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    });

    // Formatar mensagem para o Pusher
    const pusherMessage = {
      id: message.id,
      transactionId,
      senderId: message.senderId,
      senderName: `${message.sender.firstName} ${message.sender.lastName}`,
      content: message.content,
      timestamp: message.createdAt,
      type: message.type.toLowerCase(),
      fileUrl: message.fileUrl
    };

    // Enviar evento via Pusher
    await triggerPusherEvent(
      `private-transaction-${transactionId}`,
      'new-message',
      pusherMessage
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

    // Buscar conversation
    const conversation = await prisma.conversation.findUnique({
      where: { transactionId },
      include: {
        messages: {
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
        }
      }
    });

    if (!conversation) {
      // Se não há conversation, não há mensagens
      return ApiResponse.success({ messages: [] });
    }

    // Formatar mensagens para resposta
    const formattedMessages = conversation.messages.map(msg => ({
      id: msg.id,
      transactionId,
      senderId: msg.senderId,
      senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
      content: msg.content,
      type: msg.type,
      fileUrl: msg.fileUrl,
      isRead: msg.isRead,
      readAt: msg.readAt,
      createdAt: msg.createdAt
    }));

    return ApiResponse.success({ messages: formattedMessages });
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