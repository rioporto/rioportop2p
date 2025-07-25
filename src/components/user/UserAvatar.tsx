'use client';

import { CloudImage } from '@/components/ui/CloudImage';
import { cn } from '@/lib/utils/cn';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 }
};

export function UserAvatar({
  src,
  name,
  size = 'md',
  className
}: UserAvatarProps) {
  const { width, height } = sizes[size];
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!src) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-blue-500 to-purple-600',
          'flex items-center justify-center text-white font-medium',
          className
        )}
        style={{ width, height }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={cn('rounded-full overflow-hidden', className)}>
      <CloudImage
        src={src}
        alt={name}
        width={width}
        height={height}
        type="avatar"
      />
    </div>
  );
} 