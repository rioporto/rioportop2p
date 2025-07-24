import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/utils';
import { KYCLevel } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Test register data:', body);
    
    // Hash password
    const hashedPassword = await hashPassword(body.password || 'Test123!');
    
    // Test user creation
    const nameParts = (body.name || 'Test User').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    
    const testData = {
      email: body.email || `test${Date.now()}@example.com`,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      phone: body.whatsapp?.replace(/\D/g, ''),
      kycLevel: KYCLevel.PLATFORM_ACCESS,
      // CPF e birthDate NÃO são incluídos - serão adicionados no KYC
    };
    
    console.log('Creating user with data:', testData);
    
    const user = await prisma.user.create({
      data: testData,
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        kycLevel: user.kycLevel
      }
    });
    
  } catch (error: any) {
    console.error('Test register error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}