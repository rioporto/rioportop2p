import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  console.log('=== REGISTER TEST ROUTE ===');
  
  try {
    const body = await req.json();
    console.log('Body:', body);
    
    // Verificar se email existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    
    if (existingUser) {
      console.log('User already exists');
      return ApiResponse.conflict(
        'Este email já está cadastrado',
        'USER_ALREADY_EXISTS'
      );
    }
    
    return ApiResponse.success({ message: 'Email disponível' });
    
  } catch (error: any) {
    console.error('Error:', error);
    return ApiResponse.internalError('Erro: ' + error.message);
  }
}
