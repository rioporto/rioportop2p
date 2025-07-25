import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api/response';
import { triggerPusherEvent } from '@/lib/pusher/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, event, data } = body;

    // Enviar evento via Pusher
    await triggerPusherEvent(channel, event, data);

    return ApiResponse.success({
      message: 'Evento enviado com sucesso',
      channel,
      event,
      data
    });
  } catch (error) {
    console.error('Erro ao testar Pusher:', error);
    return ApiResponse.internalError('Erro ao testar Pusher');
  }
} 