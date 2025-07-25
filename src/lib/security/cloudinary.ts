import crypto from 'crypto';

interface CloudinaryParams {
  public_id?: string;
  folder?: string;
  type?: string;
  timestamp?: number;
}

export function generateCloudinarySignature(params: CloudinaryParams): string {
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) {
    throw new Error('CLOUDINARY_API_SECRET não configurado');
  }

  // Timestamp padrão (válido por 1 hora)
  const timestamp = params.timestamp || Math.round(new Date().getTime() / 1000);

  // Ordenar parâmetros para assinatura
  const signatureParams = {
    timestamp,
    folder: params.folder || 'users',
    ...params
  };

  // Criar string de assinatura
  const signatureStr = Object.entries(signatureParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&') + secret;

  // Gerar hash SHA-256
  return crypto
    .createHash('sha256')
    .update(signatureStr)
    .digest('hex');
}

export function getUploadSignature(folder: string = 'users'): {
  signature: string;
  timestamp: number;
} {
  const timestamp = Math.round(new Date().getTime() / 1000);
  return {
    signature: generateCloudinarySignature({ timestamp, folder }),
    timestamp
  };
} 