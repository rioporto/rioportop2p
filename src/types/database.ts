// Re-export Prisma types
export type {
  User,
  UserProfile,
  UserDocument,
  UserDevice,
  UserSession,
  Wallet,
  WalletBalance,
  BlockchainTransaction,
  DepositAddress,
  WithdrawalWhitelist,
  TradingPair,
  Order,
  Trade,
  P2PAd,
  P2PTrade,
  PaymentMethod,
  PixTransaction,
  BankReconciliation,
  AmlMonitoring,
  TaxReport,
  OperationalLimits,
  AuditLog,
  SystemEvent,
  PaymentMethodType,
  Listing,
  ListingPaymentMethod,
  Transaction,
  Escrow,
  Conversation,
  Message,
  Rating,
  UserReputation,
  AnalyticsEvent,
  AnalyticsAggregate,
  AnalyticsSession
} from '@prisma/client';

export {
  KYCLevel,
  UserStatus,
  TwoFactorMethod,
  DocumentType,
  ValidationStatus,
  WalletType,
  WalletStatus,
  TransactionType,
  BlockchainTransactionStatus,
  OrderType,
  OrderSide,
  TimeInForce,
  OrderStatus,
  TradeMode,
  PaymentType,
  PixKeyType,
  P2PAdType,
  PriceType,
  P2PAdStatus,
  ListingType,
  P2PTradeStatus,
  TransactionStatus,
  EscrowStatus,
  MessageType,
  AnalysisType,
  RiskLevel
} from '@prisma/client';

// Custom types for common operations
export interface ICreateUserInput {
  email: string;
  password: string;
  cpf: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  termsAcceptedAt?: Date;
  privacyAcceptedAt?: Date;
  marketingConsent?: boolean;
  referralCode?: string;
}

export interface IUpdateKYCInput {
  userId: string;
  kycLevel: KYCLevel;
  documents?: {
    type: DocumentType;
    documentNumber?: string;
    documentFrontUrl?: string;
    documentBackUrl?: string;
    selfieUrl?: string;
    proofOfResidenceUrl?: string;
  }[];
  profile?: {
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
  };
}

export interface ICreateWalletInput {
  userId: string;
  currency: string;
  address: string;
  tag?: string;
  publicKey?: string;
  derivationPath?: string;
  walletIndex?: number;
  label?: string;
}

export interface ICreateOrderInput {
  userId: string;
  tradingPairId: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
  tradeMode: TradeMode;
  clientOrderId?: string;
}

export interface ICreateP2PAdInput {
  userId: string;
  adType: P2PAdType;
  currency: string;
  fiatCurrency?: string;
  priceType: PriceType;
  fixedPrice?: number;
  marginPercent?: number;
  minAmount: number;
  maxAmount: number;
  availableAmount: number;
  paymentMethods: any[];
  paymentTimeLimit?: number;
  terms?: string;
  autoReplyMessage?: string;
  requireKycLevel?: KYCLevel;
  minTrades?: number;
  minCompletionRate?: number;
}

export interface ICreateP2PTradeInput {
  adId: string;
  buyerId: string;
  sellerId: string;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  feeAmount: number;
  paymentMethod: any;
  paymentDeadline: Date;
}

export interface ICreatePixTransactionInput {
  userId: string;
  paymentMethodId?: string;
  orderId?: string;
  p2pTradeId?: string;
  transactionType: string;
  direction: string;
  amount: number;
  fee?: number;
  qrCode?: string;
  expiresAt?: Date;
}

// Helper types for queries
export interface IPaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface IDateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface IUserFilter extends IPaginationParams {
  email?: string;
  cpf?: string;
  kycLevel?: KYCLevel;
  status?: UserStatus;
  referralCode?: string;
  dateRange?: IDateRangeFilter;
}

export interface IOrderFilter extends IPaginationParams {
  userId?: string;
  tradingPairId?: string;
  orderType?: OrderType;
  side?: OrderSide;
  status?: OrderStatus;
  tradeMode?: TradeMode;
  dateRange?: IDateRangeFilter;
}

export interface IP2PAdFilter extends IPaginationParams {
  userId?: string;
  adType?: P2PAdType;
  currency?: string;
  fiatCurrency?: string;
  status?: P2PAdStatus;
  minAmount?: number;
  maxAmount?: number;
}

export interface IP2PTradeFilter extends IPaginationParams {
  buyerId?: string;
  sellerId?: string;
  adId?: string;
  status?: P2PTradeStatus;
  dateRange?: IDateRangeFilter;
}

// Response types
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: string;
    version: string;
  };
}

// Aggregation types
export interface IUserStats {
  totalUsers: number;
  activeUsers: number;
  kycStats: {
    [key in KYCLevel]: number;
  };
  dailyNewUsers: number;
  monthlyNewUsers: number;
}

export interface ITradingStats {
  totalVolume24h: number;
  totalTrades24h: number;
  totalOrders24h: number;
  topTradingPairs: {
    symbol: string;
    volume: number;
    trades: number;
  }[];
}

export interface IP2PStats {
  totalAds: number;
  activeAds: number;
  totalTrades: number;
  completedTrades: number;
  totalVolume: number;
  averageCompletionTime: number;
}

// Validation schemas (for use with Zod)
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const CPF_REGEX = /^\d{11}$/;
export const PHONE_REGEX = /^\d{10,11}$/;
export const CEP_REGEX = /^\d{8}$/;

// Constants
export const KYC_LIMITS = {
  [KYCLevel.PLATFORM_ACCESS]: {
    dailyWithdrawal: 0,
    dailyDeposit: 0,
    dailyTrading: 0,
    p2pEnabled: false,
  },
  [KYCLevel.BASIC]: {
    dailyWithdrawal: 1000,
    dailyDeposit: 5000,
    dailyTrading: 10000,
    p2pEnabled: true,
  },
  [KYCLevel.INTERMEDIATE]: {
    dailyWithdrawal: 10000,
    dailyDeposit: 50000,
    dailyTrading: 100000,
    p2pEnabled: true,
  },
  [KYCLevel.ADVANCED]: {
    dailyWithdrawal: 50000,
    dailyDeposit: 200000,
    dailyTrading: 500000,
    p2pEnabled: true,
  },
} as const;

export const SUPPORTED_CURRENCIES = [
  'BTC',
  'ETH',
  'USDT',
  'BRL',
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];