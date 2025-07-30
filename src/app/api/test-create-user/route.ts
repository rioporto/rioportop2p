import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateUUID } from '@/lib/utils/uuid';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    // Dados de teste
    const testData = {
      email: 'test_' + Date.now() + '@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'Test123!@#',
      phone: '11' + Math.floor(900000000 + Math.random() * 100000000).toString()
    };
    
    console.log('Testing user creation with:', testData);
    
    // Tentar criar usuário
    try {
      const passwordHash = await bcrypt.hash(testData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          id: generateUUID(),
          email: testData.email,
          firstName: testData.firstName,
          lastName: testData.lastName,
          passwordHash,
          phone: testData.phone,
          kycLevel: 'PLATFORM_ACCESS',
          status: 'ACTIVE',
          termsAcceptedAt: new Date(),
          marketingConsent: false
        }
      });
      
      // Se criou com sucesso, deletar para não poluir o banco
      await prisma.user.delete({
        where: { id: user.id }
      });
      
      return NextResponse.json({
        success: true,
        message: 'User creation test passed!',
        testData,
        createdUser: {
          id: user.id,
          email: user.email,
          phone: user.phone
        }
      });
      
    } catch (createError: any) {
      console.error('Create error:', createError);
      
      return NextResponse.json({
        success: false,
        message: 'User creation failed',
        error: {
          code: createError.code,
          message: createError.message,
          meta: createError.meta,
          clientVersion: createError.clientVersion
        },
        testData
      }, { status: 500 });
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error
    }, { status: 500 });
  }
}