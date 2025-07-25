import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/api/response';
import { prisma } from '@/lib/db/prisma';

interface CloudinaryWebhookBody {
  notification_type: string;
  public_id: string;
  moderation_status?: 'approved' | 'rejected' | 'pending';
  moderation?: {
    status: string;
    kind: string;
    response: any[];
  };
}

export async function POST(req: NextRequest) {
  try {
    // Verificar assinatura do webhook (TODO: implementar)
    
    const body = (await req.json()) as CloudinaryWebhookBody;

    // Processar notificação de moderação
    if (body.notification_type === 'moderation') {
      const imageId = body.public_id;
      const status = body.moderation_status;

      // Atualizar status no banco
      await prisma.uploadedImage.update({
        where: { cloudinaryId: imageId },
        data: {
          moderationStatus: status,
          moderationDetails: body.moderation
        }
      });

      // Se rejeitado, notificar admin
      if (status === 'rejected') {
        // TODO: Implementar notificação
        console.warn(`Imagem rejeitada: ${imageId}`);
      }
    }

    return ApiResponse.success({ received: true });
  } catch (error) {
    console.error('Erro no webhook Cloudinary:', error);
    return ApiResponse.internalError('Erro ao processar webhook');
  }
} 