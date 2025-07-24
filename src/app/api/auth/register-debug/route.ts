import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const steps: string[] = [];
  
  try {
    steps.push('1. Route handler iniciado');
    
    // Testar parsing do body
    let body;
    try {
      body = await req.json();
      steps.push('2. Body parseado com sucesso');
    } catch (e: any) {
      steps.push(`2. ERRO ao parsear body: ${e.message}`);
      throw e;
    }
    
    // Testar imports
    try {
      const { prisma } = await import('@/lib/db/prisma');
      steps.push('3. Prisma importado com sucesso');
      
      // Testar conexão com banco
      try {
        const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
        steps.push('4. Conexão com banco OK');
      } catch (e: any) {
        steps.push(`4. ERRO conexão banco: ${e.message}`);
        throw e;
      }
      
      // Testar query de usuário
      try {
        const count = await prisma.user.count();
        steps.push(`5. Query usuários OK (total: ${count})`);
      } catch (e: any) {
        steps.push(`5. ERRO query usuários: ${e.message}`);
        throw e;
      }
      
      // Testar imports problemáticos
      try {
        const { hashPassword } = await import('@/lib/auth/utils');
        steps.push('6. hashPassword importado OK');
      } catch (e: any) {
        steps.push(`6. ERRO import hashPassword: ${e.message}`);
      }
      
      try {
        const { registrationSchema } = await import('@/lib/api/registration');
        steps.push('7. registrationSchema importado OK');
      } catch (e: any) {
        steps.push(`7. ERRO import registrationSchema: ${e.message}`);
      }
      
      try {
        const { ApiResponse } = await import('@/lib/api/response');
        steps.push('8. ApiResponse importado OK');
      } catch (e: any) {
        steps.push(`8. ERRO import ApiResponse: ${e.message}`);
      }
      
    } catch (e: any) {
      steps.push(`ERRO geral nos imports: ${e.message}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug completo',
      steps,
      bodyReceived: body
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      steps,
      stack: error.stack
    }, { status: 500 });
  }
}