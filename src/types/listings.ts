export type ListingType = 'BUY' | 'SELL';

export type PaymentMethod = 'PIX' | 'TED' | 'BANK_TRANSFER';

export interface IListing {
  id: string;
  userId: string;
  type: ListingType;
  cryptocurrency: string;
  fiatCurrency: string;
  pricePerUnit: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: PaymentMethod[];
  terms?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    reputation?: number;
    completedTrades?: number;
  };
}

export interface IListingFilters {
  type?: ListingType;
  cryptocurrency?: string;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
}