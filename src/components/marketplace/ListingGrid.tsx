"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, BadgeGroup } from "@/components/ui/Badge";
import { 
  BitcoinIcon, 
  EthereumIcon, 
  USDTIcon, 
  BNBIcon,
  CardanoIcon,
  SolanaIcon,
  PolygonIcon,
  AvalancheIcon
} from "@/components/icons/crypto";
import { StarIcon, CheckBadgeIcon, ClockIcon } from "@heroicons/react/24/solid";
import { KYCLevel } from "@/types/kyc";

interface IListing {
  id: string;
  userId: string;
  type: 'BUY' | 'SELL';
  cryptocurrency: string;
  fiatCurrency: string;
  pricePerUnit: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  terms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    kycLevel: KYCLevel;
    rating?: number;
    totalTrades?: number;
    isVerified?: boolean;
  };
}

interface ListingGridProps {
  listings: IListing[];
  loading?: boolean;
  className?: string;
}

const cryptoIcons: Record<string, React.FC<any>> = {
  BTC: BitcoinIcon,
  ETH: EthereumIcon,
  USDT: USDTIcon,
  BNB: BNBIcon,
  ADA: CardanoIcon,
  SOL: SolanaIcon,
  MATIC: PolygonIcon,
  AVAX: AvalancheIcon
};

const paymentMethodLabels: Record<string, { label: string; icon: string }> = {
  pix: { label: "PIX", icon: "💸" },
  ted: { label: "TED", icon: "🏦" },
  bank_transfer: { label: "Transferência", icon: "💳" },
  cash: { label: "Dinheiro", icon: "💵" }
};

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  loading = false,
  className
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays < 30) {
      return `${diffDays}d atrás`;
    } else {
      return past.toLocaleDateString('pt-BR');
    }
  };

  const getKYCBadgeProps = (level: KYCLevel) => {
    switch (level) {
      case KYCLevel.BASIC:
        return { variant: "default" as const, kycLevel: 1 };
      case KYCLevel.INTERMEDIARY:
        return { variant: "primary" as const, kycLevel: 2 };
      case KYCLevel.ADVANCED:
        return { variant: "success" as const, kycLevel: 3 };
      default:
        return { variant: "default" as const, kycLevel: 0 };
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {listings.map((listing, index) => {
        const CryptoIcon = cryptoIcons[listing.cryptocurrency] || BitcoinIcon;
        const kycBadgeProps = getKYCBadgeProps(listing.user.kycLevel);
        
        return (
          <Card 
            key={listing.id}
            className={cn(
              "group relative overflow-hidden",
              "hover:shadow-elevation-3 transition-all duration-300",
              "cursor-pointer",
              "animate-in fade-in slide-in-from-bottom-2"
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both'
            }}
            onClick={() => router.push(`/listings/${listing.id}`)}
          >
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <Badge
                  variant={listing.type === 'BUY' ? "success" : "danger"}
                  size="md"
                  className="shadow-skeuo-sm"
                >
                  {listing.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                </Badge>
                
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    "bg-gradient-to-b from-white to-gray-50",
                    "border border-gray-200 shadow-skeuo-sm",
                    "group-hover:shadow-skeuo-md transition-all duration-200"
                  )}>
                    <CryptoIcon size="md" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {listing.cryptocurrency}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Preço por unidade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(listing.pricePerUnit)}
                </p>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Mínimo</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatCurrency(listing.minAmount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Máximo</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatCurrency(listing.maxAmount)}
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <BadgeGroup gap="sm" className="min-h-[32px]">
                {listing.paymentMethods.slice(0, 3).map((method) => {
                  const methodInfo = paymentMethodLabels[method] || { label: method, icon: "💳" };
                  return (
                    <Badge
                      key={method}
                      variant="default"
                      size="sm"
                      className="shadow-skeuo-xs"
                    >
                      <span className="mr-1">{methodInfo.icon}</span>
                      {methodInfo.label}
                    </Badge>
                  );
                })}
                {listing.paymentMethods.length > 3 && (
                  <Badge variant="default" size="sm" className="shadow-skeuo-xs">
                    +{listing.paymentMethods.length - 3}
                  </Badge>
                )}
              </BadgeGroup>

              {/* Divider with gradient */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {/* Footer */}
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {listing.user.name}
                    </p>
                    {listing.user.isVerified && (
                      <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge {...kycBadgeProps} size="sm" />
                    
                    {listing.user.rating && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {listing.user.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    {listing.user.totalTrades && (
                      <span className="text-xs text-gray-500">
                        {listing.user.totalTrades} trades
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/listings/${listing.id}`);
                  }}
                  className="shadow-skeuo-sm hover:shadow-skeuo-md"
                >
                  Negociar
                </Button>
              </div>

              {/* Time indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-400">
                <ClockIcon className="w-3 h-3" />
                {formatTimeAgo(listing.createdAt)}
              </div>
            </CardContent>

            {/* Hover effect overlay */}
            <div className={cn(
              "absolute inset-0 pointer-events-none",
              "bg-gradient-to-t from-blue-500/5 to-transparent",
              "opacity-0 group-hover:opacity-100",
              "transition-opacity duration-300"
            )} />

            {/* 3D effect on hover */}
            <style jsx>{`
              @media (hover: hover) {
                .group:hover {
                  transform: translateY(-2px) scale(1.02);
                }
              }
            `}</style>
          </Card>
        );
      })}
    </div>
  );
};

// Empty state component
export const EmptyListings: React.FC<{ onCreateListing?: () => void }> = ({ 
  onCreateListing 
}) => {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Illustration */}
        <div className="w-32 h-32 mx-auto relative">
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-br from-blue-100 to-blue-200",
            "animate-pulse"
          )} />
          <svg 
            className="w-full h-full relative z-10 text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Nenhum anúncio encontrado
          </h3>
          <p className="text-gray-500">
            Não encontramos anúncios com os filtros selecionados.
            Tente ajustar os filtros ou crie seu próprio anúncio.
          </p>
        </div>

        {onCreateListing && (
          <Button
            variant="gradient"
            size="md"
            onClick={onCreateListing}
            className="shadow-skeuo-md"
          >
            Criar Primeiro Anúncio
          </Button>
        )}
      </div>
    </Card>
  );
};