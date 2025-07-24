import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    // Tornar CPF e birth_date opcionais (não remover!)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users 
      ALTER COLUMN cpf DROP NOT NULL,
      ALTER COLUMN birth_date DROP NOT NULL;
    `);
    
    return NextResponse.json({
      success: true,
      message: 'CPF e birth_date agora são opcionais (serão preenchidos no KYC)'
    });
  } catch (error: any) {
    console.error('Erro ao tornar campos opcionais:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}