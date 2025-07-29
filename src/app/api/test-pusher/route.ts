import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import pusherServer from '@/lib/pusher/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, event, data } = body;

    if (!channel || !event) {
      return apiResponse.error('VALIDATION_ERROR', 'Channel e event são obrigatórios', 400);
    }

    console.log('=== Teste Pusher ===');
    console.log('Channel:', channel);
    console.log('Event:', event);
    console.log('Data:', data);
    console.log('Has Pusher credentials:', !!process.env.PUSHER_SECRET);

    // Enviar evento via Pusher
    await pusherServer.trigger(channel, event, data || {});

    return apiResponse.success({
      message: 'Evento enviado com sucesso',
      channel,
      event,
      data: data || {},
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao enviar evento Pusher:', error);
    return handleApiError(error);
  }
}

// Endpoint de diagnóstico
export async function GET() {
  try {
    // Verificar configuração
    const config = {
      hasPusherAppId: !!process.env.PUSHER_APP_ID,
      hasPusherKey: !!process.env.PUSHER_KEY,
      hasPusherSecret: !!process.env.PUSHER_SECRET,
      hasPusherCluster: !!process.env.PUSHER_CLUSTER,
      hasPublicKey: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
      hasPublicCluster: !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      cluster: process.env.PUSHER_CLUSTER || 'não configurado',
      publicKey: process.env.NEXT_PUBLIC_PUSHER_KEY ? 
        process.env.NEXT_PUBLIC_PUSHER_KEY.substring(0, 10) + '...' : 
        'não configurado'
    };

    // Testar conexão básica
    let connectionStatus = 'unknown';
    try {
      // Tentar enviar um evento de teste
      await pusherServer.trigger('test-connection', 'ping', { 
        timestamp: new Date().toISOString() 
      });
      connectionStatus = 'connected';
    } catch (error) {
      connectionStatus = 'error';
      console.error('Erro ao testar conexão Pusher:', error);
    }

    return apiResponse.success({
      status: 'Pusher Test Endpoint',
      configuration: config,
      connectionStatus,
      instructions: {
        test: 'Use POST para enviar eventos de teste',
        example: {
          channel: 'test-channel',
          event: 'test-event',
          data: { message: 'Hello Pusher!' }
        }
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}