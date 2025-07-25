import Pusher from 'pusher';
import { PUSHER_CONFIG } from '@/config/pusher';

// Cliente Pusher para o servidor
export const pusherServer = new Pusher(PUSHER_CONFIG.server);

// Função helper para enviar eventos
export const triggerPusherEvent = async (
  channel: string,
  event: string,
  data: any
) => {
  try {
    await pusherServer.trigger(channel, event, data);
  } catch (error) {
    console.error('Erro ao enviar evento Pusher:', error);
    throw error;
  }
};

// Função para autenticar canais privados
export const authenticateUser = (
  socketId: string,
  channel: string,
  userId?: string
) => {
  return pusherServer.authorizeChannel(socketId, channel, {
    user_id: userId,
    user_info: {
      id: userId,
    },
  });
};

export default pusherServer;