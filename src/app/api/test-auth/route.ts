import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        kycLevel: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      });
    }
    
    // Verificar senha
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Senha incorreta' 
      });
    }
    
    // Remover senha do resultado
    const { passwordHash, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Login funcionaria!',
      user: userWithoutPassword 
    });
    
  } catch (error) {
    console.error('Erro no teste:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}