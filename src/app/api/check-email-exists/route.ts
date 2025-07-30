import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || 'cetewov199@ikanteri.com';
  
  try {
    console.log('=== CHECK EMAIL EXISTS ===');
    console.log('Checking email:', email);
    
    const results: any = {
      email: email,
      timestamp: new Date().toISOString()
    };
    
    // 1. Teste Prisma básico
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      results.prismaFindUnique = user ? {
        found: true,
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified
      } : {
        found: false
      };
    } catch (e: any) {
      results.prismaFindUnique = { error: e.message };
    }
    
    // 2. Teste Prisma findFirst
    try {
      const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase() }
      });
      
      results.prismaFindFirst = user ? {
        found: true,
        id: user.id,
        email: user.email
      } : {
        found: false
      };
    } catch (e: any) {
      results.prismaFindFirst = { error: e.message };
    }
    
    // 3. Teste Prisma count
    try {
      const count = await prisma.user.count({
        where: { email: email.toLowerCase() }
      });
      
      results.prismaCount = { count };
    } catch (e: any) {
      results.prismaCount = { error: e.message };
    }
    
    // 4. Teste criar usuário temporário
    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const testUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: testEmail,
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'test',
          kycLevel: 'PLATFORM_ACCESS',
          status: 'ACTIVE',
          termsAcceptedAt: new Date(),
          marketingConsent: false
        }
      });
      
      // Deletar imediatamente
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      
      results.createTest = { success: true, message: 'Create/delete test passed' };
    } catch (e: any) {
      results.createTest = { error: e.message };
    }
    
    // 5. Tentar criar com o email problemático
    try {
      const problemUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: email.toLowerCase(),
          firstName: 'Problem',
          lastName: 'Test',
          passwordHash: 'test',
          kycLevel: 'PLATFORM_ACCESS',
          status: 'ACTIVE',
          termsAcceptedAt: new Date(),
          marketingConsent: false
        }
      });
      
      results.createWithProblemEmail = {
        success: true,
        created: {
          id: problemUser.id,
          email: problemUser.email
        }
      };
      
      // NÃO deletar para poder investigar
    } catch (e: any) {
      results.createWithProblemEmail = {
        error: e.message,
        code: e.code,
        meta: e.meta
      };
    }
    
    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error('Check email error:', error);
    return NextResponse.json({ 
      error: 'Check failed',
      message: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
}