import { KYCLevel } from '@/types/kyc';

/**
 * Converte uma string para o enum KYCLevel de forma segura
 * @param value - String representando o nível KYC
 * @returns KYCLevel correspondente ou PLATFORM_ACCESS como padrão
 */
export function toKYCLevel(value: string | null | undefined): KYCLevel {
  if (!value) return KYCLevel.PLATFORM_ACCESS;
  
  const mapping: Record<string, KYCLevel> = {
    'PLATFORM_ACCESS': KYCLevel.PLATFORM_ACCESS,
    'BASIC': KYCLevel.BASIC,
    'INTERMEDIATE': KYCLevel.INTERMEDIATE,
    'ADVANCED': KYCLevel.ADVANCED,
  };
  
  return mapping[value] ?? KYCLevel.PLATFORM_ACCESS;
}

/**
 * Converte KYCLevel enum para string
 * @param level - KYCLevel enum
 * @returns String correspondente
 */
export function fromKYCLevel(level: KYCLevel): string {
  const mapping: Record<KYCLevel, string> = {
    [KYCLevel.PLATFORM_ACCESS]: 'PLATFORM_ACCESS',
    [KYCLevel.BASIC]: 'BASIC',
    [KYCLevel.INTERMEDIATE]: 'INTERMEDIATE',
    [KYCLevel.ADVANCED]: 'ADVANCED',
  };
  
  return mapping[level] ?? 'PLATFORM_ACCESS';
}

/**
 * Valida se uma string é um nível KYC válido
 * @param value - String a ser validada
 * @returns boolean
 */
export function isValidKYCLevel(value: string): boolean {
  return ['PLATFORM_ACCESS', 'BASIC', 'INTERMEDIATE', 'ADVANCED'].includes(value);
}

/**
 * Obtém o próximo nível KYC
 * @param currentLevel - Nível atual
 * @returns Próximo nível ou null se já for o máximo
 */
export function getNextKYCLevel(currentLevel: KYCLevel): KYCLevel | null {
  switch (currentLevel) {
    case KYCLevel.PLATFORM_ACCESS:
      return KYCLevel.BASIC;
    case KYCLevel.BASIC:
      return KYCLevel.INTERMEDIATE;
    case KYCLevel.INTERMEDIATE:
      return KYCLevel.ADVANCED;
    case KYCLevel.ADVANCED:
      return null;
    default:
      return null;
  }
}

/**
 * Verifica se o usuário tem o nível KYC mínimo requerido
 * @param userLevel - Nível do usuário
 * @param requiredLevel - Nível requerido
 * @returns boolean
 */
export function hasMinimumKYCLevel(userLevel: KYCLevel, requiredLevel: KYCLevel): boolean {
  return userLevel >= requiredLevel;
}