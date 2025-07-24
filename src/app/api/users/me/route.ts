import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    // Get current session
    const session = await auth();
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Não autenticado');
    }
    
    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerifiedAt: true,
        firstName: true,
        lastName: true,
        phone: true,
        phoneVerified: true,
        kycLevel: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            avatarUrl: true,
            bio: true,
            preferredLanguage: true,
            preferredCurrency: true,
          },
        },
        operationalLimits: {
          select: {
            dailyWithdrawalLimit: true,
            dailyTradingLimit: true,
            monthlyWithdrawalLimit: true,
            monthlyTradingLimit: true,
          },
        },
      },
    });
    
    if (!user) {
      return ApiResponse.notFound('Usuário não encontrado');
    }
    
    return ApiResponse.success({
      ...user,
      name: `${user.firstName} ${user.lastName}`,
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return ApiResponse.internalError('Erro ao buscar dados do usuário');
  }
}