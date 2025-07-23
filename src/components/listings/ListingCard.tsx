'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IListing, PaymentMethod } from '@/types/listings';

interface IListingCardProps {
  listing: IListing;
  onSelect?: (listing: IListing) => void;
  showActions?: boolean;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  PIX: 'PIX',
  TED: 'TED',
  BANK_TRANSFER: 'Transferência Bancária'
};

const cryptoSymbols: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether',
  USDC: 'USD Coin'
};

export function ListingCard({ listing, onSelect, showActions = true }: IListingCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: listing.fiatCurrency
    }).format(value);
  };

  const formatCrypto = (value: number) => {
    return `${value.toFixed(8)} ${listing.cryptocurrency}`;
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant={listing.type === 'BUY' ? 'success' : 'default'}
              className={listing.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
            >
              {listing.type === 'BUY' ? 'Compra' : 'Venda'}
            </Badge>
            <span className="font-semibold text-lg">
              {cryptoSymbols[listing.cryptocurrency] || listing.cryptocurrency}
            </span>
          </div>
          
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(listing.pricePerUnit)}
          </div>
          <div className="text-sm text-gray-500">
            por {listing.cryptocurrency}
          </div>
        </div>

        {listing.user && (
          <div className="text-right">
            <div className="font-medium text-gray-900">{listing.user.name}</div>
            {listing.user.reputation && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-yellow-500">★</span>
                <span>{listing.user.reputation.toFixed(1)}</span>
              </div>
            )}
            {listing.user.completedTrades && (
              <div className="text-xs text-gray-500">
                {listing.user.completedTrades} negociações
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Limites:</span>
          <span className="font-medium">
            {formatCurrency(listing.minAmount)} - {formatCurrency(listing.maxAmount)}
          </span>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-2">Métodos de pagamento:</div>
          <div className="flex flex-wrap gap-2">
            {listing.paymentMethods.map((method) => (
              <Badge key={method} variant="secondary" className="text-xs">
                {paymentMethodLabels[method]}
              </Badge>
            ))}
          </div>
        </div>

        {listing.terms && (
          <div className="text-sm text-gray-600 italic">
            "{listing.terms}"
          </div>
        )}

        {showActions && (
          <div className="pt-4">
            <Button
              onClick={() => onSelect?.(listing)}
              className="w-full"
              variant={listing.type === 'BUY' ? 'primary' : 'default'}
            >
              {listing.type === 'BUY' ? 'Vender' : 'Comprar'} {listing.cryptocurrency}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}