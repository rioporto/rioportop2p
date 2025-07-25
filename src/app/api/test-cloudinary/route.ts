import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET() {
  try {
    // Testar conexão
    const ping = await cloudinary.api.ping();
    
    // Obter uso do plano
    const usage = await cloudinary.api.usage();
    
    // Listar últimas imagens (se houver)
    const resources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 5,
    });

    return NextResponse.json({
      status: 'connected',
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      ping,
      usage: {
        storage: {
          used_gb: (usage.storage.usage / 1024 / 1024 / 1024).toFixed(2),
          limit_gb: 25,
          percent: ((usage.storage.usage / 1024 / 1024 / 1024) / 25 * 100).toFixed(1)
        },
        bandwidth: {
          used_gb: (usage.bandwidth.usage / 1024 / 1024 / 1024).toFixed(2),
          limit_gb: 25,
          percent: ((usage.bandwidth.usage / 1024 / 1024 / 1024) / 25 * 100).toFixed(1)
        },
        transformations: usage.transformations
      },
      recent_uploads: resources.resources.map((r: any) => ({
        public_id: r.public_id,
        url: r.secure_url,
        created_at: r.created_at,
        format: r.format,
        size_kb: (r.bytes / 1024).toFixed(2)
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Cloudinary connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}