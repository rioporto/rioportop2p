import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    // Executar SQL direto para tornar campos opcionais
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ALTER COLUMN cpf DROP NOT NULL;
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ALTER COLUMN birth_date DROP NOT NULL;
    `);
    
    // Verificar se funcionou
    const result = await prisma.$queryRawUnsafe(`
      SELECT 
        column_name,
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public' 
        AND table_name = 'users'
        AND column_name IN ('cpf', 'birth_date')
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Campos CPF e birthDate agora são opcionais',
      result
    });
  } catch (error: any) {
    console.error('Erro ao atualizar banco:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}