'use client';

import { useState } from 'react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TestCloudinaryPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-2">Teste do Cloudinary</h1>
          <p className="text-muted-foreground mb-6">
            Upload de imagens com CDN global
          </p>

          <div className="space-y-6">
            {/* Widget de Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <CldUploadWidget
                uploadPreset="ml_default" // Preset padrão, funciona sem config
                onUpload={(result: any) => {
                  if (result.info && typeof result.info === 'object') {
                    setUploadedImages(prev => [...prev, result.info.public_id]);
                  }
                }}
                onOpen={() => setIsUploading(true)}
                onClose={() => setIsUploading(false)}
              >
                {({ open }) => (
                  <div className="space-y-4">
                    <div className="text-6xl">📸</div>
                    <Button 
                      onClick={() => open()}
                      variant="elevated"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Enviando...' : 'Selecionar Imagem'}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Clique ou arraste arquivos (máx. 5MB)
                    </p>
                  </div>
                )}
              </CldUploadWidget>
            </div>

            {/* Imagens Enviadas */}
            {uploadedImages.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Imagens Enviadas</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((publicId, index) => (
                    <div key={index} className="relative group">
                      <CldImage
                        src={publicId}
                        width={300}
                        height={200}
                        alt={`Upload ${index + 1}`}
                        crop="fill"
                        className="rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">
                          {publicId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações */}
            <Card className="p-4 bg-secondary">
              <h3 className="font-semibold mb-2">ℹ️ Informações do Teste</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Cloud Name: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</li>
                <li>• Imagens otimizadas automaticamente</li>
                <li>• CDN global para entrega rápida</li>
                <li>• Transformações em tempo real</li>
              </ul>
            </Card>
          </div>
        </Card>

        {/* Teste de Transformações */}
        {uploadedImages.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Transformações Automáticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium mb-2">Avatar (50x50)</h3>
                <CldImage
                  src={uploadedImages[0]}
                  width={50}
                  height={50}
                  crop="fill"
                  gravity="face"
                  className="rounded-full"
                  alt="Avatar"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Thumbnail (200x200)</h3>
                <CldImage
                  src={uploadedImages[0]}
                  width={200}
                  height={200}
                  crop="thumb"
                  className="rounded-lg"
                  alt="Thumbnail"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Banner (600x200)</h3>
                <CldImage
                  src={uploadedImages[0]}
                  width={600}
                  height={200}
                  crop="fill"
                  className="rounded-lg"
                  alt="Banner"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}