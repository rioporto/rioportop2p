import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || 'cetewov199@ikanteri.com';
  
  try {
    console.log('Searching for email:', email);
    
    // 1. Busca direta com Prisma
    const prismaResult = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    // 2. Busca com SQL raw na tabela users
    const sqlResult = await prisma.$queryRaw`
      SELECT id, email, email_verified, phone, first_name, last_name, created_at
      FROM users
      WHERE email = ${email.toLowerCase()}
    `;
    
    // 3. Busca com LIKE para encontrar variações
    const likeResult = await prisma.$queryRaw`
      SELECT id, email, email_verified, phone, first_name, last_name, created_at
      FROM users
      WHERE email LIKE ${`%${email.split('@')[0]}%`}
    `;
    
    // 4. Contar total de usuários
    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM users
    `;
    
    // 5. Últimos 10 usuários cadastrados
    const recentUsers = await prisma.$queryRaw`
      SELECT id, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    // 6. Verificar se existe algum usuário com esse email exato (case insensitive)
    const exactMatch = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE LOWER(email) = LOWER(${email})
    `;
    
    // 7. Buscar por domínio
    const domainMatch = await prisma.$queryRaw`
      SELECT id, email, created_at
      FROM users
      WHERE email LIKE ${`%@${email.split('@')[1]}`}
      LIMIT 20
    `;
    
    return NextResponse.json({
      searchEmail: email,
      results: {
        prismaSearch: prismaResult ? {
          found: true,
          user: {
            id: prismaResult.id,
            email: prismaResult.email,
            emailVerified: prismaResult.emailVerified,
            phone: prismaResult.phone,
            name: `${prismaResult.firstName} ${prismaResult.lastName}`
          }
        } : { found: false },
        sqlDirectSearch: sqlResult,
        sqlLikeSearch: likeResult,
        exactMatchCount: exactMatch,
        domainMatches: domainMatch,
        stats: {
          totalUsers: totalCount,
          recentUsers: recentUsers
        }
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: 'Search failed',
      details: error 
    }, { status: 500 });
  }
}