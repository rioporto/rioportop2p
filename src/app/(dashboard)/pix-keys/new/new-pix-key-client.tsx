"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { 
  KeyIcon, 
  ArrowLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  QrCodeIcon,
  BanknotesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface NewPixKeyClientProps {
  userId: string;
}

type KeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP' | null;

export function NewPixKeyClient({ userId }: NewPixKeyClientProps) {
  const router = useRouter();
  const [pixKey, setPixKey] = useState('');
  const [formattedKey, setFormattedKey] = useState('');
  const [keyType, setKeyType] = useState<KeyType>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [keyInfo, setKeyInfo] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Detectar e formatar chave em tempo real
  useEffect(() => {
    const { type, formatted, valid } = detectAndFormatKey(pixKey);
    setKeyType(type);
    setFormattedKey(formatted);
    setIsValid(valid);
    setError(null);
  }, [pixKey]);

  const detectAndFormatKey = (key: string): { type: KeyType, formatted: string, valid: boolean } => {
    const cleanKey = key.replace(/\D/g, '');
    
    // CPF
    if (cleanKey.length <= 11 && /^\d+$/.test(cleanKey)) {
      const formatted = cleanKey
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
      return { type: 'CPF', formatted, valid: cleanKey.length === 11 };
    }
    
    // CNPJ
    if (cleanKey.length > 11 && cleanKey.length <= 14 && /^\d+$/.test(cleanKey)) {
      const formatted = cleanKey
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
      return { type: 'CNPJ', formatted, valid: cleanKey.length === 14 };
    }
    
    // Email
    if (key.includes('@') && key.includes('.')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return { type: 'EMAIL', formatted: key.toLowerCase(), valid: emailRegex.test(key) };
    }
    
    // Phone
    if (cleanKey.length >= 10 && cleanKey.length <= 11 && /^\d+$/.test(cleanKey)) {
      const formatted = cleanKey.length === 11
        ? cleanKey.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        : cleanKey.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      return { type: 'PHONE', formatted, valid: cleanKey.length === 10 || cleanKey.length === 11 };
    }
    
    // EVP (UUID)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (uuidRegex.test(key)) {
      return { type: 'EVP', formatted: key.toLowerCase(), valid: true };
    }
    
    return { type: null, formatted: key, valid: false };
  };

  const getKeyTypeIcon = (type: KeyType) => {
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
        return <QrCodeIcon className="w-5 h-5" />;
      default:
        return <KeyIcon className="w-5 h-5" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('Por favor, insira uma chave PIX válida');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/user/pix-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixKey: formattedKey, setAsDefault }),
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

  if (success && keyInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <Card className="p-12 text-center bg-gradient-to-br from-verde-sucesso/5 to-transparent">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
            >
              <CheckCircleIcon className="w-24 h-24 mx-auto mb-6 text-verde-sucesso" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-4">Chave PIX Cadastrada!</h2>
              
              <Card className="mb-6 p-6 bg-white dark:bg-gray-900 text-left">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-verde-sucesso/10 rounded-lg">
                    {getKeyTypeIcon(keyInfo.keyType as KeyType)}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-lg font-semibold mb-1">{keyInfo.pixKey}</p>
                    <p className="text-sm text-text-secondary mb-3">
                      {keyInfo.keyType} • {keyInfo.bankName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="gap-1">
                        <CheckCircleIcon className="w-3 h-3" />
                        Verificada
                      </Badge>
                      {keyInfo.isDefault && (
                        <Badge variant="warning">Chave Padrão</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <p className="text-text-secondary mb-6">
                Redirecionando em 3 segundos...
              </p>

              <Button
                onClick={() => router.push('/pix-keys')}
                variant="gradient"
                gradient="primary"
                size="lg"
                className="gap-2"
              >
                <BanknotesIcon className="w-5 h-5" />
                Ver Minhas Chaves
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 hover:gap-3 transition-all"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-azul-bancario/10 rounded-lg">
            <KeyIcon className="w-8 h-8 text-azul-bancario" />
          </div>
          <h1 className="text-3xl font-bold">Adicionar Chave PIX</h1>
        </div>
        <p className="text-text-secondary ml-14">
          Cadastre uma chave PIX para receber pagamentos na plataforma
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="pixKey" className="block text-sm font-medium mb-3">
                Chave PIX
              </label>
              <div className="relative">
                <Input
                  id="pixKey"
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="Digite ou cole sua chave PIX"
                  required
                  disabled={loading}
                  className={cn(
                    "w-full pl-12 font-mono",
                    isValid === true && "border-verde-sucesso focus:border-verde-sucesso",
                    isValid === false && pixKey && "border-vermelho-alerta focus:border-vermelho-alerta"
                  )}
                />
                <div className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
                  isValid === true && "text-verde-sucesso",
                  isValid === false && pixKey && "text-vermelho-alerta",
                  !pixKey && "text-text-secondary"
                )}>
                  {getKeyTypeIcon(keyType)}
                </div>
                {isValid === true && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-verde-sucesso" />
                )}
                {isValid === false && pixKey && (
                  <ExclamationCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vermelho-alerta" />
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {keyType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={isValid ? "success" : "secondary"}>
                          {keyType}
                        </Badge>
                        <span className="text-sm font-mono text-text-secondary">
                          {formattedKey}
                        </span>
                      </div>
                      {isValid === false && (
                        <span className="text-xs text-vermelho-alerta">
                          Formato inválido
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-gradient-to-br from-azul-bancario/5 to-transparent rounded-lg border border-azul-bancario/20"
            >
              <div className="flex gap-3">
                <InformationCircleIcon className="w-5 h-5 text-azul-bancario flex-shrink-0 mt-0.5" />
                <div className="text-sm text-text-secondary space-y-2">
                  <p className="font-semibold text-azul-bancario">Tipos de chave aceitos:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'CPF', example: '123.456.789-00' },
                      { type: 'CNPJ', example: '12.345.678/0001-00' },
                      { type: 'E-mail', example: 'seu@email.com' },
                      { type: 'Telefone', example: '(11) 98765-4321' },
                      { type: 'Chave aleatória', example: 'UUID' }
                    ].map((item) => (
                      <div key={item.type} className="flex items-center gap-2">
                        <SparklesIcon className="w-3 h-3 text-azul-bancario" />
                        <span className="font-medium">{item.type}</span>
                        <span className="text-text-secondary/70 text-xs">{item.example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              onClick={() => setSetAsDefault(!setAsDefault)}
            >
              <Checkbox
                id="setAsDefault"
                checked={setAsDefault}
                onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
                disabled={loading}
                className="cursor-pointer"
              />
              <label
                htmlFor="setAsDefault"
                className="text-sm font-medium leading-none cursor-pointer select-none"
              >
                Definir como chave padrão para recebimentos
              </label>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-vermelho-alerta/10 text-vermelho-alerta rounded-lg text-sm flex items-center gap-2"
                >
                  <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
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
                disabled={loading || !isValid}
                className="flex-1 gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Validando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Adicionar Chave
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="mt-6 p-6 bg-gradient-to-br from-amarelo-ouro/5 to-transparent border-amarelo-ouro/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amarelo-ouro/10 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-amarelo-ouro" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amarelo-ouro mb-3">
                Segurança e Validação
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amarelo-ouro flex-shrink-0 mt-0.5" />
                  <span>A chave PIX será validada automaticamente com o Mercado Pago</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amarelo-ouro flex-shrink-0 mt-0.5" />
                  <span>Verificamos se a chave está registrada em seu CPF/CNPJ</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amarelo-ouro flex-shrink-0 mt-0.5" />
                  <span>Apenas chaves em seu nome serão aceitas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amarelo-ouro flex-shrink-0 mt-0.5" />
                  <span>Este processo garante a segurança de todas as transações</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}