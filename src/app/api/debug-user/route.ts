import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  try {
    // Buscar usuário completo
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        verificationTokens: true,
        sessions: true,
        devices: true,
        profile: true,
        documents: true,
        wallets: true,
        paymentMethods: true,
        listings: true,
        reputation: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        message: 'User not found',
        canRegister: true 
      });
    }
    
    // Contar relações
    const relations = {
      verificationTokens: user.verificationTokens.length,
      sessions: user.sessions.length,
      devices: user.devices.length,
      profile: !!user.profile,
      documents: user.documents.length,
      wallets: user.wallets.length,
      paymentMethods: user.paymentMethods.length,
      listings: user.listings.length,
      reputation: !!user.reputation
    };
    
    // Verificar tokens válidos
    const validTokens = user.verificationTokens.filter(
      token => token.expiresAt > new Date() && !token.usedAt
    );
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      relations,
      validTokens: validTokens.map(t => ({
        id: t.id,
        token: t.token,
        type: t.type,
        expiresAt: t.expiresAt,
        createdAt: t.createdAt
      })),
      canUpdate: !user.emailVerified,
      hasBlockingRelations: user.wallets.length > 0 || user.listings.length > 0
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Internal error',
      details: error 
    }, { status: 500 });
  }
}

// Endpoint para forçar limpeza (USE COM CUIDADO!)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const force = searchParams.get('force') === 'true';
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  
  if (!force) {
    return NextResponse.json({ 
      error: 'Add ?force=true to confirm deletion' 
    }, { status: 400 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (user.emailVerified) {
      return NextResponse.json({ 
        error: 'Cannot delete verified user' 
      }, { status: 400 });
    }
    
    // Deletar em ordem segura
    const deleted = {
      verificationTokens: 0,
      sessions: 0,
      devices: 0,
      profile: false,
      documents: 0
    };
    
    // 1. Tokens
    const tokens = await prisma.verificationToken.deleteMany({
      where: { userId: user.id }
    });
    deleted.verificationTokens = tokens.count;
    
    // 2. Sessions
    const sessions = await prisma.userSession.deleteMany({
      where: { userId: user.id }
    });
    deleted.sessions = sessions.count;
    
    // 3. Devices
    const devices = await prisma.userDevice.deleteMany({
      where: { userId: user.id }
    });
    deleted.devices = devices.count;
    
    // 4. Profile
    const profile = await prisma.userProfile.deleteMany({
      where: { userId: user.id }
    });
    deleted.profile = profile.count > 0;
    
    // 5. Documents
    const documents = await prisma.userDocument.deleteMany({
      where: { userId: user.id }
    });
    deleted.documents = documents.count;
    
    // 6. Finally, delete user
    await prisma.user.delete({
      where: { id: user.id }
    });
    
    return NextResponse.json({
      message: 'User deleted successfully',
      userId: user.id,
      email: user.email,
      deleted
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: error 
    }, { status: 500 });
  }
}