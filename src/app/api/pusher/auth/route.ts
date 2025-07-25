import { NextRequest } from 'next/server';
import { checkAuth } from '@/lib/auth/utils';
import { ApiResponse } from '@/lib/api/response';
import { authenticateUser } from '@/lib/pusher/server';

export async function POST(req: NextRequest) {
  // Verificar autenticação
  const authResult = await checkAuth(req);
  if ('status' in authResult) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const body = await req.json();
    const { socket_id, channel_name } = body;

    // Verificar se é um canal privado
    if (!channel_name.startsWith('private-')) {
      return ApiResponse.badRequest('Canal inválido');
    }

    // Extrair ID da transação do nome do canal
    const transactionId = channel_name.replace('private-transaction-', '');

    // Verificar se o usuário tem acesso à transação
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

    // Autenticar usuário no canal
    const authResponse = authenticateUser(socket_id, channel_name, userId);

    return new Response(JSON.stringify(authResponse), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error authenticating Pusher:', error);
    return ApiResponse.internalError('Erro ao autenticar Pusher');
  }
} 