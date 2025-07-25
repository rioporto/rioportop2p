import { prisma } from '@/lib/db/prisma';
import { KYCLevel } from '@prisma/client';

export async function getUserKYCLevel(userId: string): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycLevel: true }
    });

    if (!user) {
      return 0;
    }

    // Mapear níveis de KYC para números
    const kycLevelMap: Record<KYCLevel, number> = {
      NONE: 0,
      BASIC: 1,
      INTERMEDIATE: 2,
      ADVANCED: 3
    };

    return kycLevelMap[user.kycLevel] || 0;
  } catch (error) {
    console.error('Error getting user KYC level:', error);
    return 0;
  }
}

export async function checkUserKYCLevel(userId: string, requiredLevel: number): Promise<boolean> {
  const userLevel = await getUserKYCLevel(userId);
  return userLevel >= requiredLevel;
}

export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    return user?.role === 'ADMIN';
  } catch (error) {
    console.error('Error checking user admin status:', error);
    return false;
  }
} 