"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 via-transparent to-secondary-500/10 animate-pulse" />
        
        {/* Padrão de pontos animados */}
        <div className="absolute inset-0 texture-dots opacity-10" />
        
        {/* Círculos de gradiente flutuantes */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-bounce-soft" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-bounce-soft" style={{ animationDelay: "2s" }} />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 container-premium text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge de destaque */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 backdrop-blur-sm border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-white/90">Plataforma 100% Segura com Smart Escrow</span>
          </div>

          {/* Título principal com gradiente */}
          <h1 className="mb-6 text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-white">Compre e Venda</span>
            <br />
            <span className="text-gradient bg-gradient-primary inline-block animate-pulse">Criptomoedas</span>
            <br />
            <span className="text-white">com Segurança Total</span>
          </h1>

          {/* Subtítulo */}
          <p className="mb-10 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            A primeira plataforma P2P do Brasil com sistema de escrow inteligente. 
            Negocie Bitcoin, Ethereum e mais de 50 criptomoedas diretamente com outros usuários, 
            com proteção total em cada transação.
          </p>

          {/* CTAs principais */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              variant="gradient"
              gradient="primary"
              size="lg"
              className="min-w-[200px] shadow-xl hover:shadow-2xl hover:shadow-primary-500/25"
              glow
              glowColor="primary"
              animate="fadeIn"
            >
              Começar Agora
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            
            <Button
              variant="glass"
              size="lg"
              className="min-w-[200px] text-white border-white/20"
              animate="fadeIn"
              style={{ animationDelay: "200ms" }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver Como Funciona
            </Button>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center animate-fadeIn" style={{ animationDelay: "400ms" }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="text-gradient bg-gradient-success">100K+</span>
              </div>
              <p className="text-gray-400">Usuários Ativos</p>
            </div>
            
            <div className="text-center animate-fadeIn" style={{ animationDelay: "600ms" }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="text-gradient bg-gradient-warning">R$ 50M+</span>
              </div>
              <p className="text-gray-400">Volume Negociado</p>
            </div>
            
            <div className="text-center animate-fadeIn" style={{ animationDelay: "800ms" }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                <span className="text-gradient bg-gradient-luxury">0%</span>
              </div>
              <p className="text-gray-400">Taxa de Fraude</p>
            </div>
          </div>
        </div>

        {/* Seta indicativa de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Animação de moedas flutuantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-coin-float"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${10 + i * 2}s`,
            }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-luxury opacity-20 blur-sm" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes coin-float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-coin-float {
          animation: coin-float linear infinite;
        }
      `}</style>
    </section>
  );
};