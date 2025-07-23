import PusherClient from 'pusher-js';

// Cliente Pusher para o frontend
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
    auth: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  }
);

// Configuração de debug em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  PusherClient.logToConsole = true;
}

export default pusherClient;