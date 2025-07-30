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
    const body: RailwayWebhook = await req.json();
    
    console.log('🚂 Railway Webhook:', {
      type: body.type,
      project: body.project.name,
      environment: body.environment.name,
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

    // Salvar log em arquivo para debug
    const fs = require('fs').promises;
    const logPath = `railway-webhooks-${new Date().toISOString().split('T')[0]}.log`;
    await fs.appendFile(
      logPath, 
      JSON.stringify({ timestamp: new Date().toISOString(), webhook: body }, null, 2) + '\n\n'
    );

    return apiResponse.success({ received: true });
    
  } catch (error) {
    console.error('Erro ao processar webhook Railway:', error);
    return apiResponse.error('Erro ao processar webhook', 500);
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