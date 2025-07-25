import { hash } from 'bcryptjs';
import prisma from '@/lib/db/prisma';
import { sign } from 'jsonwebtoken';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

export async function createTestUser(
  email = `test-${Date.now()}@example.com`,
  name = 'Test User',
  password = 'Test@1234!'
): Promise<TestUser> {
  const hashedPassword = await hash(password, 12);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerified: new Date(),
    },
  });

  const token = sign(
    { 
      userId: user.id,
      email: user.email,
    },
    process.env.NEXTAUTH_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    token,
  };
}

export async function deleteTestUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });
}

export function getAuthHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
  };
}

export async function createTestListing(userId: string, data?: Partial<any>) {
  return prisma.listing.create({
    data: {
      userId,
      type: 'SELL',
      cryptoAsset: 'BTC',
      priceType: 'FIXED',
      price: 100000,
      minAmount: 100,
      maxAmount: 1000,
      paymentMethods: ['PIX'],
      status: 'ACTIVE',
      ...data,
    },
  });
}

export async function deleteTestListing(id: string) {
  await prisma.listing.delete({
    where: { id },
  });
}

export async function createTestTransaction(
  buyerId: string,
  sellerId: string,
  listingId: string,
  data?: Partial<any>
) {
  return prisma.transaction.create({
    data: {
      buyerId,
      sellerId,
      listingId,
      amount: 500,
      paymentMethod: 'PIX',
      status: 'PENDING',
      ...data,
    },
  });
}

export async function deleteTestTransaction(id: string) {
  await prisma.transaction.delete({
    where: { id },
  });
} 