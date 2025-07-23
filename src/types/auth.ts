// Tipos de autenticação e KYC para o Rio Porto P2P Exchange

export enum KYCLevel {
  PLATFORM_ACCESS = 0,  // Email validado + Nome
  BASIC = 1,           // + CPF
  INTERMEDIATE = 2,    // + Documento + Endereço
  ADVANCED = 3         // + Selfie com documento
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  cpf?: string;
  phone?: string;
  emailVerified: Date | null;
  phoneVerified: Date | null;
  kycLevel: KYCLevel;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession {
  user: IUser;
  expires: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterCredentials extends ILoginCredentials {
  name: string;
  cpf?: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface IKYCLimits {
  [KYCLevel.PLATFORM_ACCESS]: {
    monthlyLimit: 0;
    transactionLimit: 0;
    features: ['view_market', 'create_account'];
  };
  [KYCLevel.BASIC]: {
    monthlyLimit: 5000;
    transactionLimit: 1000;
    features: ['view_market', 'create_account', 'p2p_trading', 'pix_deposit'];
  };
  [KYCLevel.INTERMEDIATE]: {
    monthlyLimit: 30000;
    transactionLimit: 10000;
    features: ['view_market', 'create_account', 'p2p_trading', 'pix_deposit', 'bank_transfer'];
  };
  [KYCLevel.ADVANCED]: {
    monthlyLimit: 50000;
    transactionLimit: 50000;
    features: ['view_market', 'create_account', 'p2p_trading', 'pix_deposit', 'bank_transfer', 'crypto_withdrawal'];
  };
}

export const KYC_LIMITS: IKYCLimits = {
  [KYCLevel.PLATFORM_ACCESS]: {
    monthlyLimit: 0,
    transactionLimit: 0,
    features: ['view_market', 'create_account'],
  },
  [KYCLevel.BASIC]: {
    monthlyLimit: 5000,
    transactionLimit: 1000,
    features: ['view_market', 'create_account', 'p2p_trading', 'pix_deposit'],
  },
  [KYCLevel.INTERMEDIATE]: {
    monthlyLimit: 30000,
    transactionLimit: 10000,
    features: ['view_market', 'create_account', 'p2p_trading', 'pix_deposit', 'bank_transfer'],
  },
  [KYCLevel.ADVANCED]: {
    monthlyLimit: 50000,
    transactionLimit: 50000,
    features: ['view_market', 'create_account', 'p2p_trading', 'pix_deposit', 'bank_transfer', 'crypto_withdrawal'],
  },
};

export interface IAuthResponse {
  success: boolean;
  data?: {
    user: IUser;
    token?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface IVerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface IAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}