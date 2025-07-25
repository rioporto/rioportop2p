'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

interface IListingFormData {
  type: 'BUY' | 'SELL';
  cryptocurrency: string;
  pricePerUnit: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  terms?: string;
}

const CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'USDT', label: 'Tether (USDT)' },
];

const PAYMENT_METHODS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'TED', label: 'TED' },
  { value: 'TRANSFERENCIA', label: 'Transferência Bancária' },
];

export default function NewListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<IListingFormData>({
    defaultValues: {
      type: 'SELL',
      cryptocurrency: 'BTC',
      paymentMethods: [],
    },
  });

  const selectedType = watch('type');
  const selectedPaymentMethods = watch('paymentMethods');

  const handlePaymentMethodToggle = (method: string) => {
    const currentMethods = getValues('paymentMethods');
    if (currentMethods.includes(method)) {
      setValue(
        'paymentMethods',
        currentMethods.filter((m) => m !== method)
      );
    } else {
      setValue('paymentMethods', [...currentMethods, method]);
    }
  };

  const onSubmit = async (data: IListingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao criar anúncio');
      }

      router.push('/listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-text-primary mb-6">
            Criar Novo Anúncio
          </h1>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de Anúncio */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tipo de Anúncio
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="BUY"
                    {...register('type', { required: 'Selecione o tipo' })}
                    className="mr-2"
                  />
                  <span className="text-text-primary">Compra</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="SELL"
                    {...register('type', { required: 'Selecione o tipo' })}
                    className="mr-2"
                  />
                  <span className="text-text-primary">Venda</span>
                </label>
              </div>
              {errors.type && (
                <p className="text-xs text-vermelho-alerta mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Criptomoeda */}
            <div>
              <label
                htmlFor="cryptocurrency"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Criptomoeda
              </label>
              <select
                id="cryptocurrency"
                {...register('cryptocurrency', {
                  required: 'Selecione uma criptomoeda',
                })}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-text-primary focus:border-azul-bancario focus:outline-none"
              >
                {CRYPTOCURRENCIES.map((crypto) => (
                  <option key={crypto.value} value={crypto.value}>
                    {crypto.label}
                  </option>
                ))}
              </select>
              {errors.cryptocurrency && (
                <p className="text-xs text-vermelho-alerta mt-1">
                  {errors.cryptocurrency.message}
                </p>
              )}
            </div>

            {/* Valor por Unidade */}
            <Input
              label="Valor por Unidade (R$)"
              type="number"
              step="0.01"
              {...register('pricePerUnit', {
                required: 'Informe o valor por unidade',
                min: {
                  value: 0.01,
                  message: 'O valor deve ser maior que zero',
                },
              })}
              error={errors.pricePerUnit?.message}
              placeholder="0.00"
            />

            {/* Valores Mínimo e Máximo */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Valor Mínimo (R$)"
                type="number"
                step="0.01"
                {...register('minAmount', {
                  required: 'Informe o valor mínimo',
                  min: {
                    value: 0.01,
                    message: 'O valor deve ser maior que zero',
                  },
                })}
                error={errors.minAmount?.message}
                placeholder="0.00"
              />

              <Input
                label="Valor Máximo (R$)"
                type="number"
                step="0.01"
                {...register('maxAmount', {
                  required: 'Informe o valor máximo',
                  min: {
                    value: 0.01,
                    message: 'O valor deve ser maior que zero',
                  },
                  validate: (value) => {
                    const minAmount = getValues('minAmount');
                    return (
                      value >= minAmount ||
                      'O valor máximo deve ser maior ou igual ao mínimo'
                    );
                  },
                })}
                error={errors.maxAmount?.message}
                placeholder="0.00"
              />
            </div>

            {/* Métodos de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Métodos de Pagamento
              </label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={method.value}
                      checked={selectedPaymentMethods.includes(method.value)}
                      onChange={() => handlePaymentMethodToggle(method.value)}
                      className="mr-3 h-4 w-4 text-azul-bancario focus:ring-azul-bancario"
                    />
                    <span className="text-text-primary">{method.label}</span>
                  </label>
                ))}
              </div>
              {selectedPaymentMethods.length === 0 && (
                <p className="text-xs text-vermelho-alerta mt-1">
                  Selecione pelo menos um método de pagamento
                </p>
              )}
            </div>

            {/* Termos Opcionais */}
            <div>
              <label
                htmlFor="terms"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Termos e Condições (Opcional)
              </label>
              <textarea
                id="terms"
                {...register('terms')}
                rows={4}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-azul-bancario focus:outline-none resize-none"
                placeholder="Adicione termos específicos para sua negociação..."
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="flat"
                onClick={() => router.push('/listings')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="gradient"
                loading={isSubmitting}
                disabled={selectedPaymentMethods.length === 0}
                fullWidth
              >
                {selectedType === 'BUY' ? 'Criar Anúncio de Compra' : 'Criar Anúncio de Venda'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}