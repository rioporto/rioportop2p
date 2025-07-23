"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
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
import { XMarkIcon, FunnelIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/Card";

export interface FilterState {
  type: "all" | "BUY" | "SELL";
  cryptocurrencies: string[];
  priceRange: [number, number];
  paymentMethods: string[];
  verifiedOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

const cryptoOptions = [
  { value: "BTC", label: "Bitcoin", icon: BitcoinIcon },
  { value: "ETH", label: "Ethereum", icon: EthereumIcon },
  { value: "USDT", label: "Tether", icon: USDTIcon },
  { value: "BNB", label: "BNB", icon: BNBIcon },
  { value: "ADA", label: "Cardano", icon: CardanoIcon },
  { value: "SOL", label: "Solana", icon: SolanaIcon },
  { value: "MATIC", label: "Polygon", icon: PolygonIcon },
  { value: "AVAX", label: "Avalanche", icon: AvalancheIcon }
];

const paymentOptions = [
  { value: "pix", label: "PIX", icon: "💸" },
  { value: "ted", label: "TED", icon: "🏦" },
  { value: "bank_transfer", label: "Transferência", icon: "💳" },
  { value: "cash", label: "Dinheiro", icon: "💵" }
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  className,
  isMobile = false,
  onClose
}) => {
  const [priceMin, setPriceMin] = useState(filters.priceRange[0].toString());
  const [priceMax, setPriceMax] = useState(filters.priceRange[1].toString());

  const handleTypeChange = (type: FilterState["type"]) => {
    onChange({ ...filters, type });
  };

  const handleCryptoToggle = (crypto: string) => {
    const newCryptos = filters.cryptocurrencies.includes(crypto)
      ? filters.cryptocurrencies.filter(c => c !== crypto)
      : [...filters.cryptocurrencies, crypto];
    onChange({ ...filters, cryptocurrencies: newCryptos });
  };

  const handlePaymentToggle = (payment: string) => {
    const newPayments = filters.paymentMethods.includes(payment)
      ? filters.paymentMethods.filter(p => p !== payment)
      : [...filters.paymentMethods, payment];
    onChange({ ...filters, paymentMethods: newPayments });
  };

  const handlePriceChange = () => {
    const min = parseFloat(priceMin) || 0;
    const max = parseFloat(priceMax) || 999999;
    onChange({ ...filters, priceRange: [min, max] });
  };

  const clearFilters = () => {
    onChange({
      type: "all",
      cryptocurrencies: [],
      priceRange: [0, 999999],
      paymentMethods: [],
      verifiedOnly: false
    });
    setPriceMin("0");
    setPriceMax("999999");
  };

  const content = (
    <div className="space-y-6">
      {/* Header Mobile */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Tipo de Operação */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Tipo de Operação</h4>
        <div className="relative p-1 bg-gray-100 rounded-xl">
          <div className="grid grid-cols-3 relative z-10">
            {[
              { value: "all", label: "Todos" },
              { value: "BUY", label: "Compra" },
              { value: "SELL", label: "Venda" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleTypeChange(option.value as FilterState["type"])}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg",
                  "transition-all duration-200",
                  "relative z-20",
                  filters.type === option.value
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Sliding indicator */}
          <div
            className={cn(
              "absolute inset-y-1 w-1/3 rounded-lg",
              "bg-gradient-to-b shadow-skeuo-sm",
              "transition-transform duration-200 ease-out",
              filters.type === "BUY" && "from-green-500 to-green-600",
              filters.type === "SELL" && "from-red-500 to-red-600",
              filters.type === "all" && "from-blue-500 to-blue-600"
            )}
            style={{
              transform: `translateX(${
                filters.type === "all" ? "0%" : 
                filters.type === "BUY" ? "100%" : 
                "200%"
              })`
            }}
          />
        </div>
      </div>

      {/* Criptomoedas */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Criptomoedas</h4>
        <div className="grid grid-cols-2 gap-2">
          {cryptoOptions.map((crypto) => {
            const Icon = crypto.icon;
            const isSelected = filters.cryptocurrencies.includes(crypto.value);
            
            return (
              <button
                key={crypto.value}
                onClick={() => handleCryptoToggle(crypto.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg",
                  "border transition-all duration-200",
                  "relative overflow-hidden group",
                  isSelected
                    ? "bg-gradient-to-b from-blue-50 to-blue-100 border-blue-300 shadow-skeuo-sm"
                    : "bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400"
                )}
              >
                <Icon size="sm" />
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-blue-900" : "text-gray-700"
                )}>
                  {crypto.value}
                </span>
                
                {/* Gloss effect */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background: `linear-gradient(to bottom, 
                      rgba(255,255,255,0.8) 0%, 
                      transparent 60%)`
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Faixa de Preço (R$)</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Mínimo</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onBlur={handlePriceChange}
                placeholder="0"
                className={cn(
                  "w-full px-3 py-2 rounded-lg",
                  "bg-white border border-gray-300",
                  "shadow-skeuo-inset",
                  "text-sm font-medium text-gray-900",
                  "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Máximo</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                onBlur={handlePriceChange}
                placeholder="999999"
                className={cn(
                  "w-full px-3 py-2 rounded-lg",
                  "bg-white border border-gray-300",
                  "shadow-skeuo-inset",
                  "text-sm font-medium text-gray-900",
                  "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
            </div>
          </div>
          
          {/* Price range slider visual */}
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div 
              className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              style={{
                left: "0%",
                right: "0%"
              }}
            />
          </div>
        </div>
      </div>

      {/* Métodos de Pagamento */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Métodos de Pagamento</h4>
        <div className="space-y-2">
          {paymentOptions.map((payment) => {
            const isSelected = filters.paymentMethods.includes(payment.value);
            
            return (
              <button
                key={payment.value}
                onClick={() => handlePaymentToggle(payment.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                  "border transition-all duration-200",
                  "relative overflow-hidden group",
                  isSelected
                    ? "bg-gradient-to-b from-blue-50 to-blue-100 border-blue-300 shadow-skeuo-sm"
                    : "bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center",
                  "bg-white border",
                  "shadow-skeuo-xs transition-all duration-200",
                  isSelected 
                    ? "border-blue-500 bg-blue-500" 
                    : "border-gray-300"
                )}>
                  {isSelected && (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <span className="text-lg mr-2">{payment.icon}</span>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-blue-900" : "text-gray-700"
                )}>
                  {payment.label}
                </span>
                
                {/* Gloss effect */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background: `linear-gradient(to bottom, 
                      rgba(255,255,255,0.8) 0%, 
                      transparent 60%)`
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Apenas Verificados */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="verified-only" className="text-sm font-medium text-gray-700">
            Apenas Verificados
          </label>
          <button
            id="verified-only"
            onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
            className={cn(
              "relative w-14 h-8 rounded-full transition-colors duration-200",
              "shadow-skeuo-inset",
              filters.verifiedOnly
                ? "bg-gradient-to-b from-blue-500 to-blue-600"
                : "bg-gradient-to-b from-gray-300 to-gray-400"
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-6 h-6 rounded-full",
                "bg-white shadow-skeuo-sm",
                "transition-transform duration-200",
                filters.verifiedOnly ? "translate-x-6" : "translate-x-1"
              )}
            >
              {filters.verifiedOnly && (
                <CheckIcon className="w-4 h-4 text-blue-600 m-1" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className={cn(
          "w-full px-4 py-3 rounded-lg",
          "bg-gradient-to-b from-gray-100 to-gray-200",
          "border border-gray-300",
          "shadow-skeuo-sm hover:shadow-skeuo-md",
          "text-sm font-medium text-gray-700",
          "transition-all duration-200",
          "relative overflow-hidden group"
        )}
      >
        <span className="relative z-10">Limpar Filtros</span>
        
        {/* Gloss effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(255,255,255,0.8) 0%, 
              transparent 50%)`
          }}
        />
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 bg-white",
        "overflow-y-auto",
        className
      )}>
        <div className="p-4">
          {content}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("sticky top-4", className)}>
      <CardContent className="p-6">
        {content}
      </CardContent>
    </Card>
  );
};