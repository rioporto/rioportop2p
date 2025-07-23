"use client";

import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: "primary" | "secondary" | "success" | "warning" | "luxury" | "dark";
  details: string[];
}

const features: Feature[] = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Segurança com Smart Escrow",
    description: "Sistema inteligente que garante a proteção total de suas transações",
    gradient: "primary",
    details: [
      "Fundos bloqueados até confirmação",
      "Proteção contra fraudes",
      "Resolução automática de disputas",
      "Auditoria em blockchain"
    ]
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Múltiplas Criptomoedas",
    description: "Suporte para mais de 50 criptomoedas populares",
    gradient: "secondary",
    details: [
      "Bitcoin, Ethereum, USDT",
      "BNB, Cardano, Solana",
      "Polygon, Avalanche e mais",
      "Novos tokens toda semana"
    ]
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Chat em Tempo Real",
    description: "Comunique-se diretamente com outros traders de forma segura",
    gradient: "success",
    details: [
      "Mensagens criptografadas",
      "Compartilhamento de arquivos",
      "Histórico de conversas",
      "Notificações em tempo real"
    ]
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Sistema de Reputação",
    description: "Avaliações transparentes para traders confiáveis",
    gradient: "warning",
    details: [
      "Perfis verificados com KYC",
      "Histórico de transações",
      "Badges de confiança",
      "Sistema de níveis"
    ]
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: "PIX Integrado",
    description: "Receba pagamentos instantâneos via PIX 24/7",
    gradient: "luxury",
    details: [
      "Confirmação instantânea",
      "QR Code automático",
      "Integração bancária",
      "Comprovantes digitais"
    ]
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    title: "Zero Taxas Ocultas",
    description: "Transparência total em todas as transações",
    gradient: "dark",
    details: [
      "Taxas competitivas",
      "Sem surpresas",
      "Cálculo transparente",
      "Descontos por volume"
    ]
  }
];

export const Features: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container-premium">
        {/* Header da seção */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient bg-gradient-primary">Recursos Premium</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Tudo que você precisa para negociar criptomoedas com segurança e eficiência
          </p>
        </div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card
                variant="elevated"
                interactive
                className={cn(
                  "h-full transition-all duration-500",
                  "hover:shadow-2xl",
                  hoveredIndex === index && "transform scale-105"
                )}
                animate="fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Ícone com fundo gradiente */}
                <div className={cn(
                  "absolute -top-6 left-6",
                  "w-16 h-16 rounded-xl flex items-center justify-center",
                  `gradient-${feature.gradient}`,
                  "shadow-lg text-white",
                  "group-hover:scale-110 transition-transform duration-300"
                )}>
                  {feature.icon}
                </div>

                <CardContent className="pt-12">
                  <CardTitle className="mb-3" variant="gradient">
                    {feature.title}
                  </CardTitle>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {feature.description}
                  </p>

                  {/* Lista de detalhes com animação */}
                  <ul className={cn(
                    "space-y-2 overflow-hidden transition-all duration-500",
                    hoveredIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    {feature.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
                        style={{
                          transitionDelay: `${idx * 50}ms`
                        }}
                      >
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {/* Indicador visual de hover */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-1 transition-all duration-300",
                    `bg-gradient-${feature.gradient}`,
                    hoveredIndex === index ? "opacity-100" : "opacity-0"
                  )} />
                </CardContent>
              </Card>

              {/* Efeito de glow no hover */}
              {hoveredIndex === index && (
                <div
                  className={cn(
                    "absolute inset-0 -z-10 blur-2xl opacity-20",
                    `bg-gradient-${feature.gradient}`,
                    "animate-pulse"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* CTA adicional */}
        <div className="text-center mt-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Quer conhecer todos os recursos em detalhes?
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Ver documentação completa
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};