// Configuração do Pusher
export const PUSHER_CONFIG = {
  // Configuração do servidor
  server: {
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  },
  
  // Configuração do cliente
  client: {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  },

  // Eventos
  events: {
    newMessage: 'new-message',
    typing: 'typing',
    userJoined: 'user-joined',
    userLeft: 'user-left',
  },

  // Canais
  channels: {
    transaction: (id: string) => `private-transaction-${id}`,
  },
}; 