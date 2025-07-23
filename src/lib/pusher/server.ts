import Pusher from 'pusher';

// Cliente Pusher para o servidor
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

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