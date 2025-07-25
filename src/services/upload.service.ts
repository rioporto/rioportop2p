import { getUploadSignature } from '@/lib/security/cloudinary';

interface UploadResponse {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  moderationStatus?: 'approved' | 'rejected' | 'pending';
}

interface UploadProgress {
  bytes: number;
  total: number;
  percent: number;
}

class UploadService {
  private readonly UPLOAD_PRESET = 'rioporto-user-uploads';
  private readonly CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  /**
   * Faz upload de uma imagem para o Cloudinary com assinatura segura
   */
  async uploadImage(
    file: File,
    folder: string = 'users',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.UPLOAD_PRESET);
    formData.append('cloud_name', this.CLOUD_NAME!);
    
    // Adicionar assinatura segura
    const { signature, timestamp } = getUploadSignature(folder);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', folder);

    // Adicionar parâmetros de moderação
    formData.append('moderation', 'aws_rek');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        size: data.bytes,
        moderationStatus: data.moderation?.[0]?.status
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  }

  /**
   * Faz upload de múltiplas imagens em paralelo
   */
  async uploadImages(
    files: File[],
    folder: string = 'users',
    onProgress?: (progress: UploadProgress, index: number) => void
  ): Promise<UploadResponse[]> {
    const uploads = files.map((file, index) =>
      this.uploadImage(file, folder, (progress) => onProgress?.(progress, index))
    );

    return Promise.all(uploads);
  }

  /**
   * Gera URL de transformação do Cloudinary
   */
  getImageUrl(publicId: string, transformation: string): string {
    return `https://res.cloudinary.com/${this.CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
  }

  /**
   * URLs para diferentes tamanhos/formatos
   */
  getImageUrls(publicId: string) {
    return {
      // Avatar pequeno
      avatar: this.getImageUrl(publicId, 'w_50,h_50,c_fill,g_face,q_auto,f_auto'),
      
      // Imagem de anúncio
      listing: this.getImageUrl(publicId, 'w_600,h_400,c_fill,q_auto:good,f_auto'),
      
      // Thumbnail
      thumbnail: this.getImageUrl(publicId, 'w_200,h_200,c_thumb,q_auto,f_auto'),
      
      // Original
      original: this.getImageUrl(publicId, 'q_auto,f_auto')
    };
  }
}

export const uploadService = new UploadService(); 