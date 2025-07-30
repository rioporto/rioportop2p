import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || 'cetewov199@ikanteri.com';
  
  try {
    // 1. Primeiro descobrir o nome da tabela de usuários
    const userTables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND (
        table_name ILIKE '%user%' 
        OR table_name IN ('users', 'user', 'User', 'Users')
      )
    `;
    
    console.log('Found user tables:', userTables);
    
    // 2. Para cada tabela encontrada, tentar buscar o email
    const results: any = {
      email: email,
      tablesChecked: [],
      found: []
    };
    
    for (const table of (userTables as any[])) {
      const tableName = table.table_name;
      results.tablesChecked.push(tableName);
      
      try {
        // Verificar se a tabela tem coluna email
        const hasEmailColumn = await prisma.$queryRawUnsafe(`
          SELECT column_name 
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
          AND column_name ILIKE '%email%'
        `);
        
        if ((hasEmailColumn as any[]).length > 0) {
          // Tentar buscar o email
          const emailColumn = (hasEmailColumn as any[])[0].column_name;
          
          // Construir query segura
          let users;
          if (emailColumn.toLowerCase() === 'email') {
            users = await prisma.$queryRawUnsafe(`
              SELECT * 
              FROM "${tableName}"
              WHERE "${emailColumn}" = $1
            `, email.toLowerCase());
          } else {
            // Para outras colunas que possam ter email no nome mas não sejam texto
            continue;
          }
          
          if ((users as any[]).length > 0) {
            results.found.push({
              table: tableName,
              column: emailColumn,
              users: users
            });
          }
          
          // Também contar total na tabela
          const count = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*) as total 
            FROM "${tableName}"
          `);
          
          results[`${tableName}_count`] = count;
        }
      } catch (e: any) {
        console.error(`Error checking table ${tableName}:`, e.message);
        results[`${tableName}_error`] = e.message;
      }
    }
    
    // 3. Buscar usando Prisma normal também
    try {
      const prismaUser = await prisma.user.findUnique({
        where: { email: email }
      });
      
      results.prismaSearch = prismaUser ? {
        found: true,
        user: prismaUser
      } : {
        found: false
      };
    } catch (e: any) {
      results.prismaError = e.message;
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Find email error:', error);
    return NextResponse.json({ 
      error: 'Search failed',
      details: error 
    }, { status: 500 });
  }
}