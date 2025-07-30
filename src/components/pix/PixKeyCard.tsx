"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  KeyIcon,
  TrashIcon,
  StarIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils/cn';

interface PixKey {
  id: string;
  pixKey: string;
  keyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';
  accountHolderName: string;
  accountHolderDoc: string;
  bankName: string;
  bankCode?: string;
  isDefault: boolean;
  isActive: boolean;
  verifiedAt: string;
  lastUsedAt?: string;
  createdAt: string;
}

interface PixKeyCardProps {
  pixKey: PixKey;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function PixKeyCard({ pixKey, onDelete, onSetDefault }: PixKeyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const getKeyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CPF: 'CPF',
      CNPJ: 'CNPJ',
      EMAIL: 'E-mail',
      PHONE: 'Telefone',
      EVP: 'Chave Aleatória'
    };
    return labels[type] || type;
  };

  const getKeyTypeIcon = (type: string) => {
    switch (type) {
      case 'CPF':
      case 'CNPJ':
        return <KeyIcon className="w-5 h-5" />;
      case 'EMAIL':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>;
      case 'PHONE':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>;
      case 'EVP':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>;
      default:
        return <KeyIcon className="w-5 h-5" />;
    }
  };

  const formatPixKey = (key: string, type: string) => {
    if (type === 'CPF') {
      return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (type === 'CNPJ') {
      return key.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    if (type === 'PHONE') {
      return key.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return key;
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover esta chave PIX?')) return;
    setIsDeleting(true);
    await onDelete(pixKey.id);
    setIsDeleting(false);
  };

  const handleSetDefault = async () => {
    setIsSettingDefault(true);
    await onSetDefault(pixKey.id);
    setIsSettingDefault(false);
  };

  return (
    <Card 
      className={cn(
        "p-6 transition-all duration-300 hover:shadow-lg",
        pixKey.isDefault && "ring-2 ring-amarelo-ouro/50 bg-gradient-to-br from-amarelo-ouro/5 to-transparent"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header com chave e badges */}
          <div className="flex items-start gap-4 mb-4">
            <div className={cn(
              "p-3 rounded-lg",
              pixKey.isDefault ? "bg-amarelo-ouro/10" : "bg-gray-100 dark:bg-gray-800"
            )}>
              {getKeyTypeIcon(pixKey.keyType)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold font-mono">
                  {formatPixKey(pixKey.pixKey, pixKey.keyType)}
                </h3>
                {pixKey.isDefault && (
                  <Badge variant="warning" className="gap-1">
                    <StarIconSolid className="w-3 h-3" />
                    Padrão
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1.5">
                  {getKeyTypeIcon(pixKey.keyType)}
                  {getKeyTypeLabel(pixKey.keyType)}
                </Badge>
                
                {pixKey.isActive ? (
                  <Badge variant="success" className="gap-1">
                    <CheckBadgeIcon className="w-4 h-4" />
                    Verificada
                  </Badge>
                ) : (
                  <Badge variant="danger" className="gap-1">
                    <XCircleIcon className="w-4 h-4" />
                    Inativa
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Informações detalhadas */}
          <div className="space-y-2 ml-16">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Titular:</span> 
              <span className="text-text-primary">{pixKey.accountHolderName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span className="font-medium">CPF/CNPJ:</span>
              <span className="text-text-primary font-mono">
                {pixKey.accountHolderDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <BuildingLibraryIcon className="w-4 h-4" />
              <span className="font-medium">Banco:</span>
              <span className="text-text-primary">
                {pixKey.bankName}
                {pixKey.bankCode && <span className="text-text-secondary"> ({pixKey.bankCode})</span>}
              </span>
            </div>

            {pixKey.lastUsedAt && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <ClockIcon className="w-4 h-4" />
                <span>Último uso em {new Date(pixKey.lastUsedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 ml-4">
          {!pixKey.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetDefault}
              disabled={isSettingDefault}
              className="gap-1.5"
              title="Definir como padrão"
            >
              {isSettingDefault ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              ) : (
                <>
                  <StarIcon className="w-4 h-4" />
                  Tornar Padrão
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-vermelho-alerta hover:text-vermelho-alerta hover:bg-vermelho-alerta/10"
            title="Remover chave"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vermelho-alerta" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}