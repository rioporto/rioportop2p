import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    // Tornar campos de termos opcionais
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users 
      ALTER COLUMN terms_accepted_at DROP NOT NULL,
      ALTER COLUMN privacy_accepted_at DROP NOT NULL;
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Campos de termos agora são opcionais'
    });
  } catch (error: any) {
    console.error('Erro ao tornar campos opcionais:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}