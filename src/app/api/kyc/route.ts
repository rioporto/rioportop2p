import { generateSecureUUID } from '@/lib/utils/uuid';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware, requireAuth } from '@/lib/api/middleware';
import { 
  IKYCDocument,
  API_ERROR_CODES 
} from '@/types/api';

// File upload limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

// Validation schemas
const uploadSchema = z.object({
  type: z.enum(['RG', 'CNH', 'PASSPORT', 'SELFIE', 'PROOF_OF_ADDRESS']),
});

// Temporary storage
const kycDocuments: Map<string, IKYCDocument> = new Map();

// GET /api/kyc - Get user's KYC documents
export const GET = withMiddleware(
  async (req: NextRequest) => {
    // TODO: Get user ID from auth token
    const userId = 'temp-user-id';

    const userDocuments = Array.from(kycDocuments.values())
      .filter(doc => doc.userId === userId);

    return ApiResponse.success(userDocuments);
  }
);

// POST /api/kyc - Upload KYC document
export const POST = withMiddleware(
  async (req: NextRequest) => {
    try {
      // Parse multipart form data
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const type = formData.get('type') as string;

      if (!file) {
        return ApiResponse.badRequest('File is required');
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return ApiResponse.badRequest(
          'Invalid file type. Only JPEG, PNG, and PDF are allowed',
          API_ERROR_CODES.INVALID_FILE_FORMAT
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return ApiResponse.badRequest(
          'File size exceeds 5MB limit',
          API_ERROR_CODES.FILE_TOO_LARGE
        );
      }

      // Validate document type
      const validatedData = uploadSchema.parse({ type });

      // TODO: Get user ID from auth token
      const userId = 'temp-user-id';

      // Check if document type already submitted
      const existingDoc = Array.from(kycDocuments.values())
        .find(doc => doc.userId === userId && doc.type === validatedData.type);

      if (existingDoc && existingDoc.status === 'PENDING') {
        return ApiResponse.conflict(
          'Document of this type is already pending review',
          API_ERROR_CODES.DOCUMENT_ALREADY_SUBMITTED
        );
      }

      // TODO: Upload file to storage service (S3, Cloudinary, etc.)
      const fileUrl = `https://storage.example.com/kyc/${userId}/${file.name}`;

      // Create KYC document record
      const kycDocument: IKYCDocument = {
        id: generateSecureUUID(),
        userId,
        type: validatedData.type,
        status: 'PENDING',
        url: fileUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      kycDocuments.set(kycDocument.id, kycDocument);

      // Update user's KYC level based on documents
      // TODO: Update user KYC level in database

      return ApiResponse.created(kycDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponse.badRequest(
          'Invalid document type',
          API_ERROR_CODES.INVALID_DOCUMENT_TYPE,
          error.errors
        );
      }
      throw error;
    }
  }
);

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