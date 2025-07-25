'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { captureError, captureMessage } from '@/lib/monitoring/sentry';

export default function TestSentryPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testErrorCapture = () => {
    try {
      addResult('Gerando erro de teste...');
      throw new Error('Erro de teste do Sentry - Isso é intencional!');
    } catch (error) {
      captureError(error as Error, {
        context: 'test-sentry-page',
        userId: 'test-user-123',
        extra: {
          testType: 'manual',
          timestamp: new Date().toISOString(),
        }
      });
      addResult('✅ Erro capturado e enviado ao Sentry');
    }
  };

  const testMessage = () => {
    addResult('Enviando mensagem de teste...');
    captureMessage('Mensagem de teste do Sentry', 'info', {
      tags: { feature: 'test' },
      extra: { source: 'test-page' }
    });
    addResult('✅ Mensagem enviada ao Sentry');
  };

  const testUnhandledError = () => {
    addResult('Gerando erro não tratado em 2 segundos...');
    setTimeout(() => {
      // Este erro será capturado globalmente pelo Sentry
      throw new Error('Erro não tratado - Teste do Sentry!');
    }, 2000);
  };

  const testAsyncError = async () => {
    addResult('Gerando erro assíncrono...');
    try {
      await Promise.reject(new Error('Erro assíncrono de teste'));
    } catch (error) {
      captureError(error as Error, {
        context: 'async-test',
        level: 'warning'
      });
      addResult('✅ Erro assíncrono capturado');
    }
  };

  const testTypeError = () => {
    addResult('Gerando TypeError...');
    try {
      // @ts-ignore - Intencional para teste
      const result = null.toString();
    } catch (error) {
      captureError(error as Error, {
        context: 'type-error-test'
      });
      addResult('✅ TypeError capturado');
    }
  };

  const clearResults = () => {
    setTestResults([]);
    addResult('Resultados limpos');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-2">Teste do Sentry</h1>
          <p className="text-muted-foreground mb-6">
            Use esta página para testar a integração com o Sentry
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                ⚠️ Antes de testar:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800 dark:text-amber-200">
                <li>Certifique-se de ter configurado NEXT_PUBLIC_SENTRY_DSN no .env</li>
                <li>Execute o script: ./scripts/activate-sentry.sh</li>
                <li>Reinicie o servidor de desenvolvimento</li>
                <li>Abra o dashboard do Sentry em outra aba</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={testErrorCapture}
                variant="elevated"
                className="w-full"
              >
                🐛 Testar Captura de Erro
              </Button>

              <Button 
                onClick={testMessage}
                variant="elevated"
                className="w-full"
              >
                💬 Testar Mensagem
              </Button>

              <Button 
                onClick={testAsyncError}
                variant="elevated"
                className="w-full"
              >
                ⏳ Testar Erro Assíncrono
              </Button>

              <Button 
                onClick={testTypeError}
                variant="elevated"
                className="w-full"
              >
                🔧 Testar TypeError
              </Button>

              <Button 
                onClick={testUnhandledError}
                variant="elevated"
                className="w-full bg-red-500 hover:bg-red-600"
              >
                💥 Erro Não Tratado (2s)
              </Button>

              <Button 
                onClick={clearResults}
                variant="ghost"
                className="w-full"
              >
                🗑️ Limpar Resultados
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Resultados dos Testes</h2>
          
          {testResults.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum teste executado ainda. Clique nos botões acima para testar.
            </p>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-secondary rounded-lg font-mono text-sm"
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📝 Verificar no Sentry</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Acesse seu dashboard do Sentry</li>
            <li>Vá em Issues para ver os erros capturados</li>
            <li>Verifique se os metadados (context, tags, extra) aparecem</li>
            <li>Teste os filtros por tipo de erro</li>
            <li>Configure alertas se desejar</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}