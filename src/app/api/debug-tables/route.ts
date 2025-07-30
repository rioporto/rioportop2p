import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    // Listar todas as tabelas do banco
    const tables = await prisma.$queryRaw`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    // Listar colunas da tabela de usuários (tentando diferentes nomes)
    let userTableColumns = null;
    let userTableName = null;
    
    // Tentar diferentes possibilidades
    const possibleNames = ['users', 'user', 'User', 'Users', '_User', '_users'];
    
    for (const name of possibleNames) {
      try {
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = ${name}
          ORDER BY ordinal_position
        `;
        
        if ((columns as any[]).length > 0) {
          userTableColumns = columns;
          userTableName = name;
          break;
        }
      } catch (e) {
        // Continuar tentando
      }
    }
    
    // Se ainda não encontrou, procurar por padrão
    if (!userTableName) {
      const userLikeTables = await prisma.$queryRaw`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name ILIKE '%user%'
      `;
      
      if ((userLikeTables as any[]).length > 0) {
        userTableName = (userLikeTables as any[])[0].table_name;
        
        userTableColumns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = ${userTableName}
          ORDER BY ordinal_position
        `;
      }
    }
    
    return NextResponse.json({
      allTables: tables,
      userTableFound: userTableName,
      userTableColumns: userTableColumns,
      totalTables: (tables as any[]).length
    });
    
  } catch (error) {
    console.error('Debug tables error:', error);
    return NextResponse.json({ 
      error: 'Failed to get table info',
      details: error 
    }, { status: 500 });
  }
}