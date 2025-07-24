// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

// Pagination
export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Related
export enum KYCLevel {
  PLATFORM_ACCESS = 0,  // Email + Nome
  BASIC = 1,           // + CPF
  INTERMEDIATE = 2,    // + Documento + Endereço
  ADVANCED = 3         // + Selfie com documento
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  kycLevel: KYCLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface IUpdateUserDto {
  name?: string;
  cpf?: string;
}

// KYC Related
export interface IKYCDocument {
  id: string;
  userId: string;
  type: 'RG' | 'CNH' | 'PASSPORT' | 'SELFIE' | 'PROOF_OF_ADDRESS';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  url?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IKYCUploadDto {
  type: IKYCDocument['type'];
  file: File;
}

// Crypto Related
export interface ICryptoPriceData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: Date;
}

export interface ICryptoQuote {
  from: string;
  to: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  expiresAt: Date;
}

// Payment Related
export interface IPixPayment {
  id: string;
  transactionId: string;
  pixKey: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  qrCode?: string;
  qrCodeData?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePixPaymentDto {
  amount: number;
  description?: string;
}

// Transaction Related
export interface ITransaction {
  id: string;
  userId: string;
  type: 'BUY' | 'SELL';
  cryptocurrency: string;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  fee: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  paymentMethod: 'PIX';
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTransactionDto {
  type: 'BUY' | 'SELL';
  cryptocurrency: string;
  cryptoAmount: number;
  fiatAmount: number;
  paymentMethod: 'PIX';
}

// Error Codes
export const API_ERROR_CODES = {
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_REQUEST_BODY: 'INVALID_REQUEST_BODY',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_CAPTCHA: 'INVALID_CAPTCHA',
  
  // User
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INSUFFICIENT_KYC_LEVEL: 'INSUFFICIENT_KYC_LEVEL',
  
  // KYC
  INVALID_DOCUMENT_TYPE: 'INVALID_DOCUMENT_TYPE',
  DOCUMENT_ALREADY_SUBMITTED: 'DOCUMENT_ALREADY_SUBMITTED',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  
  // Crypto
  INVALID_CRYPTOCURRENCY: 'INVALID_CRYPTOCURRENCY',
  PRICE_UNAVAILABLE: 'PRICE_UNAVAILABLE',
  QUOTE_EXPIRED: 'QUOTE_EXPIRED',
  
  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_PIX_KEY: 'INVALID_PIX_KEY',
  
  // Transaction
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_LIMIT_EXCEEDED: 'TRANSACTION_LIMIT_EXCEEDED',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];