import PusherClient from 'pusher-js';
import { PUSHER_CONFIG } from '@/config/pusher';

// Cliente Pusher para o frontend
const pusherClient = new PusherClient(
  PUSHER_CONFIG.client.key,
  {
    cluster: PUSHER_CONFIG.client.cluster,
    authEndpoint: PUSHER_CONFIG.client.authEndpoint,
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