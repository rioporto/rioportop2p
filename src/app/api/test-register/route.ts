import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email') || 'cetewov199@ikanteri.com';
  const whatsapp = searchParams.get('whatsapp') || '11999999999';
  
  return handleTest({ email, whatsapp });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return handleTest(body);
}

async function handleTest(params: { email: string; whatsapp: string }) {
  try {
    const { email, whatsapp } = params;
    
    // Verificar email
    const emailUser = await prisma.user.findUnique({
      where: { email: email?.toLowerCase() || '' },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        phone: true
      }
    });
    
    // Verificar telefone
    let phoneUser = null;
    if (whatsapp) {
      const cleanPhone = whatsapp.replace(/\D/g, '');
      phoneUser = await prisma.user.findFirst({
        where: { phone: cleanPhone },
        select: {
          id: true,
          email: true,
          phone: true,
          emailVerified: true
        }
      });
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      request: {
        email: email?.toLowerCase(),
        phone: whatsapp?.replace(/\D/g, '')
      },
      results: {
        emailExists: !!emailUser,
        emailUser: emailUser ? {
          id: emailUser.id,
          email: emailUser.email,
          verified: emailUser.emailVerified,
          phone: emailUser.phone
        } : null,
        phoneExists: !!phoneUser,
        phoneUser: phoneUser ? {
          id: phoneUser.id,
          email: phoneUser.email,
          phone: phoneUser.phone,
          verified: phoneUser.emailVerified
        } : null
      },
      canRegister: {
        email: !emailUser || !emailUser.emailVerified,
        phone: !phoneUser
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error
    }, { status: 500 });
  }
}