import { createApiClient, ApiClient } from './client';
import { IApiResponse, IKYCDocument, IKYCUploadDto } from '@/types/api';
import { KYCLevel } from '@/types/kyc';
import { z } from 'zod';

// KYC Document Types
export enum KYCDocumentType {
  RG = 'RG',
  CNH = 'CNH',
  PASSPORT = 'PASSPORT',
  SELFIE = 'SELFIE',
  PROOF_OF_ADDRESS = 'PROOF_OF_ADDRESS',
}

// KYC Status
export enum KYCStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

// Validation schemas
export const kycDocumentUploadSchema = z.object({
  type: z.enum([
    KYCDocumentType.RG,
    KYCDocumentType.CNH,
    KYCDocumentType.PASSPORT,
    KYCDocumentType.SELFIE,
    KYCDocumentType.PROOF_OF_ADDRESS,
  ]),
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'Arquivo deve ter no máximo 10MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type),
      'Formato de arquivo inválido. Use JPG, PNG ou PDF'
    ),
});

export interface KYCStatusResponse {
  currentLevel: KYCLevel;
  nextLevel: KYCLevel | null;
  status: KYCStatus;
  monthlyLimit: number;
  remainingLimit: number;
  documents: IKYCDocument[];
  requiredDocuments: KYCDocumentType[];
  completedSteps: string[];
  pendingSteps: string[];
  canUpgrade: boolean;
  upgradeBlockers: string[];
}

export interface KYCLevelRequirements {
  level: KYCLevel;
  name: string;
  requirements: {
    field: string;
    description: string;
    completed: boolean;
  }[];
  benefits: string[];
  monthlyLimit: number;
}

export interface KYCUpgradeRequest {
  targetLevel: KYCLevel;
  documents?: {
    type: KYCDocumentType;
    fileId: string;
  }[];
  additionalInfo?: Record<string, any>;
}

export class KYCApiClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client || createApiClient({
      baseURL: '/api/kyc',
      timeout: 60000, // 60 seconds for file uploads
    });
  }

  /**
   * Get current KYC status
   */
  async getStatus(): Promise<IApiResponse<KYCStatusResponse>> {
    return this.client.get<KYCStatusResponse>('/status');
  }

  /**
   * Get KYC level requirements
   */
  async getLevelRequirements(level?: KYCLevel): Promise<IApiResponse<KYCLevelRequirements[]>> {
    const endpoint = level !== undefined ? `/requirements?level=${level}` : '/requirements';
    return this.client.get<KYCLevelRequirements[]>(endpoint);
  }

  /**
   * Upload KYC document
   */
  async uploadDocument(data: IKYCUploadDto): Promise<IApiResponse<IKYCDocument>> {
    // Validate input
    try {
      kycDocumentUploadSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados de upload inválidos',
            details: error.errors,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        };
      }
    }

    // Create form data
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('file', data.file);

    return this.client.upload<IKYCDocument>('/documents', formData, {
      onProgress: (progress) => {
        // Can be used to show upload progress
        console.log(`Upload progress: ${progress}%`);
      },
    });
  }

  /**
   * Get all KYC documents
   */
  async getDocuments(): Promise<IApiResponse<IKYCDocument[]>> {
    return this.client.get<IKYCDocument[]>('/documents');
  }

  /**
   * Get specific document
   */
  async getDocument(documentId: string): Promise<IApiResponse<IKYCDocument>> {
    return this.client.get<IKYCDocument>(`/documents/${documentId}`);
  }

  /**
   * Delete document (if allowed)
   */
  async deleteDocument(documentId: string): Promise<IApiResponse<{ deleted: boolean }>> {
    return this.client.delete<{ deleted: boolean }>(`/documents/${documentId}`);
  }

  /**
   * Request KYC upgrade
   */
  async requestUpgrade(data: KYCUpgradeRequest): Promise<IApiResponse<{
    requestId: string;
    status: KYCStatus;
    estimatedReviewTime: string;
  }>> {
    return this.client.post('/upgrade', data);
  }

  /**
   * Get KYC upgrade history
   */
  async getUpgradeHistory(): Promise<IApiResponse<{
    upgrades: {
      id: string;
      fromLevel: KYCLevel;
      toLevel: KYCLevel;
      status: KYCStatus;
      requestedAt: string;
      reviewedAt?: string;
      reason?: string;
    }[];
  }>> {
    return this.client.get('/upgrade-history');
  }

  /**
   * Check if user can perform transaction
   */
  async checkTransactionEligibility(amount: number): Promise<IApiResponse<{
    eligible: boolean;
    currentLimit: number;
    remainingLimit: number;
    requiredLevel?: KYCLevel;
    reason?: string;
  }>> {
    return this.client.post('/check-eligibility', { amount });
  }

  /**
   * Get KYC statistics
   */
  async getStatistics(): Promise<IApiResponse<{
    totalTransactions: number;
    monthlyVolume: number;
    remainingMonthlyLimit: number;
    upgradesSuggested: boolean;
    nextLevelBenefits?: string[];
  }>> {
    return this.client.get('/statistics');
  }

  /**
   * Submit additional KYC information
   */
  async submitAdditionalInfo(info: {
    occupation?: string;
    monthlyIncome?: string;
    sourceOfFunds?: string;
    purposeOfAccount?: string;
  }): Promise<IApiResponse<{ submitted: boolean }>> {
    return this.client.post('/additional-info', info);
  }

  /**
   * Helper method to get human-readable KYC level name
   */
  getKYCLevelName(level: KYCLevel): string {
    const names: Record<KYCLevel, string> = {
      [KYCLevel.PLATFORM_ACCESS]: 'Acesso à Plataforma',
      [KYCLevel.BASIC]: 'KYC Básico',
      [KYCLevel.INTERMEDIATE]: 'KYC Intermediário',
      [KYCLevel.ADVANCED]: 'KYC Avançado',
    };
    return names[level] || 'Desconhecido';
  }

  /**
   * Helper method to get KYC level limits
   */
  getKYCLevelLimit(level: KYCLevel): number {
    const limits: Record<KYCLevel, number> = {
      [KYCLevel.PLATFORM_ACCESS]: 0,
      [KYCLevel.BASIC]: 5000,
      [KYCLevel.INTERMEDIATE]: 30000,
      [KYCLevel.ADVANCED]: 50000,
    };
    return limits[level] || 0;
  }

  /**
   * Helper method to get required documents for each level
   */
  getRequiredDocuments(level: KYCLevel): KYCDocumentType[] {
    const requirements: Record<KYCLevel, KYCDocumentType[]> = {
      [KYCLevel.PLATFORM_ACCESS]: [],
      [KYCLevel.BASIC]: [],
      [KYCLevel.INTERMEDIATE]: [
        KYCDocumentType.RG,
        KYCDocumentType.PROOF_OF_ADDRESS,
      ],
      [KYCLevel.ADVANCED]: [
        KYCDocumentType.RG,
        KYCDocumentType.PROOF_OF_ADDRESS,
        KYCDocumentType.SELFIE,
      ],
    };
    return requirements[level] || [];
  }

  /**
   * Validate document before upload
   */
  validateDocument(file: File, type: KYCDocumentType): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('Arquivo muito grande. Máximo: 10MB');
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Formato inválido. Use JPG, PNG ou PDF');
    }
    
    // Check specific requirements for document types
    if (type === KYCDocumentType.SELFIE && file.type === 'application/pdf') {
      errors.push('Selfie deve ser uma imagem, não PDF');
    }
    
    if (type === KYCDocumentType.PROOF_OF_ADDRESS && file.type.startsWith('image/')) {
      // Check if image is not too small (might be unreadable)
      if (file.size < 50 * 1024) { // 50KB
        errors.push('Imagem muito pequena. Pode estar ilegível');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const kycApi = new KYCApiClient();