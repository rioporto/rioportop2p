'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import pusherClient from '@/lib/pusher/client';
import { Send, User, MessageSquare, Activity, Wifi, WifiOff } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'system';
}

export default function TestPusherPage() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Gerar ID único para o usuário
    setUserId(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    setUserName(`Usuário ${Math.floor(Math.random() * 1000)}`);

    // Conectar ao Pusher
    pusherClient.connect();

    // Monitorar estado da conexão
    pusherClient.connection.bind('connected', () => {
      setStatus('connected');
      setMessages(prev => [...prev, '✅ Conectado ao Pusher']);
    });

    pusherClient.connection.bind('connecting', () => {
      setStatus('connecting');
      setMessages(prev => [...prev, '🔄 Conectando ao Pusher...']);
    });

    pusherClient.connection.bind('disconnected', () => {
      setStatus('disconnected');
      setMessages(prev => [...prev, '❌ Desconectado do Pusher']);
    });

    pusherClient.connection.bind('error', (err: any) => {
      setError(err.message || 'Erro na conexão');
      setMessages(prev => [...prev, `❌ Erro: ${err.message || 'Erro na conexão'}`]);
    });

    // Inscrever em canal de teste
    const channel = pusherClient.subscribe('test-channel');
    
    channel.bind('test-event', (data: any) => {
      setMessages(prev => [...prev, `📩 Evento recebido: ${JSON.stringify(data)}`]);
    });

    // Canal de chat
    const chatChannel = pusherClient.subscribe('chat-test');
    
    chatChannel.bind('new-message', (data: ChatMessage) => {
      setChatMessages(prev => [...prev, data]);
    });

    chatChannel.bind('user-typing', (data: { userId: string; userName: string }) => {
      setIsTyping(prev => {
        if (!prev.includes(data.userName)) {
          return [...prev, data.userName];
        }
        return prev;
      });
      
      // Remover após 3 segundos
      setTimeout(() => {
        setIsTyping(prev => prev.filter(name => name !== data.userName));
      }, 3000);
    });

    return () => {
      pusherClient.unsubscribe('test-channel');
      pusherClient.unsubscribe('chat-test');
      pusherClient.disconnect();
    };
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleTestEvent = async () => {
    try {
      const response = await fetch('/api/test-pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'test-channel',
          event: 'test-event',
          data: {
            message: 'Teste do Pusher',
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar evento de teste');
      }

      setMessages(prev => [...prev, '📤 Evento de teste enviado']);
    } catch (err) {
      setError((err as Error).message);
      setMessages(prev => [...prev, `❌ Erro ao enviar evento: ${(err as Error).message}`]);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId,
      userName,
      message: messageInput,
      timestamp: new Date(),
      type: 'user'
    };

    try {
      const response = await fetch('/api/test-pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'chat-test',
          event: 'new-message',
          data: newMessage
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      setMessageInput('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleTyping = async () => {
    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      await fetch('/api/test-pusher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'chat-test',
          event: 'user-typing',
          data: { userId, userName }
        }),
      });
    } catch (err) {
      console.error('Erro ao enviar typing:', err);
    }

    // Parar de mostrar "digitando" após 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      // Poderia enviar um evento de "parou de digitar" aqui
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Teste do Pusher - Chat Real-time
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Status e Logs */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status e Logs
            </h2>

            {/* Status de Conexão */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Conexão Pusher:</span>
                <div className="flex items-center gap-2">
                  {status === 'connected' ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={
                      status === 'connected'
                        ? 'text-green-600 font-medium'
                        : status === 'connecting'
                        ? 'text-yellow-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {status === 'connected' ? 'Conectado' : status === 'connecting' ? 'Conectando...' : 'Desconectado'}
                  </span>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                <p>Usuário: <span className="font-medium">{userName}</span></p>
                <p>ID: <span className="font-mono text-xs">{userId}</span></p>
              </div>
            </div>

            {/* Botão de teste */}
            <Button
              onClick={handleTestEvent}
              disabled={status !== 'connected'}
              variant="elevated"
              className="w-full mb-4"
            >
              Enviar Evento de Teste
            </Button>

            {/* Log de eventos */}
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-[300px] overflow-y-auto font-mono text-xs">
              {messages.map((msg, i) => (
                <div key={i} className="mb-1">
                  {msg}
                </div>
              ))}
            </div>

            {/* Erro */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </Card>

          {/* Chat em Tempo Real */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat em Tempo Real
            </h2>

            {/* Área de mensagens */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 h-[400px] overflow-y-auto mb-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-sm mt-2">Envie uma mensagem para começar!</p>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-3 ${msg.userId === userId ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                          msg.userId === userId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {msg.userName}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.userId === userId ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              )}
              
              {/* Indicador de digitando */}
              {isTyping.length > 0 && (
                <div className="text-sm text-gray-500 italic">
                  {isTyping.join(', ')} está digitando...
                </div>
              )}
            </div>

            {/* Input de mensagem */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder="Digite sua mensagem..."
                disabled={status !== 'connected'}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={handleSendMessage}
                disabled={status !== 'connected' || !messageInput.trim()}
                variant="gradient"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Abra esta página em várias abas para simular múltiplos usuários
            </p>
          </Card>
        </div>

        {/* Instruções */}
        <Card className="p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-3">
            Como Configurar Pusher:
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. Acesse https://pusher.com e crie uma conta</li>
            <li>2. Crie um novo app (Channels)</li>
            <li>3. Copie as credenciais (App ID, Key, Secret, Cluster)</li>
            <li>4. Adicione no Railway:</li>
          </ol>
          <div className="mt-3 p-3 bg-gray-100 rounded-lg font-mono text-xs">
            <div>NEXT_PUBLIC_PUSHER_APP_KEY=xxx</div>
            <div>PUSHER_APP_ID=xxx</div>
            <div>PUSHER_SECRET=xxx</div>
            <div>NEXT_PUBLIC_PUSHER_CLUSTER=xxx</div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> O Pusher oferece 200k mensagens/dia e 100 conexões
              simultâneas no plano gratuito.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
} 