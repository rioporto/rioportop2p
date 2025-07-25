'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { uploadService } from '@/services/upload.service';

export default function TestUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    publicId: string;
  }>>([]);

  const handleUpload = async (files: File[]) => {
    try {
      const results = await uploadService.uploadImages(files);
      
      setUploadedImages(prev => [
        ...prev,
        ...results.map(result => ({
          url: result.url,
          publicId: result.publicId
        }))
      ]);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload das imagens');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-8">Teste de Upload</h1>

      {/* Componente de Upload */}
      <div className="mb-8">
        <ImageUpload onUpload={handleUpload} />
      </div>

      {/* Grid de Imagens Enviadas */}
      {uploadedImages.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Imagens Enviadas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={image.publicId}
                className="aspect-square rounded-lg overflow-hidden shadow-lg"
              >
                <img
                  src={uploadService.getImageUrls(image.publicId).thumbnail}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 