'use client';

import React from 'react';
import Link from 'next/link';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { KYCLevel } from '@/types/kyc';

export default function WalletPage() {
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
              Carteira
            </li>
          </ol>
        </nav>

        <UpgradePrompt
          currentLevel={userKYCLevel}
          requiredLevel={requiredLevel}
          feature="Carteira"
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
            Carteira
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Carteira
        </h1>
        <p className="text-text-secondary">
          Gerencie seus saldos e faça depósitos ou saques
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Carteira - Em Desenvolvimento
        </h2>
        <p className="text-text-secondary max-w-lg mx-auto">
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve. 
          Aqui você poderá gerenciar seus saldos, fazer depósitos e saques de forma segura.
        </p>
      </div>
    </div>
  );
}