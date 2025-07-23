"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface Stat {
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
  color: string;
}

const stats: Stat[] = [
  {
    label: "Volume Total Negociado",
    value: 127500000,
    prefix: "R$ ",
    suffix: "M",
    decimals: 1,
    color: "primary"
  },
  {
    label: "Transações Realizadas",
    value: 485000,
    suffix: "+",
    color: "secondary"
  },
  {
    label: "Usuários Verificados",
    value: 98500,
    suffix: "+",
    color: "success"
  },
  {
    label: "Tempo Médio de Transação",
    value: 5.5,
    suffix: " min",
    decimals: 1,
    color: "warning"
  }
];

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2000
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endValue = value;

    const updateNumber = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function para animação suave
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = endValue * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value, duration, isVisible]);

  const formatValue = (val: number) => {
    if (prefix === "R$ " && suffix === "M") {
      return (val / 1000000).toFixed(decimals);
    }
    return val.toFixed(decimals);
  };

  return (
    <span ref={elementRef}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
};

export const Stats: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-secondary-500/10" />
        <div className="absolute inset-0 texture-lines opacity-5" />
      </div>

      <div className="container-premium relative z-10">
        {/* Header da seção */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Números que <span className="text-gradient bg-gradient-luxury">Impressionam</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A confiança de milhares de usuários refletida em cada transação
          </p>
        </div>

        {/* Grid de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative"
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 100}ms both`
              }}
            >
              <div className="relative p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105">
                {/* Ícone decorativo */}
                <div className={cn(
                  "absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10",
                  `bg-gradient-${stat.color}`
                )} />

                {/* Valor animado */}
                <div className={cn(
                  "text-4xl md:text-5xl font-bold mb-2",
                  "text-gradient",
                  `bg-gradient-${stat.color}`
                )}>
                  <AnimatedNumber
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>

                {/* Label */}
                <p className="text-gray-400 font-medium">{stat.label}</p>

                {/* Barra de progresso decorativa */}
                <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-2000",
                      `bg-gradient-${stat.color}`,
                      "animate-slide-right"
                    )}
                    style={{
                      animationDelay: `${index * 200 + 500}ms`
                    }}
                  />
                </div>

                {/* Efeito de glow no hover */}
                <div className={cn(
                  "absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl",
                  `bg-gradient-${stat.color}`
                )} />
              </div>
            </div>
          ))}
        </div>

        {/* Indicadores adicionais */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-green-400 mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-2xl font-bold">99.9%</span>
            </div>
            <p className="text-gray-400">Uptime da Plataforma</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-yellow-400 mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="text-2xl font-bold">24/7</span>
            </div>
            <p className="text-gray-400">Suporte Disponível</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-blue-400 mb-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-2xl font-bold">100%</span>
            </div>
            <p className="text-gray-400">Transações Seguras</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-right {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-slide-right {
          animation: slide-right 2s ease-out forwards;
        }
      `}</style>
    </section>
  );
};