"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  PlusIcon, 
  KeyIcon, 
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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

interface PixKeysClientProps {
  userId: string;
}

export function PixKeysClient({ userId }: PixKeysClientProps) {
  const router = useRouter();
  const [keys, setKeys] = useState<PixKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/user/pix-keys');
      if (!response.ok) throw new Error('Erro ao carregar chaves');
      
      const data = await response.json();
      setKeys(data.data?.pixKeys || []);
    } catch (err) {
      setError('Erro ao carregar suas chaves PIX');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm('Tem certeza que deseja remover esta chave PIX?')) return;

    try {
      const response = await fetch(`/api/user/pix-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar chave');
      
      setKeys(keys.filter(key => key.id !== keyId));
    } catch (err) {
      alert('Erro ao remover chave PIX');
      console.error(err);
    }
  };

  const setDefaultKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/user/pix-keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) throw new Error('Erro ao definir chave padrão');
      
      // Atualizar estado local
      setKeys(keys.map(key => ({
        ...key,
        isDefault: key.id === keyId
      })));
    } catch (err) {
      alert('Erro ao definir chave padrão');
      console.error(err);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minhas Chaves PIX</h1>
        <p className="text-muted-foreground">
          Gerencie suas chaves PIX para receber pagamentos
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6">
        <Button
          onClick={() => router.push('/pix-keys/new')}
          variant="gradient"
          gradient="primary"
          size="lg"
          className="gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Adicionar Chave PIX
        </Button>
      </div>

      {keys.length === 0 ? (
        <Card className="p-12 text-center">
          <KeyIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Nenhuma chave PIX cadastrada</h2>
          <p className="text-muted-foreground mb-6">
            Adicione uma chave PIX para começar a receber pagamentos
          </p>
          <Button
            onClick={() => router.push('/pix-keys/new')}
            variant="elevated"
          >
            Adicionar Primeira Chave
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <Card key={key.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {formatPixKey(key.pixKey, key.keyType)}
                    </h3>
                    <Badge variant={key.isDefault ? 'success' : 'secondary'}>
                      {key.isDefault ? 'Padrão' : getKeyTypeLabel(key.keyType)}
                    </Badge>
                    {key.isActive ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircleIcon className="w-3 h-3" />
                        Ativa
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <ExclamationCircleIcon className="w-3 h-3" />
                        Inativa
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Titular:</span> {key.accountHolderName}
                    </p>
                    <p>
                      <span className="font-medium">CPF/CNPJ:</span>{' '}
                      {key.accountHolderDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                    </p>
                    <p>
                      <span className="font-medium">Banco:</span> {key.bankName}
                      {key.bankCode && ` (${key.bankCode})`}
                    </p>
                    {key.lastUsedAt && (
                      <p className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        Último uso: {new Date(key.lastUsedAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!key.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultKey(key.id)}
                      title="Definir como padrão"
                    >
                      Tornar Padrão
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteKey(key.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remover chave"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
          ⚠️ Importante sobre Chaves PIX
        </h3>
        <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
          <li>• Todas as chaves são verificadas para garantir sua titularidade</li>
          <li>• Use apenas chaves PIX em seu nome ou de sua empresa</li>
          <li>• A chave padrão será usada automaticamente em novos anúncios</li>
          <li>• Você pode ter múltiplas chaves cadastradas</li>
        </ul>
      </div>
    </div>
  );
}