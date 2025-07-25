// Sistema de Ícones - Rio Porto P2P
// Exporta todos os ícones do sistema

// Ícones de Criptomoedas
export {
  BitcoinIcon,
  EthereumIcon,
  USDTIcon,
  BNBIcon,
  CardanoIcon,
  SolanaIcon,
  PolygonIcon,
  AvalancheIcon,
} from './crypto';

// Ícones de Interface
export {
  HomeIcon,
  DashboardIcon,
  WalletIcon,
  TradeIcon,
  ChatIcon,
  SettingsIcon,
  NotificationsIcon,
  SearchIcon,
  FilterIcon,
  CloseIcon,
  MenuIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  XIcon,
  InfoIcon,
  WarningIcon,
  ErrorIcon,
  SuccessIcon,
  CopyIcon,
  QRCodeIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  UserIcon,
  UsersIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  DownloadIcon,
  UploadIcon,
  EditIcon,
  DeleteIcon,
  RefreshIcon,
  SendIcon,
  AttachmentIcon,
  EmojiIcon,
  MicrophoneIcon,
  CameraIcon,
  DocumentIcon,
  PhoneIcon,
  VideoIcon,
  MoreVerticalIcon,
  ClockIcon,
  DoubleCheckIcon,
} from './ui';

// Ícones Animados
export {
  SpinnerIcon,
  PulsingDotIcon,
  LoadingBarsIcon,
  CoinFlipIcon,
  HourglassIcon,
} from './animated';

// Tipos compartilhados
export type { IconProps } from './types';

// Utilitários
export { getIconSize } from './utils';

export const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);