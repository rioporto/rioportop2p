'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from './StatusBadge';
import { EscrowStatus } from './EscrowStatus';
import { cn } from '@/lib/utils/cn';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Hash,
  User,
  CreditCard,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { TransactionStatus, ListingType, EscrowStatus as EscrowStatusType } from '@prisma/client';

interface ITransactionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface ITransactionListing {
  id: string;
  type: ListingType;
  cryptocurrency: string;
  fiatCurrency: string;
  pricePerUnit: number | string;
}

interface ITransactionPaymentMethod {
  id: string;
  paymentType: string;
  displayName: string;
}

interface ITransactionEscrow {
  id: string;
  status: EscrowStatusType;
  cryptoAmount: number | string;
  releasedAt?: Date | string | null;
}

export interface ITransactionCardProps {
  id: string;
  listing: ITransactionListing;
  buyer: ITransactionUser;
  seller: ITransactionUser;
  amount: number | string;
  pricePerUnit: number | string;
  totalPrice: number | string;
  status: TransactionStatus;
  paymentMethod: ITransactionPaymentMethod;
  escrow?: ITransactionEscrow | null;
  createdAt: Date | string;
  completedAt?: Date | string | null;
  currentUserId: string;
  onClick?: () => void;
  className?: string;
}

export function TransactionCard({
  id,
  listing,
  buyer,
  seller,
  amount,
  pricePerUnit,
  totalPrice,
  status,
  paymentMethod,
  escrow,
  createdAt,
  completedAt,
  currentUserId,
  onClick,
  className
}: ITransactionCardProps) {
  // Determinar se o usuário atual é comprador ou vendedor
  const isBuyer = currentUserId === buyer.id;
  const role = isBuyer ? 'buyer' : 'seller';
  const counterparty = isBuyer ? seller : buyer;
  
  // Determinar o tipo de operação baseado no papel do usuário
  const operationType = isBuyer ? 'COMPRA' : 'VENDA';
  const operationIcon = isBuyer ? <ArrowUpRight /> : <ArrowDownLeft />;
  const operationColor = isBuyer ? 'text-green-600' : 'text-red-600';
  const operationBg = isBuyer ? 'bg-green-50' : 'bg-red-50';

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: listing.fiatCurrency
    }).format(numValue);
  };

  return (
    <Card
      variant="default"
      interactive={!!onClick}
      onClick={onClick}
      className={cn('relative overflow-hidden', className)}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Operation Type Indicator */}
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              operationBg
            )}>
              <div className={cn('w-5 h-5', operationColor)}>
                {operationIcon}
              </div>
            </div>
            
            {/* Transaction Info */}
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {operationType} de {listing.cryptocurrency}
                {isBuyer ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Hash className="w-3.5 h-3.5" />
                <span className="font-mono">{id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <StatusBadge status={status} type="transaction" />
        </div>

        {/* Transaction Details */}
        <div className="space-y-3 mb-4">
          {/* Counterparty */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {isBuyer ? 'Vendedor' : 'Comprador'}:
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {counterparty.firstName} {counterparty.lastName}
            </span>
          </div>

          {/* Amount & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Quantidade</p>
              <p className="font-semibold text-gray-900">
                {amount} {listing.cryptocurrency}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Preço Unitário</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(pricePerUnit)}
              </p>
            </div>
          </div>

          {/* Total Price */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Valor Total</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Pagamento:</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {paymentMethod.displayName}
            </span>
          </div>
        </div>

        {/* Escrow Status */}
        {escrow && (
          <div className="mb-4">
            <EscrowStatus
              status={escrow.status}
              amount={escrow.cryptoAmount}
              cryptocurrency={listing.cryptocurrency}
              releasedAt={escrow.releasedAt}
              showDetails={false}
            />
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Criada em {formatDate(createdAt)}</span>
            </div>
            {completedAt && (
              <span className="text-green-600 font-medium">
                Concluída em {formatDate(completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Action Hint */}
        {onClick && (
          <div className="absolute top-2 right-2">
            <span className="text-xs text-gray-400">
              Clique para ver detalhes
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}