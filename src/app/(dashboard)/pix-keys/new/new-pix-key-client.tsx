"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { 
  KeyIcon, 
  ArrowLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface NewPixKeyClientProps {
  userId: string;
}

export function NewPixKeyClient({ userId }: NewPixKeyClientProps) {
  const router = useRouter();
  const [pixKey, setPixKey] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [keyInfo, setKeyInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/user/pix-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixKey, setAsDefault }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao cadastrar chave PIX');
      }

      setSuccess(true);
      setKeyInfo(data.data.pixKey);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/pix-keys');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar chave PIX');
    } finally {
      setLoading(false);
    }
  };

  const detectKeyType = (key: string): string => {
    // Remove formatação
    const cleanKey = key.replace(/\D/g, '');
    
    if (cleanKey.length === 11) return 'CPF';
    if (cleanKey.length === 14) return 'CNPJ';
    if (key.includes('@')) return 'E-mail';
    if (cleanKey.length === 11 && cleanKey.startsWith('55')) return 'Telefone';
    if (key.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      return 'Chave aleatória';
    }
    return 'Indefinido';
  };

  if (success && keyInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-12 text-center">
          <CheckCircleIcon className="w-20 h-20 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-4">Chave PIX Cadastrada!</h2>
          
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
            <p className="text-sm text-muted-foreground mb-2">Detalhes da chave:</p>
            <p className="font-semibold">{keyInfo.pixKey}</p>
            <p className="text-sm text-muted-foreground">
              Tipo: {keyInfo.keyType} • {keyInfo.bankName}
            </p>
            <p className="text-sm text-muted-foreground">
              Titular: {keyInfo.accountHolderName}
            </p>
          </div>

          <p className="text-muted-foreground mb-4">
            Redirecionando para suas chaves PIX...
          </p>

          <Button
            onClick={() => router.push('/pix-keys')}
            variant="elevated"
          >
            Ver Minhas Chaves
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Adicionar Chave PIX</h1>
        <p className="text-muted-foreground">
          Cadastre uma chave PIX para receber pagamentos na plataforma
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pixKey" className="block text-sm font-medium mb-2">
              Chave PIX
            </label>
            <Input
              id="pixKey"
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Digite ou cole sua chave PIX"
              required
              disabled={loading}
              className="w-full"
            />
            {pixKey && (
              <p className="mt-2 text-sm text-muted-foreground">
                Tipo detectado: {detectKeyType(pixKey)}
              </p>
            )}
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p className="font-semibold">Tipos de chave aceitos:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>CPF (apenas números)</li>
                  <li>CNPJ (apenas números)</li>
                  <li>E-mail</li>
                  <li>Telefone celular</li>
                  <li>Chave aleatória (EVP)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="setAsDefault"
              checked={setAsDefault}
              onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
              disabled={loading}
            />
            <label
              htmlFor="setAsDefault"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Definir como chave padrão para recebimentos
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient="primary"
              disabled={loading || !pixKey.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Validando...
                </>
              ) : (
                'Adicionar Chave'
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/20">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
          <KeyIcon className="w-5 h-5 inline mr-2" />
          Importante sobre a validação
        </h3>
        <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400">•</span>
            <span>A chave PIX será validada com o Mercado Pago</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400">•</span>
            <span>Verificaremos se a chave está registrada em seu CPF</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400">•</span>
            <span>Apenas chaves em seu nome serão aceitas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 dark:text-amber-400">•</span>
            <span>Este processo garante a segurança das transações</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}