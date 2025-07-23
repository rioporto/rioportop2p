// Ilustrações para Estados Vazios - Rio Porto P2P

import React from 'react';
import styled from 'styled-components';

interface IllustrationProps {
  width?: number;
  height?: number;
  className?: string;
}

const IllustrationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: 600;
`;

const Description = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  max-width: 300px;
`;

// No Data Illustration
export const NoDataIllustration: React.FC<IllustrationProps & { 
  title?: string; 
  description?: string;
}> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  title = 'Nenhum dado encontrado',
  description = 'Não há informações para exibir no momento.'
}) => {
  return (
    <IllustrationWrapper className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#F3F4F6" />
        <rect x="60" y="60" width="80" height="60" rx="4" fill="#E5E7EB" />
        <rect x="70" y="70" width="60" height="4" rx="2" fill="#9CA3AF" />
        <rect x="70" y="80" width="40" height="4" rx="2" fill="#9CA3AF" />
        <rect x="70" y="90" width="50" height="4" rx="2" fill="#9CA3AF" />
        <rect x="70" y="100" width="30" height="4" rx="2" fill="#9CA3AF" />
        <circle cx="100" cy="140" r="4" fill="#6B7280" />
        <circle cx="110" cy="140" r="4" fill="#6B7280" />
        <circle cx="120" cy="140" r="4" fill="#6B7280" />
      </svg>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </IllustrationWrapper>
  );
};

// Error Illustration
export const ErrorIllustration: React.FC<IllustrationProps & { 
  title?: string; 
  description?: string;
}> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  title = 'Ops! Algo deu errado',
  description = 'Ocorreu um erro ao processar sua solicitação. Tente novamente.'
}) => {
  return (
    <IllustrationWrapper className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#FEE2E2" />
        <path
          d="M100 40C127.614 40 150 62.3858 150 90C150 117.614 127.614 140 100 140C72.3858 140 50 117.614 50 90C50 62.3858 72.3858 40 100 40Z"
          fill="#FECACA"
        />
        <path
          d="M100 70V100M100 110V120"
          stroke="#DC2626"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="100" cy="110" r="4" fill="#DC2626" />
      </svg>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </IllustrationWrapper>
  );
};

// Success Illustration
export const SuccessIllustration: React.FC<IllustrationProps & { 
  title?: string; 
  description?: string;
}> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  title = 'Sucesso!',
  description = 'Operação realizada com sucesso.'
}) => {
  return (
    <IllustrationWrapper className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#D1FAE5" />
        <path
          d="M100 40C127.614 40 150 62.3858 150 90C150 117.614 127.614 140 100 140C72.3858 140 50 117.614 50 90C50 62.3858 72.3858 40 100 40Z"
          fill="#A7F3D0"
        />
        <path
          d="M75 90L90 105L125 70"
          stroke="#059669"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </IllustrationWrapper>
  );
};

// Empty Wallet Illustration
export const EmptyWalletIllustration: React.FC<IllustrationProps & { 
  title?: string; 
  description?: string;
}> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  title = 'Carteira vazia',
  description = 'Adicione fundos para começar a negociar.'
}) => {
  return (
    <IllustrationWrapper className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#FEF3C7" />
        <path
          d="M60 80H140V120C140 124.418 136.418 128 132 128H68C63.5817 128 60 124.418 60 120V80Z"
          fill="#FDE68A"
        />
        <path
          d="M60 80V75C60 70.5817 63.5817 67 68 67H132C136.418 67 140 70.5817 140 75V80"
          fill="#F59E0B"
        />
        <circle cx="100" cy="100" r="15" fill="#FBBF24" />
        <text
          x="100"
          y="105"
          textAnchor="middle"
          fill="#92400E"
          fontSize="16"
          fontWeight="bold"
        >
          $
        </text>
      </svg>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </IllustrationWrapper>
  );
};

// No Transactions Illustration
export const NoTransactionsIllustration: React.FC<IllustrationProps & { 
  title?: string; 
  description?: string;
}> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  title = 'Sem transações',
  description = 'Você ainda não realizou nenhuma transação.'
}) => {
  return (
    <IllustrationWrapper className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#E0E7FF" />
        <rect x="60" y="60" width="80" height="100" rx="4" fill="#C7D2FE" />
        <rect x="70" y="70" width="60" height="4" rx="2" fill="#6366F1" />
        <rect x="70" y="80" width="40" height="4" rx="2" fill="#A5B4FC" />
        <rect x="70" y="90" width="50" height="4" rx="2" fill="#A5B4FC" />
        <rect x="70" y="100" width="30" height="4" rx="2" fill="#A5B4FC" />
        <path
          d="M85 120H115M100 110V130"
          stroke="#6366F1"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </IllustrationWrapper>
  );
};

// Searching Illustration
export const SearchingIllustration: React.FC<IllustrationProps & { 
  title?: string; 
  description?: string;
}> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  title = 'Procurando...',
  description = 'Estamos buscando as melhores ofertas para você.'
}) => {
  return (
    <IllustrationWrapper className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#F3E8FF" />
        <circle
          cx="90"
          cy="90"
          r="40"
          fill="none"
          stroke="#9333EA"
          strokeWidth="8"
        />
        <path
          d="M118 118L140 140"
          stroke="#9333EA"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="90" cy="90" r="25" fill="#E9D5FF" />
        <path
          d="M75 90C75 81.7157 81.7157 75 90 75"
          stroke="#A855F7"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </IllustrationWrapper>
  );
};

// Connection Lost Illustration
export const ConnectionLostIllustration: React.FC<IllustrationProps & { 
  title?: string; 
  description?: string;
}> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  title = 'Conexão perdida',
  description = 'Verifique sua conexão com a internet e tente novamente.'
}) => {
  return (
    <IllustrationWrapper className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#FEF3C7" />
        <path
          d="M100 60C111.046 60 120 68.9543 120 80C120 86.8386 116.525 92.8598 111.213 96.2132L108.787 97.7868C103.475 101.14 100 107.161 100 113.999V120"
          stroke="#F59E0B"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="100" cy="140" r="5" fill="#F59E0B" />
        <path
          d="M70 50L80 60M130 50L120 60"
          stroke="#DC2626"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </IllustrationWrapper>
  );
};

// Maintenance Illustration
export const MaintenanceIllustration: React.FC<IllustrationProps & { 
  title?: string; 
  description?: string;
}> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  title = 'Em manutenção',
  description = 'Estamos melhorando nossos serviços. Volte em breve!'
}) => {
  return (
    <IllustrationWrapper className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="80" fill="#F3F4F6" />
        <path
          d="M100 70L115 85L100 100L85 85L100 70Z"
          fill="#6B7280"
        />
        <rect
          x="95"
          y="100"
          width="10"
          height="30"
          fill="#6B7280"
        />
        <path
          d="M80 130H120L115 140H85L80 130Z"
          fill="#4B5563"
        />
        <circle cx="75" cy="75" r="15" fill="#9CA3AF" />
        <circle cx="125" cy="75" r="15" fill="#9CA3AF" />
        <path
          d="M70 75L80 75M120 75L130 75M75 70V80M125 70V80"
          stroke="#6B7280"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </IllustrationWrapper>
  );
};