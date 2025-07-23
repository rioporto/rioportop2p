"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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

interface Crypto {
  name: string;
  symbol: string;
  icon: React.ReactNode;
  price: string;
  change: number;
  volume: string;
  marketCap: string;
  gradient: string;
}

const cryptos: Crypto[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    icon: <BitcoinIcon size="lg" />,
    price: "R$ 285.450",
    change: 2.5,
    volume: "R$ 15.2M",
    marketCap: "R$ 5.6T",
    gradient: "from-orange-400 to-orange-600"
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    icon: <EthereumIcon size="lg" />,
    price: "R$ 12.850",
    change: 3.2,
    volume: "R$ 8.7M",
    marketCap: "R$ 1.5T",
    gradient: "from-blue-400 to-purple-600"
  },
  {
    name: "Tether",
    symbol: "USDT",
    icon: <USDTIcon size="lg" />,
    price: "R$ 5.45",
    change: 0.1,
    volume: "R$ 25.3M",
    marketCap: "R$ 450B",
    gradient: "from-green-400 to-teal-600"
  },
  {
    name: "BNB",
    symbol: "BNB",
    icon: <BNBIcon size="lg" />,
    price: "R$ 1.875",
    change: -1.2,
    volume: "R$ 3.4M",
    marketCap: "R$ 280B",
    gradient: "from-yellow-400 to-yellow-600"
  },
  {
    name: "Cardano",
    symbol: "ADA",
    icon: <CardanoIcon size="lg" />,
    price: "R$ 2.45",
    change: 1.8,
    volume: "R$ 1.2M",
    marketCap: "R$ 85B",
    gradient: "from-blue-600 to-blue-800"
  },
  {
    name: "Solana",
    symbol: "SOL",
    icon: <SolanaIcon size="lg" />,
    price: "R$ 485.50",
    change: 5.4,
    volume: "R$ 4.8M",
    marketCap: "R$ 200B",
    gradient: "from-purple-400 to-pink-600"
  },
  {
    name: "Polygon",
    symbol: "MATIC",
    icon: <PolygonIcon size="lg" />,
    price: "R$ 4.85",
    change: -0.8,
    volume: "R$ 2.1M",
    marketCap: "R$ 45B",
    gradient: "from-purple-500 to-purple-700"
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    icon: <AvalancheIcon size="lg" />,
    price: "R$ 185.20",
    change: 2.9,
    volume: "R$ 1.8M",
    marketCap: "R$ 65B",
    gradient: "from-red-500 to-red-700"
  }
];

export const CryptoList: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "gainers" | "losers">("all");

  const filteredCryptos = cryptos.filter((crypto) => {
    if (filter === "gainers") return crypto.change > 0;
    if (filter === "losers") return crypto.change < 0;
    return true;
  });

  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="container-premium">
        {/* Header da seção */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient bg-gradient-primary">Criptomoedas Disponíveis</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Negocie as principais criptomoedas do mercado com segurança e rapidez
          </p>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant={filter === "all" ? "gradient" : "ghost"}
              gradient="primary"
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={filter === "gainers" ? "gradient" : "ghost"}
              gradient="success"
              size="sm"
              onClick={() => setFilter("gainers")}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Em Alta
            </Button>
            <Button
              variant={filter === "losers" ? "gradient" : "ghost"}
              gradient="warning"
              size="sm"
              onClick={() => setFilter("losers")}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              Em Baixa
            </Button>
          </div>
        </div>

        {/* Grid de criptomoedas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCryptos.map((crypto, index) => (
            <Card
              key={index}
              variant="elevated"
              interactive
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                selectedCrypto === index && "ring-2 ring-primary-500 shadow-xl"
              )}
              onClick={() => setSelectedCrypto(index)}
              animate="fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background gradient sutil */}
              <div
                className={cn(
                  "absolute inset-0 opacity-5 bg-gradient-to-br",
                  crypto.gradient
                )}
              />

              <div className="relative z-10">
                {/* Header do card */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {crypto.icon}
                      {/* Efeito de glow no ícone */}
                      <div className={cn(
                        "absolute inset-0 -z-10 blur-xl opacity-30 bg-gradient-to-br",
                        crypto.gradient
                      )} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {crypto.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {crypto.symbol}
                      </p>
                    </div>
                  </div>
                  
                  {/* Badge de mudança */}
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                    crypto.change > 0 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {crypto.change > 0 ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {Math.abs(crypto.change)}%
                  </div>
                </div>

                {/* Preço */}
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crypto.price}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Preço atual
                  </p>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Volume 24h</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      {crypto.volume}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      {crypto.marketCap}
                    </p>
                  </div>
                </div>

                {/* Botão de ação */}
                <Button
                  variant="gradient"
                  gradient="primary"
                  size="sm"
                  fullWidth
                  className="opacity-90 hover:opacity-100"
                >
                  Negociar {crypto.symbol}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA adicional */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Não encontrou a criptomoeda que procura?
          </p>
          <Button variant="elevated" size="lg">
            Ver Todas as 50+ Criptomoedas
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>

        {/* Informação adicional */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 backdrop-blur-sm border border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Preços em Tempo Real
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cotações atualizadas a cada 30 segundos diretamente das principais exchanges
                </p>
              </div>
            </div>
            <Button variant="glass" size="sm">
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};