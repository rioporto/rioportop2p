import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api/response';
import { captureError } from '@/lib/monitoring/sentry';

export async function GET(req: NextRequest) {
  // Apenas para testes - verificar header especial
  const isTest = req.headers.get('X-Test-Sentry') === 'true';
  
  if (!isTest) {
    return ApiResponse.unauthorized('Endpoint apenas para testes');
  }

  try {
    // Simular diferentes tipos de erro para teste
    const errorType = req.nextUrl.searchParams.get('type') || 'default';

    switch (errorType) {
      case 'async':
        await Promise.reject(new Error('Erro assíncrono de teste da API'));
        break;
        
      case 'database':
        throw new Error('Erro simulado de banco de dados');
        
      case 'validation':
        throw new Error('Erro de validação de dados');
        
      case 'timeout':
        await new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout simulado')), 100);
        });
        break;
        
      default:
        throw new Error('Erro de teste do Sentry via API');
    }
  } catch (error) {
    // Capturar erro com contexto
    captureError(error as Error, {
      context: 'test-sentry-api',
      tags: {
        endpoint: '/api/test-sentry-error',
        test: 'true'
      },
      extra: {
        headers: Object.fromEntries(req.headers.entries()),
        timestamp: new Date().toISOString()
      }
    });

    // Retornar erro 500 para o teste
    return ApiResponse.error('Erro gerado intencionalmente para teste do Sentry');
  }

  // Não deve chegar aqui
  return ApiResponse.success({ message: 'Nenhum erro gerado' });
}