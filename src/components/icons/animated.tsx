// Ícones Animados - Rio Porto P2P

import React from 'react';
import { IconProps } from './types';
import { getIconSize } from './utils';
import styled, { keyframes } from 'styled-components';

// Animações
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-4px);
  }
  75% {
    transform: translateY(4px);
  }
`;

const flip = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
`;

const sand = keyframes`
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(20px);
  }
`;

// Styled Components
const SpinnerSvg = styled.svg<{ $animate?: boolean }>`
  animation: ${props => props.$animate ? spin : 'none'} 1s linear infinite;
`;

const PulsingDot = styled.circle<{ $animate?: boolean }>`
  animation: ${props => props.$animate ? pulse : 'none'} 1.5s ease-in-out infinite;
`;

const BouncingBar = styled.rect<{ $animate?: boolean; $delay: number }>`
  animation: ${props => props.$animate ? bounce : 'none'} 1s ease-in-out infinite;
  animation-delay: ${props => props.$delay}ms;
`;

const FlippingCoin = styled.svg<{ $animate?: boolean }>`
  animation: ${props => props.$animate ? flip : 'none'} 2s ease-in-out infinite;
  transform-style: preserve-3d;
`;

// Spinner
export const SpinnerIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '',
  animate = true
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <SpinnerSvg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      $animate={animate}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.416 31.416"
        transform="rotate(-90 12 12)"
      />
    </SpinnerSvg>
  );
};

// Pulsing Dot
export const PulsingDotIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '',
  animate = true
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
      <PulsingDot
        cx="12"
        cy="12"
        r="8"
        fill={color}
        $animate={animate}
      />
    </svg>
  );
};

// Loading Bars
export const LoadingBarsIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '',
  animate = true
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
      <BouncingBar
        x="4"
        y="8"
        width="4"
        height="8"
        rx="1"
        fill={color}
        $animate={animate}
        $delay={0}
      />
      <BouncingBar
        x="10"
        y="6"
        width="4"
        height="12"
        rx="1"
        fill={color}
        $animate={animate}
        $delay={150}
      />
      <BouncingBar
        x="16"
        y="8"
        width="4"
        height="8"
        rx="1"
        fill={color}
        $animate={animate}
        $delay={300}
      />
    </svg>
  );
};

// Coin Flip
export const CoinFlipIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '',
  animate = true
}) => {
  const iconSize = getIconSize(size);
  
  return (
    <FlippingCoin
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      $animate={animate}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="bold"
      >
        P2P
      </text>
    </FlippingCoin>
  );
};

// Hourglass
export const HourglassIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'currentColor', 
  className = '',
  animate = true
}) => {
  const iconSize = getIconSize(size);
  
  const SandPath = styled.path<{ $animate?: boolean }>`
    animation: ${props => props.$animate ? sand : 'none'} 2s ease-in-out infinite alternate;
    transform-origin: center;
  `;
  
  const HourglassSvg = styled.svg<{ $animate?: boolean }>`
    animation: ${props => props.$animate ? spin : 'none'} 4s ease-in-out infinite;
  `;
  
  return (
    <HourglassSvg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      $animate={animate}
    >
      <path
        d="M5 2h14v5.5L12 12l-7-4.5V2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 22h14v-5.5L12 12l-7 4.5V22z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <SandPath
        d="M12 12l-3-2v-3h6v3l-3 2z"
        fill={color}
        opacity="0.5"
        $animate={animate}
      />
    </HourglassSvg>
  );
};