import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { KYCLevel, KYC_LIMITS } from '@/types/auth';
import { auth } from './auth';
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api/response';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateVerificationToken(): string {
  // Usar crypto para gerar token mais seguro
  if (typeof window === 'undefined') {
    // Node.js environment
    return crypto.randomBytes(32).toString('hex');
  } else {
    // Browser environment (fallback)
    const token = Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15);
    return token.toUpperCase();
  }
}

export function getKYCLimitForLevel(level: KYCLevel) {
  return KYC_LIMITS[level];
}

export function canAccessFeature(level: KYCLevel, feature: string): boolean {
  const limits = getKYCLimitForLevel(level);
  return limits.features.includes(feature as any);
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireKYCLevel(minLevel: KYCLevel) {
  const user = await requireAuth();
  if (user.kycLevel < minLevel) {
    throw new Error(`KYC level ${minLevel} required. Current level: ${user.kycLevel}`);
  }
  return user;
}

export function formatCPF(cpf: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Aplica a formatação XXX.XXX.XXX-XX
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

export function formatPhone(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Aplica a formatação (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

export async function checkAuth(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Não autenticado');
    }
    return { userId: session.user.id };
  } catch (error) {
    console.error('Error checking auth:', error);
    return ApiResponse.unauthorized('Erro ao verificar autenticação');
  }
}