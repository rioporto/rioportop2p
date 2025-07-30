import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api/response';

interface RailwayWebhook {
  id: string;
  type: 'DEPLOY_STARTED' | 'DEPLOY_SUCCESS' | 'DEPLOY_FAILED' | 'DEPLOY_CRASHED';
  timestamp: string;
  project: {
    id: string;
    name: string;
  };
  environment: {
    id: string;
    name: string;
  };
  deployment?: {
    id: string;
    status: string;
    url?: string;
    error?: string;
    logs?: string[];
  };
}

export async function POST(req: NextRequest) {
  try {
    // Log headers para debug
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    console.log('🚂 Railway Webhook Request:', {
      method: req.method,
      url: req.url,
      headers: headers
    });

    // Aceita qualquer payload
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      console.log('Body não é JSON, tentando text...');
      body = await req.text();
    }
    
    console.log('🚂 Railway Webhook Body:', body);
    
    // Se for o formato esperado, processa normalmente
    if (body && typeof body === 'object' && body.type) {
      console.log('Formato reconhecido:', {
        type: body.type,
        project: body.project?.name,
        environment: body.environment?.name,
        deploymentId: body.deployment?.id,
        timestamp: body.timestamp
      });

    // Processar diferentes tipos de eventos
    switch (body.type) {
      case 'DEPLOY_STARTED':
        console.log(`✨ Deploy iniciado: ${body.deployment?.id}`);
        break;
        
      case 'DEPLOY_SUCCESS':
        console.log(`✅ Deploy bem-sucedido!`);
        console.log(`URL: ${body.deployment?.url}`);
        break;
        
      case 'DEPLOY_FAILED':
        console.error(`❌ Deploy falhou!`);
        console.error(`Erro: ${body.deployment?.error}`);
        if (body.deployment?.logs) {
          console.error('Últimas linhas dos logs:');
          body.deployment.logs.slice(-10).forEach(log => console.error(log));
        }
        break;
        
      case 'DEPLOY_CRASHED':
        console.error(`💥 Deploy crashou após iniciar!`);
        break;
    }

      // Processar eventos...
    } else {
      console.log('Formato não reconhecido, retornando sucesso mesmo assim');
    }

    // Sempre retorna sucesso para o Railway
    return new Response(JSON.stringify({ received: true, status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Erro ao processar webhook Railway:', error);
    // Retorna 200 mesmo com erro para não fazer o Railway retry
    return new Response(JSON.stringify({ received: true, error: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET para testar se o endpoint está funcionando
export async function GET() {
  return apiResponse.success({
    status: 'Railway webhook endpoint está funcionando!',
    url: `${process.env.NEXTAUTH_URL}/api/webhooks/railway`,
    message: 'Configure este URL no Railway: Settings > Webhooks'
  });
}