'use client';

import { CldImage } from 'next-cloudinary';

interface CloudImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  type?: 'avatar' | 'listing' | 'thumbnail';
}

export function CloudImage({
  src,
  alt,
  width,
  height,
  className,
  type = 'thumbnail'
}: CloudImageProps) {
  // Configurações específicas para cada tipo
  const imageConfigs = {
    avatar: {
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'auto'
    },
    listing: {
      crop: 'fill',
      quality: 'auto:good',
      format: 'auto'
    },
    thumbnail: {
      crop: 'thumb',
      quality: 'auto',
      format: 'auto'
    }
  };

  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...imageConfigs[type]}
      className={className}
    />
  );
} 