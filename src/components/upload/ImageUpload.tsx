'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { CameraIcon, UploadIcon, XIcon } from '@/components/icons';

interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // em bytes
  accept?: string;
  className?: string;
}

export function ImageUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/jpeg,image/png,image/webp',
  className
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    setError(null);

    // Validar número máximo de arquivos
    if (selectedFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitido`);
      return;
    }

    // Validar tamanho e tipo dos arquivos
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    Array.from(selectedFiles).forEach(file => {
      if (file.size > maxSize) {
        setError(`Arquivo ${file.name} excede ${maxSize / 1024 / 1024}MB`);
        return;
      }

      if (!accept.includes(file.type)) {
        setError(`Tipo de arquivo não permitido: ${file.type}`);
        return;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
      setPreviews(validPreviews);
      setUploadProgress(new Array(validFiles.length).fill(0));
    }
  }, [maxFiles, maxSize, accept]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = async () => {
    try {
      await onUpload(files);
      // Limpar após upload bem sucedido
      setFiles([]);
      setPreviews([]);
      setUploadProgress([]);
    } catch (err) {
      setError('Erro ao fazer upload das imagens');
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    const newProgress = [...uploadProgress];

    // Revogar URL do preview
    URL.revokeObjectURL(previews[index]);

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    newProgress.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
    setUploadProgress(newProgress);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Área de Drop */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative w-full min-h-[200px] p-6 rounded-xl',
          'border-2 border-dashed border-gray-300',
          'bg-gradient-to-b from-gray-50 to-white',
          'shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]',
          'transition-all duration-200 ease-in-out',
          'cursor-pointer hover:border-blue-400',
          isDragging && 'border-blue-500 bg-blue-50',
          'flex flex-col items-center justify-center gap-4'
        )}
      >
        {files.length === 0 ? (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <CameraIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                Arraste imagens aqui
              </p>
              <p className="text-sm text-gray-500">
                ou clique para selecionar
              </p>
              <p className="mt-2 text-xs text-gray-400">
                JPG, PNG ou WEBP até {maxSize / 1024 / 1024}MB
              </p>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {previews.map((preview, index) => (
              <div
                key={preview}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                {/* Preview da Imagem */}
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Barra de Progresso */}
                {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress[index]}%` }}
                    />
                  </div>
                )}

                {/* Botão Remover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className={cn(
                    'absolute top-2 right-2',
                    'w-6 h-6 rounded-full',
                    'bg-white/80 backdrop-blur-sm',
                    'flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100',
                    'transition-opacity duration-200',
                    'hover:bg-red-500 hover:text-white'
                  )}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input File (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Erro */}
      {error && (
        <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Botão Upload */}
      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          className="mt-4 w-full"
          size="lg"
        >
          <UploadIcon className="w-5 h-5 mr-2" />
          Fazer Upload ({files.length} {files.length === 1 ? 'arquivo' : 'arquivos'})
        </Button>
      )}
    </div>
  );
} 