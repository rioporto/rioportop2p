import { generateSecureUUID } from '@/lib/utils/uuid';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware, requireAuth } from '@/lib/api/middleware';
import { 
  IKYCDocument,
  API_ERROR_CODES 
} from '@/types/api';
import { prisma } from '@/lib/db/prisma';
import { checkAuth } from '@/lib/auth/utils';

// File upload limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

// Validation schemas
const uploadSchema = z.object({
  type: z.enum(['RG', 'CNH', 'PASSPORT', 'SELFIE', 'PROOF_OF_ADDRESS']),
  file: z.any() // TODO: Implementar validação de arquivo
});

// Temporary storage
const kycDocuments: Map<string, IKYCDocument> = new Map();

// GET /api/kyc - Get user's KYC documents
export const GET = withMiddleware(
  async (req: NextRequest) => {
    // Verificar autenticação
    const authResult = await checkAuth(req);
    if ('status' in authResult) {
      return authResult;
    }
    const { userId } = authResult;

    try {
      // Buscar documentos do usuário
      const documents = await prisma.kycDocument.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return ApiResponse.success(documents);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
      return ApiResponse.internalError('Erro ao buscar documentos');
    }
  }
);

// POST /api/kyc - Upload KYC document
export async function POST(req: NextRequest) {
  // Verificar autenticação
  const authResult = await checkAuth(req);
  if ('status' in authResult) {
    return authResult;
  }
  const { userId } = authResult;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    // Validar dados
    const validation = uploadSchema.safeParse({ type, file });
    if (!validation.success) {
      return ApiResponse.badRequest(
        'Dados inválidos',
        'VALIDATION_ERROR',
        validation.error.errors
      );
    }

    // TODO: Processar upload do arquivo
    // TODO: Salvar documento no banco

    return ApiResponse.success({ message: 'Documento enviado com sucesso' });
  } catch (error) {
    console.error('Error uploading KYC document:', error);
    return ApiResponse.internalError('Erro ao enviar documento');
  }
}

// PATCH /api/kyc/:id - Update KYC document status (admin only)
export const PATCH = withMiddleware(
  async (req: NextRequest) => {
    // TODO: Check admin permissions

    const body = await req.json();
    const { status, reason } = body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return ApiResponse.badRequest('Invalid status');
    }

    if (status === 'REJECTED' && !reason) {
      return ApiResponse.badRequest('Reason is required for rejection');
    }

    // Extract document ID from URL
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const documentId = segments[segments.length - 1];

    const document = kycDocuments.get(documentId);
    if (!document) {
      return ApiResponse.notFound('KYC document not found');
    }

    // Update document
    const updatedDocument: IKYCDocument = {
      ...document,
      status,
      reason: status === 'REJECTED' ? reason : undefined,
      updatedAt: new Date(),
    };

    kycDocuments.set(documentId, updatedDocument);

    // TODO: Update user's KYC level if all required documents are approved

    return ApiResponse.success(updatedDocument);
  }
);