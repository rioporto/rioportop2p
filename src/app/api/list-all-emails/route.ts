import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    // Listar todos os emails no banco (com limite)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitar a 50 para não sobrecarregar
    });
    
    // Buscar especificamente por emails que contenham "cetewov"
    const specificSearch = await prisma.user.findMany({
      where: {
        email: {
          contains: 'cetewov',
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
    
    // Contar total
    const totalCount = await prisma.user.count();
    
    return NextResponse.json({
      totalUsers: totalCount,
      recentUsers: users.map(u => ({
        id: u.id,
        email: u.email,
        verified: u.emailVerified,
        created: u.createdAt
      })),
      searchResults: specificSearch,
      searchTerm: 'cetewov'
    });
    
  } catch (error: any) {
    console.error('List emails error:', error);
    return NextResponse.json({ 
      error: 'List failed',
      message: error.message
    }, { status: 500 });
  }
}