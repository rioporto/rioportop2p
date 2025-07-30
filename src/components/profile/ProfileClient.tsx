'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KYCBadge } from '@/components/ui/KYCBadge';
import { KYCLevel, KYC_LEVELS } from '@/types/kyc';
import { SimpleLogoutButton } from '@/components/ui/SimpleLogoutButton';
import { useUser } from '@stackframe/stack';

export function ProfileClient() {
  const stackUser = useUser();
  const [userLevel, setUserLevel] = useState(KYCLevel.BASIC);
  
  // Usar dados reais do Stack Auth quando disponível
  const userInfo = {
    name: stackUser?.displayName || 'Usuário',
    email: stackUser?.primaryEmail || 'usuario@example.com',
    cpf: '***.***.***-**',
    createdAt: '15/01/2024',
  };

  const kycRequirements = {
    [KYCLevel.BASIC]: [
      { label: 'Email verificado', completed: true },
      { label: 'Nome completo', completed: true },
      { label: 'CPF', completed: true },
    ],
    [KYCLevel.INTERMEDIATE]: [
      { label: 'Documento de identidade', completed: false },
      { label: 'Comprovante de endereço', completed: false },
    ],
    [KYCLevel.ADVANCED]: [
      { label: 'Selfie com documento', completed: false },
      { label: 'Verificação adicional', completed: false },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto">
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
            Perfil & KYC
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Perfil & KYC
        </h1>
        <p className="text-text-secondary">
          Gerencie suas informações pessoais e níveis de verificação
        </p>
      </div>

      {/* Profile Info */}
      <div className="skeuomorphic-card p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Informações Pessoais
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Nome</span>
            <span className="font-medium text-text-primary">{userInfo.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Email</span>
            <span className="font-medium text-text-primary">{userInfo.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">CPF</span>
            <span className="font-medium text-text-primary">{userInfo.cpf}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Membro desde</span>
            <span className="font-medium text-text-primary">{userInfo.createdAt}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Nível KYC</span>
            <KYCBadge level={userLevel} showDescription />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="skeuomorphic-card p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Ações da Conta
        </h2>
        
        <div className="space-y-3">
          <Link 
            href="/profile/edit" 
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            Editar Informações
          </Link>
          
          <Link 
            href="/profile/security" 
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            Segurança e Privacidade
          </Link>
          
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <SimpleLogoutButton className="w-full justify-center" />
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <div className="skeuomorphic-card p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6">
          Status de Verificação KYC
        </h2>

        <div className="space-y-6">
          {Object.entries(KYC_LEVELS).map(([level, info]) => {
            const levelNum = parseInt(level);
            const isCurrentLevel = levelNum === userLevel;
            const isCompleted = levelNum <= userLevel;
            const requirements = kycRequirements[levelNum as keyof typeof kycRequirements] || [];

            return (
              <div 
                key={level}
                className={`border rounded-lg p-4 transition-all
                  ${isCurrentLevel ? 'border-primary bg-primary/5' : 'border-background'}
                  ${isCompleted ? 'opacity-100' : 'opacity-60'}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${isCompleted ? 'bg-secondary text-white' : 'bg-background text-text-secondary'}
                    `}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="font-semibold">{levelNum}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{info.name}</h3>
                      <p className="text-sm text-text-secondary">{info.description}</p>
                    </div>
                  </div>
                  <KYCBadge level={levelNum} size="sm" />
                </div>

                {/* Benefícios */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-text-primary mb-2">Benefícios:</p>
                  <ul className="text-sm text-text-secondary space-y-1">
                    {info.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requisitos */}
                {requirements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-2">Requisitos:</p>
                    <ul className="text-sm space-y-1">
                      {requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <svg 
                            className={`w-4 h-4 flex-shrink-0 ${req.completed ? 'text-secondary' : 'text-text-secondary'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            {req.completed ? (
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            )}
                          </svg>
                          <span className={req.completed ? 'text-text-primary' : 'text-text-secondary'}>
                            {req.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botão de Upgrade */}
                {!isCompleted && levelNum === userLevel + 1 && (
                  <button 
                    className="mt-4 w-full px-4 py-2 bg-primary text-white rounded-lg font-medium
                             hover:bg-opacity-90 transition-colors skeuomorphic-button"
                    onClick={() => {
                      // Simulação de upgrade - será substituído por lógica real
                      alert('Iniciando processo de verificação para ' + info.name);
                    }}
                  >
                    Fazer Upgrade para {info.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}