import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || 'cetewov199@ikanteri.com';
  
  try {
    // 1. Busca direta por email exato
    const directSearch = await prisma.user.findUnique({
      where: { email: email }
    });
    
    // 2. Busca com lowercase
    const lowercaseSearch = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    // 3. Busca com LIKE
    const likeSearch = await prisma.user.findMany({
      where: {
        email: {
          contains: email.split('@')[0], // busca pelo parte antes do @
          mode: 'insensitive'
        }
      }
    });
    
    // 4. Busca por todos os usuários com esse domínio
    const domainSearch = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@' + email.split('@')[1],
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true
      }
    });
    
    // 5. Contar total de usuários
    const totalUsers = await prisma.user.count();
    
    // 6. Últimos 5 usuários criados
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    // 7. Busca SQL direta (para garantir)
    const rawSearch = await prisma.$queryRaw`
      SELECT id, email, email_verified, created_at 
      FROM "User" 
      WHERE LOWER(email) = LOWER(${email})
    `;
    
    return NextResponse.json({
      searchEmail: email,
      results: {
        directSearch: directSearch ? {
          found: true,
          id: directSearch.id,
          email: directSearch.email,
          verified: directSearch.emailVerified
        } : { found: false },
        lowercaseSearch: lowercaseSearch ? {
          found: true,
          id: lowercaseSearch.id,
          email: lowercaseSearch.email,
          verified: lowercaseSearch.emailVerified
        } : { found: false },
        likeSearch: likeSearch.map(u => ({
          id: u.id,
          email: u.email,
          verified: u.emailVerified
        })),
        domainSearch: domainSearch,
        rawSqlSearch: rawSearch,
        stats: {
          totalUsers,
          recentUsers
        }
      }
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error 
    }, { status: 500 });
  }
}