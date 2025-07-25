'use client';

import { CloudImage } from '@/components/ui/CloudImage';
import { cn } from '@/lib/utils/cn';

interface ListingImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ListingImage({
  src,
  alt,
  className,
  priority = false
}: ListingImageProps) {
  return (
    <div
      className={cn(
        'relative aspect-[3/2] overflow-hidden rounded-lg',
        'bg-gradient-to-br from-gray-100 to-gray-200',
        className
      )}
    >
      <CloudImage
        src={src}
        alt={alt}
        width={600}
        height={400}
        type="listing"
        className="object-cover"
        priority={priority}
      />
    </div>
  );
} 