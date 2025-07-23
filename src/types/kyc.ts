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
  kycLevel: KYCLevel;
  avatar?: string;
}

export interface IKYCLevelInfo {
  level: KYCLevel;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  features: string[];
}

export const KYC_LEVELS: Record<KYCLevel, IKYCLevelInfo> = {
  [KYCLevel.PLATFORM_ACCESS]: {
    level: KYCLevel.PLATFORM_ACCESS,
    name: 'Acesso Básico',
    description: 'Acesso à plataforma',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    features: ['Visualizar ofertas', 'Explorar plataforma']
  },
  [KYCLevel.BASIC]: {
    level: KYCLevel.BASIC,
    name: 'Nível 1',
    description: 'Trading básico',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: ['Trading até R$ 1.000/mês', 'PIX']
  },
  [KYCLevel.INTERMEDIATE]: {
    level: KYCLevel.INTERMEDIATE,
    name: 'Nível 2',
    description: 'Trading intermediário',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: ['Trading até R$ 10.000/mês', 'PIX e TED']
  },
  [KYCLevel.ADVANCED]: {
    level: KYCLevel.ADVANCED,
    name: 'Nível 3',
    description: 'Trading avançado',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    features: ['Trading ilimitado', 'Todos os métodos de pagamento']
  }
};