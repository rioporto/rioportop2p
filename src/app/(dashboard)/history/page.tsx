'use client';

import React from 'react';
import Link from 'next/link';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { KYCLevel } from '@/types/kyc';

export default function HistoryPage() {
  // Mock user level - será substituído por dados reais
  const userKYCLevel = KYCLevel.BASIC;
  const requiredLevel = KYCLevel.BASIC;

  const canAccess = userKYCLevel >= requiredLevel;

  if (!canAccess) {
    return (
      <div className="max-w-4xl mx-auto">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-primary hover:text-opacity-80 transition-colors">
                Dashboard
              </Link>
            </li>
            <li className="text-text-secondary">
              <span className="mx-2">/</span>
              Histórico
            </li>
          </ol>
        </nav>

        <UpgradePrompt
          currentLevel={userKYCLevel}
          requiredLevel={requiredLevel}
          feature="Histórico de Transações"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-primary hover:text-opacity-80 transition-colors">
              Dashboard
            </Link>
          </li>
          <li className="text-text-secondary">
            <span className="mx-2">/</span>
            Histórico
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Histórico
        </h1>
        <p className="text-text-secondary">
          Visualize todas as suas transações e negociações
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="skeuomorphic-card p-12 text-center">
        <svg 
          className="w-24 h-24 text-text-secondary mx-auto mb-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Histórico - Em Desenvolvimento
        </h2>
        <p className="text-text-secondary max-w-lg mx-auto">
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve. 
          Aqui você poderá visualizar todo o histórico de suas transações e negociações.
        </p>
      </div>
    </div>
  );
}