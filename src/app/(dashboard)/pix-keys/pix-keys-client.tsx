"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PixKeyCard } from '@/components/pix/PixKeyCard';
import { PixKeysSkeleton } from '@/components/pix/PixKeysSkeleton';
import { 
  PlusIcon, 
  KeyIcon, 
  ShieldCheckIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Chaves PIX</h1>
          <p className="text-text-secondary">
            Gerencie suas chaves PIX para receber pagamentos
          </p>
        </div>
        <PixKeysSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header com gradiente */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amarelo-ouro/20 to-azul-bancario/20 rounded-2xl blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amarelo-ouro/10 rounded-lg">
              <KeyIcon className="w-8 h-8 text-amarelo-ouro" />
            </div>
            <h1 className="text-3xl font-bold">Minhas Chaves PIX</h1>
          </div>
          <p className="text-text-secondary ml-14">
            Gerencie suas chaves PIX para receber pagamentos de forma segura
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-azul-bancario/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-azul-bancario/20 rounded-lg">
                <KeyIcon className="w-5 h-5 text-azul-bancario" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total de Chaves</p>
                <p className="text-2xl font-bold">{keys.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-verde-sucesso/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-verde-sucesso/20 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-verde-sucesso" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Verificadas</p>
                <p className="text-2xl font-bold">{keys.filter(k => k.isActive).length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-gradient-to-br from-amarelo-ouro/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amarelo-ouro/20 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-amarelo-ouro" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Chave Padrão</p>
                <p className="text-2xl font-bold">{keys.filter(k => k.isDefault).length > 0 ? '✓' : '-'}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-vermelho-alerta/10 text-vermelho-alerta rounded-lg flex items-center gap-3"
        >
          <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <Button
          onClick={() => router.push('/pix-keys/new')}
          variant="gradient"
          gradient="primary"
          size="lg"
          className="gap-2 shadow-lg shadow-azul-bancario/20"
        >
          <PlusIcon className="w-5 h-5" />
          Adicionar Chave PIX
        </Button>
      </motion.div>

      {keys.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <KeyIcon className="w-16 h-16 mx-auto mb-4 text-text-secondary/50" />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma chave PIX cadastrada</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Adicione uma chave PIX para começar a receber pagamentos de forma rápida e segura
            </p>
            <Button
              onClick={() => router.push('/pix-keys/new')}
              variant="elevated"
              className="gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Adicionar Primeira Chave
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {keys.map((key) => (
              <motion.div
                key={key.id}
                variants={item}
                layout
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 500, damping: 50 }}
              >
                <PixKeyCard
                  pixKey={key}
                  onDelete={deleteKey}
                  onSetDefault={setDefaultKey}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Card className="p-6 bg-gradient-to-br from-amarelo-ouro/5 to-transparent border-amarelo-ouro/20">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-amarelo-ouro flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amarelo-ouro mb-2">
                Importante sobre Chaves PIX
              </h3>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-amarelo-ouro">•</span>
                  <span>Todas as chaves são verificadas para garantir sua titularidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amarelo-ouro">•</span>
                  <span>Use apenas chaves PIX em seu nome ou de sua empresa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amarelo-ouro">•</span>
                  <span>A chave padrão será usada automaticamente em novos anúncios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amarelo-ouro">•</span>
                  <span>Você pode ter múltiplas chaves cadastradas para maior flexibilidade</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}