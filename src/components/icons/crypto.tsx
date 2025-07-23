// Ícones de Criptomoedas - Rio Porto P2P

import React from 'react';
import { IconProps } from './types';
import { getIconSize } from './utils';

// Bitcoin
export const BitcoinIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#F7931A"/>
      <path
        d="M15.5 8.5C15.5 7.5 14.5 7 13.5 7V5.5H12.5V7H11.5V5.5H10.5V7H8V8H9V16H8V17H10.5V18.5H11.5V17H12.5V18.5H13.5V17C14.5 17 16 16.5 16 15C16 14 15.5 13.5 15 13.5C15.5 13.5 16 13 16 12C16 10.5 15.5 9.5 15.5 8.5ZM11 8H13C13.5 8 14 8.5 14 9C14 9.5 13.5 10 13 10H11V8ZM13.5 16H11V13H13.5C14 13 14.5 13.5 14.5 14.5C14.5 15.5 14 16 13.5 16Z"
        fill="white"
      />
    </svg>
  );
};

// Ethereum
export const EthereumIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#627EEA"/>
      <path d="M12 4L7 12L12 15L17 12L12 4Z" fill="white" opacity="0.6"/>
      <path d="M12 4L7 12L12 9.5V4Z" fill="white"/>
      <path d="M12 15.5L7 13L12 20L17 13L12 15.5Z" fill="white" opacity="0.6"/>
      <path d="M12 20V15.5L7 13L12 20Z" fill="white"/>
    </svg>
  );
};

// USDT (Tether)
export const USDTIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#26A17B"/>
      <path
        d="M13.5 11V10.5C15.5 10.3 17 9.8 17 9C17 8 15 7.5 12 7.5C9 7.5 7 8 7 9C7 9.8 8.5 10.3 10.5 10.5V11C8 10.8 6 10 6 9C6 7.5 8.5 6.5 12 6.5C15.5 6.5 18 7.5 18 9C18 10 16 10.8 13.5 11Z"
        fill="white"
      />
      <path d="M10.5 10.5H13.5V17H10.5V10.5Z" fill="white"/>
      <path d="M8 6H16V7.5H8V6Z" fill="white"/>
    </svg>
  );
};

// BNB (Binance Coin)
export const BNBIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#F3BA2F"/>
      <path
        d="M12 8L14.5 10.5L12 13L9.5 10.5L12 8Z"
        fill="white"
      />
      <path
        d="M8.5 9.5L10 11L7.5 13.5L6 12L8.5 9.5Z"
        fill="white"
      />
      <path
        d="M15.5 9.5L18 12L16.5 13.5L14 11L15.5 9.5Z"
        fill="white"
      />
      <path
        d="M12 14L14.5 16.5L12 19L9.5 16.5L12 14Z"
        fill="white"
      />
    </svg>
  );
};

// Cardano
export const CardanoIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#0033AD"/>
      <circle cx="12" cy="8" r="1" fill="white"/>
      <circle cx="12" cy="16" r="1" fill="white"/>
      <circle cx="8" cy="10" r="1" fill="white"/>
      <circle cx="16" cy="10" r="1" fill="white"/>
      <circle cx="8" cy="14" r="1" fill="white"/>
      <circle cx="16" cy="14" r="1" fill="white"/>
      <circle cx="10" cy="12" r="1.5" fill="white"/>
      <circle cx="14" cy="12" r="1.5" fill="white"/>
    </svg>
  );
};

// Solana
export const SolanaIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#00FFA3"/>
      <path
        d="M7 9.5L9.5 7H17V9.5H9.5L7 12L9.5 14.5H17V17H9.5L7 14.5V9.5Z"
        fill="#000000"
      />
      <path
        d="M7 12L9.5 9.5H17L14.5 12H7Z"
        fill="#000000"
      />
      <path
        d="M7 12L9.5 14.5H17L14.5 12H7Z"
        fill="#000000"
      />
    </svg>
  );
};

// Polygon
export const PolygonIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#8247E5"/>
      <path
        d="M15 8.5L17.5 10V14L15 15.5L12.5 14V11.5L10 10V12.5L7.5 14V10L10 8.5L12.5 10V12.5L15 14V10L12.5 8.5V6L15 7.5V8.5Z"
        fill="white"
      />
    </svg>
  );
};

// Avalanche
export const AvalancheIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '' 
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#E84142"/>
      <path
        d="M12 6L16 14H14L12 10L10 14H8L12 6Z"
        fill="white"
      />
      <path
        d="M14.5 15H16.5L17.5 17H15.5L14.5 15Z"
        fill="white"
      />
    </svg>
  );
};