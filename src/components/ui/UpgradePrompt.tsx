'use client';

import React from 'react';
import Link from 'next/link';
import { KYCLevel, KYC_LEVELS } from '@/types/kyc';
import { KYCBadge } from './KYCBadge';

interface IUpgradePromptProps {
  currentLevel: KYCLevel;
  requiredLevel: KYCLevel;
  feature: string;
  className?: string;
}

export const UpgradePrompt: React.FC<IUpgradePromptProps> = ({
  currentLevel,
  requiredLevel,
  feature,
  className = ''
}) => {
  const currentInfo = KYC_LEVELS[currentLevel];
  const requiredInfo = KYC_LEVELS[requiredLevel];

  return (
    <div className={`skeuomorphic-card p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg 
            className="w-8 h-8 text-accent" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Upgrade de KYC Necessário
          </h3>
          
          <p className="text-text-secondary mb-4">
            Para acessar <span className="font-medium">{feature}</span>, você precisa fazer upgrade do seu nível de KYC.
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Seu nível:</span>
              <KYCBadge level={currentLevel} size="sm" />
            </div>
            
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Necessário:</span>
              <KYCBadge level={requiredLevel} size="sm" />
            </div>
          </div>
          
          <div className="bg-background rounded-lg p-4 mb-4">
            <h4 className="font-medium text-sm mb-2">
              Benefícios do {requiredInfo.name}:
            </h4>
            <ul className="space-y-1">
              {requiredInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <Link 
            href="/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium
                     hover:bg-opacity-90 transition-all duration-200 skeuomorphic-button"
          >
            Fazer Upgrade Agora
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};