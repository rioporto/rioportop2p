'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { captureError, captureMessage, setUser, clearUser, addBreadcrumb } from '@/lib/monitoring/sentry';
import { AlertCircle, CheckCircle, Bug, Info, AlertTriangle } from 'lucide-react';

export default function TestSentryPage() {
  const [testResults, setTestResults] = useState<Array<{
    id: number;
    type: string;
    message: string;
    success: boolean;
    timestamp: Date;
  }>>([]);

  const addResult = (type: string, message: string, success: boolean) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      success,
      timestamp: new Date()
    }]);
  };

  // Teste 1: Capturar erro simples
  const testSimpleError = () => {
    try {
      addBreadcrumb('Testando erro simples', 'test');
      throw new Error('Erro de teste simples do Sentry');
    } catch (error) {
      captureError(error, { test: true, type: 'simple' });
      addResult('Erro Simples', 'Erro capturado e enviado ao Sentry', true);
    }
  };

  // Teste 2: Capturar mensagem
  const testMessage = () => {
    captureMessage('Mensagem de teste do Rio Porto P2P', 'info');
    addResult('Mensagem', 'Mensagem informativa enviada ao Sentry', true);
  };

  // Teste 3: Definir usuário
  const testSetUser = () => {
    const testUser = {
      id: 'test-user-123',
      email: 'teste@rioporto.com',
      name: 'Usuário Teste'
    };
    setUser(testUser);
    addResult('Usuário', `Usuário ${testUser.email} definido no Sentry`, true);
  };

  // Teste 4: Erro com contexto
  const testContextError = () => {
    try {
      addBreadcrumb('Iniciando transação PIX', 'transaction');
      addBreadcrumb('Validando dados', 'transaction');
      throw new Error('Falha ao processar PIX');
    } catch (error) {
      captureError(error, {
        transaction: {
          type: 'pix',
          amount: 100.50,
          status: 'failed',
          errorCode: 'PIX_001'
        }
      });
      addResult('Erro com Contexto', 'Erro de PIX com contexto completo enviado', true);
    }
  };

  // Teste 5: Warning
  const testWarning = () => {
    captureMessage('Taxa de conversão abaixo do esperado', 'warning');
    addResult('Aviso', 'Aviso de negócio enviado ao Sentry', true);
  };

  // Teste 6: Erro não capturado (vai ser pego automaticamente)
  const testUncaughtError = () => {
    addResult('Erro Não Capturado', 'Gerando erro não tratado em 2 segundos...', true);
    setTimeout(() => {
      // @ts-ignore - Erro proposital
      undefinedFunction();
    }, 2000);
  };

  // Teste 7: Performance
  const testPerformance = async () => {
    addBreadcrumb('Iniciando teste de performance', 'performance');
    const start = Date.now();
    
    // Simula operação lenta
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const duration = Date.now() - start;
    captureMessage(`Operação lenta detectada: ${duration}ms`, 'warning');
    addResult('Performance', `Operação demorou ${duration}ms - Reportado ao Sentry`, true);
  };

  // Limpar testes
  const clearTests = () => {
    clearUser();
    setTestResults([]);
    addResult('Limpar', 'Dados de teste limpos', true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Teste do Sentry - Rio Porto P2P
        </h1>

        <Card className="p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Status do Sentry</h2>
            <div className="flex items-center gap-2">
              {process.env.NEXT_PUBLIC_SENTRY_DSN ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700">Sentry configurado e ativo</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-700">Sentry não configurado (DSN ausente)</span>
                </>
              )}
            </div>
            {!process.env.NEXT_PUBLIC_SENTRY_DSN && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Para configurar:</strong> Adicione NEXT_PUBLIC_SENTRY_DSN no Railway
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Testes Disponíveis:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={testSimpleError} variant="elevated" className="justify-start">
                <Bug className="w-4 h-4 mr-2" />
                Testar Erro Simples
              </Button>
              
              <Button onClick={testMessage} variant="elevated" className="justify-start">
                <Info className="w-4 h-4 mr-2" />
                Testar Mensagem Info
              </Button>
              
              <Button onClick={testSetUser} variant="elevated" className="justify-start">
                <CheckCircle className="w-4 h-4 mr-2" />
                Definir Usuário Teste
              </Button>
              
              <Button onClick={testContextError} variant="elevated" className="justify-start">
                <AlertCircle className="w-4 h-4 mr-2" />
                Erro com Contexto PIX
              </Button>
              
              <Button onClick={testWarning} variant="elevated" className="justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Testar Warning
              </Button>
              
              <Button onClick={testPerformance} variant="elevated" className="justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Testar Performance
              </Button>
              
              <Button onClick={testUncaughtError} variant="elevated" className="justify-start bg-red-600 hover:bg-red-700">
                <AlertCircle className="w-4 h-4 mr-2" />
                Gerar Erro Não Tratado
              </Button>
              
              <Button onClick={clearTests} variant="flat" className="justify-start">
                <X className="w-4 h-4 mr-2" />
                Limpar Testes
              </Button>
            </div>
          </div>
        </Card>

        {/* Resultados dos testes */}
        {testResults.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resultados dos Testes:</h3>
            <div className="space-y-2">
              {testResults.map(result => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    result.success ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{result.type}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instruções */}
        <Card className="p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-3">
            Como verificar no Sentry:
          </h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. Acesse https://sentry.io e faça login</li>
            <li>2. Navegue até o projeto "rioporto-p2p"</li>
            <li>3. Vá em "Issues" para ver erros capturados</li>
            <li>4. Vá em "Performance" para ver métricas</li>
            <li>5. Vá em "Replays" para ver sessões gravadas</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> O Sentry agrupa erros similares automaticamente.
              Cada teste aparecerá como um novo issue ou será agrupado com similares.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Importações necessárias
import { Clock, X } from 'lucide-react';