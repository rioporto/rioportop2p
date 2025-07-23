import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { z } from 'zod';
import { MessageType } from '@prisma/client';

// Schema de validação para POST
const createMessageSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  fileUrl: z.string().url().optional()
});

// Schema de validação para GET
const getMessagesSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID')
});

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return ApiResponse.unauthorized();
    }

    const userId = session.user.id;

    // Validar dados da requisição
    const body = await req.json();
    const validationResult = createMessageSchema.safeParse(body);
    
    if (!validationResult.success) {
      return ApiResponse.badRequest(
        'Invalid request data',
        'VALIDATION_ERROR',
        validationResult.error.errors
      );
    }

    const { transactionId, content, type, fileUrl } = validationResult.data;

    // Verificar se user é parte da transação (buyer ou seller)
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
      return ApiResponse.notFound('Transaction not found');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return ApiResponse.forbidden('You are not part of this transaction');
    }

    // Verificar se a transação está em um status que permite mensagens
    const allowedStatuses = ['PENDING', 'AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'RELEASING_CRYPTO', 'DISPUTED'];
    if (!allowedStatuses.includes(transaction.status)) {
      return ApiResponse.badRequest('Cannot send messages for this transaction status');
    }

    // Buscar ou criar conversation para a transação
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

    // Criar message e atualizar lastMessageAt em uma transação
    const [message] = await prisma.$transaction([
      prisma.message.create({
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
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() }
      })
    ]);

    // Retornar mensagem criada
    return ApiResponse.created({
      id: message.id,
      conversationId: message.conversationId,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`
      },
      content: message.content,
      type: message.type,
      fileUrl: message.fileUrl,
      isRead: message.isRead,
      createdAt: message.createdAt
    });

  } catch (error) {
    console.error('Error creating message:', error);
    return ApiResponse.fromError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return ApiResponse.unauthorized();
    }

    const userId = session.user.id;

    // Receber transactionId como query param
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transactionId');

    // Validar parâmetros
    const validationResult = getMessagesSchema.safeParse({ transactionId });
    
    if (!validationResult.success) {
      return ApiResponse.badRequest(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        validationResult.error.errors
      );
    }

    // Verificar se user é parte da transação
    const transaction = await prisma.transaction.findUnique({
      where: { id: validationResult.data.transactionId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        status: true
      }
    });

    if (!transaction) {
      return ApiResponse.notFound('Transaction not found');
    }

    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return ApiResponse.forbidden('You are not part of this transaction');
    }

    // Buscar conversation e suas messages
    const conversation = await prisma.conversation.findUnique({
      where: { transactionId: validationResult.data.transactionId },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      // Retornar array vazio se não houver conversa ainda
      return ApiResponse.success({
        messages: [],
        transaction: {
          id: transaction.id,
          status: transaction.status
        }
      });
    }

    // Marcar como lidas se senderId != userId
    const unreadMessageIds = conversation.messages
      .filter(msg => msg.senderId !== userId && !msg.isRead)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: unreadMessageIds }
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    }

    // Formatar mensagens para resposta
    const formattedMessages = conversation.messages.map(message => ({
      id: message.id,
      conversationId: message.conversationId,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        isMe: message.sender.id === userId
      },
      content: message.content,
      type: message.type,
      fileUrl: message.fileUrl,
      isRead: message.isRead || message.senderId === userId, // Próprias mensagens sempre são "lidas"
      readAt: message.readAt,
      createdAt: message.createdAt
    }));

    return ApiResponse.success({
      messages: formattedMessages,
      transaction: {
        id: transaction.id,
        status: transaction.status
      },
      conversation: {
        id: conversation.id,
        lastMessageAt: conversation.lastMessageAt
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return ApiResponse.fromError(error);
  }
}