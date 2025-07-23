'use client';

import React from 'react';
import { KYCLevel, KYC_LEVELS } from '@/types/kyc';

interface IKYCBadgeProps {
  level: KYCLevel;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const KYCBadge: React.FC<IKYCBadgeProps> = ({ 
  level, 
  showDescription = false,
  size = 'md' 
}) => {
  const levelInfo = KYC_LEVELS[level];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span 
        className={`
          inline-flex items-center font-medium rounded-full
          ${sizeClasses[size]}
          ${levelInfo.bgColor} ${levelInfo.color}
          shadow-sm hover:shadow-md transition-shadow duration-200
          border border-opacity-20 border-current
        `}
      >
        <span className="flex items-center gap-1">
          <svg 
            className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" 
              clipRule="evenodd"
            />
          </svg>
          {levelInfo.name}
        </span>
      </span>
      
      {showDescription && (
        <span className="text-sm text-text-secondary">
          {levelInfo.description}
        </span>
      )}
    </div>
  );
};