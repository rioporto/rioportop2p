import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware } from '@/lib/api/middleware';
import { KYCLevel } from '@/types/kyc';
import { getNextKYCLevel, hasMinimumKYCLevel } from '@/lib/utils/kyc';

// Get KYC status (authenticated users only)
export const GET = withMiddleware(
  async (req: NextRequest) => {
    try {
      // Check authentication
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return ApiResponse.unauthorized('Não autenticado');
      }
      
      // Get user with KYC data
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          kycDocuments: {
            orderBy: { createdAt: 'desc' },
          },
          transactions: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
              },
            },
            select: {
              fiatAmount: true,
              type: true,
            },
          },
        },
      });
      
      if (!user) {
        return ApiResponse.notFound('Usuário não encontrado');
      }
      
      // Calculate monthly volume
      const monthlyVolume = user.transactions.reduce((sum, tx) => {
        return sum + (tx.fiatAmount || 0);
      }, 0);
      
      // Get KYC level limits
      const levelLimits: Record<KYCLevel, number> = {
        [KYCLevel.PLATFORM_ACCESS]: 0,
        [KYCLevel.BASIC]: 5000,
        [KYCLevel.INTERMEDIATE]: 30000,
        [KYCLevel.ADVANCED]: 50000,
      };
      
      const currentLimit = levelLimits[user.kycLevel as KYCLevel] || 0;
      const remainingLimit = Math.max(0, currentLimit - monthlyVolume);
      
      // Determine required documents for next level
      const nextLevel = getNextKYCLevel(user.kycLevel as KYCLevel);
      const requiredDocuments = getRequiredDocumentsForLevel(nextLevel);
      
      // Check submitted documents
      const submittedDocTypes = user.kycDocuments.map(doc => doc.type);
      const pendingDocuments = requiredDocuments.filter(
        docType => !submittedDocTypes.includes(docType)
      );
      
      // Determine KYC status
      const hasAllDocuments = pendingDocuments.length === 0;
      const hasPendingDocs = user.kycDocuments.some(doc => doc.status === 'PENDING');
      const hasRejectedDocs = user.kycDocuments.some(doc => doc.status === 'REJECTED');
      
      let status = 'APPROVED';
      if (hasPendingDocs) status = 'IN_REVIEW';
      else if (hasRejectedDocs) status = 'REJECTED';
      else if (!hasAllDocuments && nextLevel) status = 'PENDING';
      
      // Get completed steps
      const completedSteps = getCompletedSteps(user);
      const pendingSteps = getPendingSteps(user, nextLevel);
      
      // Check if can upgrade
      const canUpgrade = nextLevel !== null && 
                        hasAllRequiredFields(user, nextLevel) &&
                        !hasPendingDocs;
      
      const upgradeBlockers = getUpgradeBlockers(user, nextLevel);
      
      return ApiResponse.success({
        currentLevel: user.kycLevel as KYCLevel,
        nextLevel,
        status,
        monthlyLimit: currentLimit,
        remainingLimit,
        monthlyVolume,
        documents: user.kycDocuments.map(doc => ({
          id: doc.id,
          type: doc.type,
          status: doc.status,
          uploadedAt: doc.createdAt,
          reviewedAt: doc.updatedAt,
          rejectionReason: doc.rejectionReason,
        })),
        requiredDocuments: pendingDocuments,
        completedSteps,
        pendingSteps,
        canUpgrade,
        upgradeBlockers,
      });
      
    } catch (error) {
      console.error('KYC status error:', error);
      return ApiResponse.internalError('Erro ao buscar status KYC');
    }
  },
  {
    logging: true,
  }
);

// Check KYC eligibility for amount (public endpoint)
export const POST = withMiddleware(
  async (req: NextRequest) => {
    try {
      const { amount } = await req.json();
      
      if (!amount || amount <= 0) {
        return ApiResponse.badRequest('Valor inválido');
      }
      
      // Get user session if authenticated
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        // Not authenticated - require at least BASIC KYC
        return ApiResponse.success({
          eligible: false,
          currentLimit: 0,
          remainingLimit: 0,
          requiredLevel: KYCLevel.BASIC,
          reason: 'É necessário fazer login e completar o KYC básico',
        });
      }
      
      // Get user KYC level and monthly volume
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          transactions: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
              status: 'COMPLETED',
            },
            select: {
              fiatAmount: true,
            },
          },
        },
      });
      
      if (!user) {
        return ApiResponse.notFound('Usuário não encontrado');
      }
      
      // Calculate monthly volume
      const monthlyVolume = user.transactions.reduce((sum, tx) => {
        return sum + (tx.fiatAmount || 0);
      }, 0);
      
      // Get limits
      const levelLimits: Record<KYCLevel, number> = {
        [KYCLevel.PLATFORM_ACCESS]: 0,
        [KYCLevel.BASIC]: 5000,
        [KYCLevel.INTERMEDIATE]: 30000,
        [KYCLevel.ADVANCED]: 50000,
      };
      
      const currentLimit = levelLimits[user.kycLevel as KYCLevel] || 0;
      const remainingLimit = Math.max(0, currentLimit - monthlyVolume);
      
      // Check if eligible
      const eligible = amount <= remainingLimit;
      
      // Find required level for amount
      let requiredLevel = user.kycLevel as KYCLevel;
      if (!eligible) {
        const totalNeeded = monthlyVolume + amount;
        if (totalNeeded <= levelLimits[KYCLevel.BASIC]) {
          requiredLevel = KYCLevel.BASIC;
        } else if (totalNeeded <= levelLimits[KYCLevel.INTERMEDIATE]) {
          requiredLevel = KYCLevel.INTERMEDIATE;
        } else if (totalNeeded <= levelLimits[KYCLevel.ADVANCED]) {
          requiredLevel = KYCLevel.ADVANCED;
        } else {
          // Amount exceeds maximum limit
          return ApiResponse.success({
            eligible: false,
            currentLimit,
            remainingLimit,
            reason: 'Valor excede o limite máximo permitido (R$ 50.000/mês)',
          });
        }
      }
      
      const reason = !eligible
        ? `É necessário fazer upgrade para KYC ${getKYCLevelName(requiredLevel)}`
        : undefined;
      
      return ApiResponse.success({
        eligible,
        currentLimit,
        remainingLimit,
        requiredLevel: !eligible ? requiredLevel : undefined,
        reason,
      });
      
    } catch (error) {
      console.error('KYC eligibility check error:', error);
      return ApiResponse.internalError('Erro ao verificar elegibilidade');
    }
  },
  {
    rateLimit: {
      windowMs: 60 * 1000,
      maxRequests: 30, // 30 checks per minute
    },
    logging: true,
  }
);

// Helper functions

function getRequiredDocumentsForLevel(level: KYCLevel | null): string[] {
  if (!level) return [];
  
  const requirements: Record<KYCLevel, string[]> = {
    [KYCLevel.PLATFORM_ACCESS]: [],
    [KYCLevel.BASIC]: [], // Only CPF required, validated during registration
    [KYCLevel.INTERMEDIATE]: ['RG', 'PROOF_OF_ADDRESS'],
    [KYCLevel.ADVANCED]: ['RG', 'PROOF_OF_ADDRESS', 'SELFIE'],
  };
  
  return requirements[level] || [];
}

function hasAllRequiredFields(user: any, level: KYCLevel): boolean {
  const fieldRequirements: Record<KYCLevel, string[]> = {
    [KYCLevel.PLATFORM_ACCESS]: ['email', 'name'],
    [KYCLevel.BASIC]: ['email', 'name', 'cpf'],
    [KYCLevel.INTERMEDIATE]: ['email', 'name', 'cpf'],
    [KYCLevel.ADVANCED]: ['email', 'name', 'cpf'],
  };
  
  const required = fieldRequirements[level] || [];
  return required.every(field => user[field]);
}

function getCompletedSteps(user: any): string[] {
  const steps: string[] = [];
  
  if (user.email && user.emailVerified) steps.push('Email verificado');
  if (user.name) steps.push('Nome completo cadastrado');
  if (user.cpf) steps.push('CPF validado');
  if (user.phone) steps.push('Telefone cadastrado');
  
  // Check documents
  const approvedDocs = user.kycDocuments.filter((doc: any) => doc.status === 'APPROVED');
  approvedDocs.forEach((doc: any) => {
    if (doc.type === 'RG') steps.push('Documento de identidade aprovado');
    if (doc.type === 'PROOF_OF_ADDRESS') steps.push('Comprovante de endereço aprovado');
    if (doc.type === 'SELFIE') steps.push('Selfie com documento aprovada');
  });
  
  return steps;
}

function getPendingSteps(user: any, nextLevel: KYCLevel | null): string[] {
  if (!nextLevel) return [];
  
  const steps: string[] = [];
  
  // Basic requirements
  if (!user.emailVerified) steps.push('Verificar email');
  if (!user.cpf && nextLevel >= KYCLevel.BASIC) steps.push('Cadastrar CPF');
  
  // Document requirements
  const requiredDocs = getRequiredDocumentsForLevel(nextLevel);
  const approvedDocs = user.kycDocuments
    .filter((doc: any) => doc.status === 'APPROVED')
    .map((doc: any) => doc.type);
  
  requiredDocs.forEach(docType => {
    if (!approvedDocs.includes(docType)) {
      if (docType === 'RG') steps.push('Enviar documento de identidade');
      if (docType === 'PROOF_OF_ADDRESS') steps.push('Enviar comprovante de endereço');
      if (docType === 'SELFIE') steps.push('Enviar selfie com documento');
    }
  });
  
  return steps;
}

function getUpgradeBlockers(user: any, nextLevel: KYCLevel | null): string[] {
  if (!nextLevel) return [];
  
  const blockers: string[] = [];
  
  // Check email verification
  if (!user.emailVerified) {
    blockers.push('Email não verificado');
  }
  
  // Check required fields
  if (nextLevel >= KYCLevel.BASIC && !user.cpf) {
    blockers.push('CPF não cadastrado');
  }
  
  // Check pending documents
  const pendingDocs = user.kycDocuments.filter((doc: any) => doc.status === 'PENDING');
  if (pendingDocs.length > 0) {
    blockers.push('Documentos em análise');
  }
  
  // Check rejected documents
  const rejectedDocs = user.kycDocuments.filter((doc: any) => doc.status === 'REJECTED');
  rejectedDocs.forEach((doc: any) => {
    blockers.push(`${doc.type} rejeitado: ${doc.rejectionReason || 'Documento inválido'}`);
  });
  
  return blockers;
}

function getKYCLevelName(level: KYCLevel): string {
  const names: Record<KYCLevel, string> = {
    [KYCLevel.PLATFORM_ACCESS]: 'Acesso à Plataforma',
    [KYCLevel.BASIC]: 'Básico',
    [KYCLevel.INTERMEDIATE]: 'Intermediário',
    [KYCLevel.ADVANCED]: 'Avançado',
  };
  return names[level] || 'Desconhecido';
}