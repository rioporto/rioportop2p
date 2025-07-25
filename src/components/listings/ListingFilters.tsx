'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IListingFilters, ListingType, PaymentMethod } from '@/types/listings';

interface IListingFiltersProps {
  filters: IListingFilters;
  onFiltersChange: (filters: IListingFilters) => void;
  onReset?: () => void;
}

const cryptocurrencies = [
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'USDT', label: 'Tether' },
  { value: 'USDC', label: 'USD Coin' }
];

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'PIX', label: 'PIX' },
  { value: 'TED', label: 'TED' },
  { value: 'BANK_TRANSFER', label: 'Transferência Bancária' }
];

export function ListingFilters({ filters, onFiltersChange, onReset }: IListingFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IListingFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof IListingFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters: IListingFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    onReset?.();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Anúncio
          </label>
          <div className="flex gap-2">
            <Button
              variant={localFilters.type === 'BUY' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('type', localFilters.type === 'BUY' ? undefined : 'BUY')}
            >
              Compra
            </Button>
            <Button
              variant={localFilters.type === 'SELL' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('type', localFilters.type === 'SELL' ? undefined : 'SELL')}
            >
              Venda
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Criptomoeda
          </label>
          <select
            value={localFilters.cryptocurrency || ''}
            onChange={(e) => handleFilterChange('cryptocurrency', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {cryptocurrencies.map((crypto) => (
              <option key={crypto.value} value={crypto.value}>
                {crypto.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pagamento
          </label>
          <select
            value={localFilters.paymentMethod || ''}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor Mínimo (R$)
          </label>
          <Input
            type="number"
            placeholder="0,00"
            value={localFilters.minAmount || ''}
            onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor Máximo (R$)
          </label>
          <Input
            type="number"
            placeholder="0,00"
            value={localFilters.maxAmount || ''}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="pt-4 flex gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="flex-1"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}