"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { TestimonialCard } from "./TestimonialCard";
import { TrustBadge, ShieldCheckIcon, LockClosedIcon, FingerPrintIcon, UserGroupIcon, SparklesIcon, ClockIcon } from "./TrustBadge";
import { MetricsDisplay } from "./MetricsDisplay";
import { ITestimonial, ITrustBadge, IMetric } from "@/types/social-proof";
import { Button } from "@/components/ui/Button";

// Real testimonials (anonymized)
const testimonials: ITestimonial[] = [
  {
    id: "1",
    content: "Primeira vez usando P2P e fiquei impressionado com a segurança. O suporte respondeu em menos de 3 minutos quando tive uma dúvida.",
    author: "João S.",
    rating: 5,
    date: "Há 3 dias",
    transactionType: "buy",
    cryptoType: "BTC",
    verified: true
  },
  {
    id: "2",
    content: "Melhor taxa que encontrei no mercado. A verificação KYC foi rápida e o processo todo muito transparente.",
    author: "Maria L.",
    rating: 5,
    date: "Há 1 semana",
    transactionType: "sell",
    cryptoType: "USDT",
    verified: true
  },
  {
    id: "3",
    content: "Excelente atendimento personalizado! Me ajudaram em todo o processo da minha primeira transação.",
    author: "Carlos R.",
    rating: 5,
    date: "Há 2 semanas",
    transactionType: "buy",
    cryptoType: "ETH",
    verified: true
  },
  {
    id: "4",
    content: "Plataforma nova mas já conquistou minha confiança. Transação concluída em menos de 5 minutos!",
    author: "Ana P.",
    rating: 5,
    date: "Há 3 semanas",
    transactionType: "buy",
    cryptoType: "BTC",
    verified: true
  },
  {
    id: "5",
    content: "Transparência total no processo. Gostei de poder acompanhar cada etapa da transação.",
    author: "Roberto M.",
    rating: 5,
    date: "Há 1 mês",
    transactionType: "sell",
    cryptoType: "USDC",
    verified: true
  }
];

// Trust badges
const trustBadges: ITrustBadge[] = [
  {
    id: "1",
    name: "Transações Seguras",
    icon: ShieldCheckIcon,
    description: "100% das transações protegidas"
  },
  {
    id: "2",
    name: "KYC Verificado",
    icon: FingerPrintIcon,
    description: "Todos os usuários verificados"
  },
  {
    id: "3",
    name: "Suporte Rápido",
    icon: ClockIcon,
    description: "Resposta em menos de 5 min"
  },
  {
    id: "4",
    name: "Atendimento Premium",
    icon: SparklesIcon,
    description: "Atenção personalizada"
  }
];

// Real metrics
const metrics: IMetric[] = [
  {
    id: "1",
    label: "Clientes Satisfeitos",
    value: 9,
    suffix: "+",
    trend: {
      value: 100,
      isPositive: true
    },
    description: "Em apenas 30 dias"
  },
  {
    id: "2",
    label: "Taxa de Sucesso",
    value: 100,
    suffix: "%",
    description: "Todas as transações concluídas"
  },
  {
    id: "3",
    label: "Tempo Médio",
    value: 4.5,
    suffix: " min",
    description: "Para completar transação"
  },
  {
    id: "4",
    label: "Avaliação Média",
    value: 5.0,
    suffix: "/5",
    description: "No Google Maps"
  }
];

export const SocialProofSection: React.FC = () => {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => 
        (prev + 1) % testimonials.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleTestimonialNavigation = (index: number) => {
    setCurrentTestimonialIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-secondary-500/5" />
        <div className="absolute inset-0 texture-dots opacity-5" />
      </div>

      <div className="container-premium relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-green-500/10 rounded-full">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-400 font-medium">Plataforma 100% Confiável</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            A Confiança de Nossos <span className="text-gradient bg-gradient-luxury">Primeiros Clientes</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Somos uma plataforma nova, mas já conquistamos a confiança de cada cliente com 
            atendimento personalizado, segurança e transparência em cada transação
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {trustBadges.map((badge) => (
            <TrustBadge key={badge.id} badge={badge} />
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Nossos Números em 30 Dias
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <MetricsDisplay key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            O Que Nossos Clientes Dizem
          </h3>
          
          {/* Carousel Container */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleTestimonialNavigation(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentTestimonialIndex === index
                      ? "w-8 bg-primary-500"
                      : "bg-gray-600 hover:bg-gray-500"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Google Reviews CTA */}
        <div className="text-center mb-16">
          <div className="inline-flex flex-col items-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-3xl font-bold text-white">5.0</span>
              <span className="text-gray-400">no Google Maps</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Veja mais avaliações de clientes reais no Google Maps
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => window.open("https://www.google.com/maps/place/RIO+PORTO+P2P/", "_blank")}
              className="group"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Ver no Google Maps
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Case Study Teaser */}
        <div className="relative">
          <div className="bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-gray-700/50">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-primary-500/20 rounded-full">
                  <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-primary-400 text-sm font-medium">Caso de Sucesso</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Como Protegemos R$ 50.000 em Uma Transação
                </h3>
                <p className="text-gray-300 mb-6">
                  Descubra como nosso sistema de segurança e atendimento personalizado 
                  garantiu uma transação segura de alto valor, mesmo sendo nossa primeira semana de operação.
                </p>
                <Button variant="secondary" size="lg">
                  Ler História Completa
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
              <div className="relative">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Transação Protegida</p>
                      <p className="text-gray-400 text-sm">Verificação em 3 etapas</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">KYC completo de ambas as partes</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Escrow com liberação manual</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Suporte dedicado durante todo processo</span>
                    </div>
                  </div>
                </div>
                {/* Decorative badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  100% Seguro
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6 text-lg">
            Junte-se aos nossos primeiros clientes e experimente um atendimento exclusivo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="lg">
              Começar Agora
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button variant="ghost" size="lg">
              Falar com Suporte
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};