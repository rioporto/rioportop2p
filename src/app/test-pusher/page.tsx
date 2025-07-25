'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import pusherClient from '@/lib/pusher/client';

export default function TestPusherPage() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    return () => {
      pusherClient.unsubscribe('test-channel');
      pusherClient.disconnect();
    };
  }, []);

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

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold mb-4">Teste do Pusher</h1>

      {/* Status */}
      <div className="mb-4">
        <p className="text-lg">
          Status:{' '}
          <span
            className={
              status === 'connected'
                ? 'text-green-600'
                : status === 'connecting'
                ? 'text-yellow-600'
                : 'text-red-600'
            }
          >
            {status}
          </span>
        </p>
      </div>

      {/* Botão de teste */}
      <Button
        onClick={handleTestEvent}
        disabled={status !== 'connected'}
        className="mb-4"
      >
        Enviar evento de teste
      </Button>

      {/* Log de mensagens */}
      <div className="bg-gray-100 rounded-lg p-4 h-[400px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2 font-mono text-sm">
            {msg}
          </div>
        ))}
      </div>

      {/* Erro */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 