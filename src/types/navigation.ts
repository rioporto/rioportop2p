import { KYCLevel } from './kyc';

export interface INavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  minKYCLevel: KYCLevel;
  badge?: string;
  children?: INavigationItem[];
}

export const NAVIGATION_ITEMS: INavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'home',
    minKYCLevel: KYCLevel.PLATFORM_ACCESS
  },
  {
    id: 'trading',
    label: 'P2P Trading',
    href: '/trading',
    icon: 'exchange',
    minKYCLevel: KYCLevel.BASIC,
    badge: 'KYC 1+'
  },
  {
    id: 'wallet',
    label: 'Carteira',
    href: '/wallet',
    icon: 'wallet',
    minKYCLevel: KYCLevel.BASIC,
    badge: 'KYC 1+'
  },
  {
    id: 'history',
    label: 'Histórico',
    href: '/history',
    icon: 'history',
    minKYCLevel: KYCLevel.BASIC,
    badge: 'KYC 1+'
  },
  {
    id: 'profile',
    label: 'Perfil & KYC',
    href: '/profile',
    icon: 'user',
    minKYCLevel: KYCLevel.PLATFORM_ACCESS
  }
];