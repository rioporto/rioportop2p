"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface ITrustSignal {
  icon: React.ReactNode;
  text: string;
  highlight?: string;
}

interface ITrustSignalsProps {
  /** Array of trust signals to display */
  signals?: ITrustSignal[];
  /** Layout variant */
  variant?: "horizontal" | "vertical" | "grid";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show animations */
  animated?: boolean;
  /** Custom class name */
  className?: string;
}

const defaultSignals: ITrustSignal[] = [
  {
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    text: "100% Seguro",
    highlight: "100%",
  },
  {
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
    text: "+100K usuários",
    highlight: "100K",
  },
  {
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
    text: "4.9/5 avaliação",
    highlight: "4.9/5",
  },
];

export const TrustSignals: React.FC<ITrustSignalsProps> = ({
  signals = defaultSignals,
  variant = "horizontal",
  size = "md",
  animated = true,
  className,
}) => {
  const sizeClasses = {
    sm: {
      container: "text-xs",
      icon: "w-3 h-3",
      gap: "gap-1",
    },
    md: {
      container: "text-sm",
      icon: "w-4 h-4",
      gap: "gap-1.5",
    },
    lg: {
      container: "text-base",
      icon: "w-5 h-5",
      gap: "gap-2",
    },
  };

  const layoutClasses = {
    horizontal: "flex flex-wrap items-center justify-center gap-4 md:gap-6",
    vertical: "flex flex-col gap-3",
    grid: "grid grid-cols-1 sm:grid-cols-3 gap-4",
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn(layoutClasses[variant], sizes.container, className)}>
      {signals.map((signal, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center",
            sizes.gap,
            "text-gray-600 dark:text-gray-400",
            animated && "animate-fadeIn",
            variant === "grid" && "justify-center"
          )}
          style={{
            animationDelay: animated ? `${index * 100}ms` : undefined,
          }}
        >
          <span className={cn(sizes.icon, "text-primary-500 flex-shrink-0")}>
            {signal.icon}
          </span>
          <span>
            {signal.highlight ? (
              <>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {signal.highlight}
                </span>
                {signal.text.replace(signal.highlight, "")}
              </>
            ) : (
              signal.text
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

// Compact trust badge for inline use
export const TrustBadge: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5",
      "bg-green-50 dark:bg-green-900/20",
      "border border-green-200 dark:border-green-800",
      "rounded-full text-xs",
      className
    )}>
      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="text-green-700 dark:text-green-300 font-medium">
        Plataforma Verificada
      </span>
    </div>
  );
};

// Security features list
export const SecurityFeatures: React.FC<{
  className?: string;
}> = ({ className }) => {
  const features = [
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Escrow Inteligente",
      description: "Seus fundos ficam protegidos até a confirmação",
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Verificação KYC",
      description: "Todos os usuários são verificados",
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "2FA Obrigatório",
      description: "Dupla autenticação para maior segurança",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {features.map((feature, index) => (
        <div
          key={index}
          className="flex gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
            <span className="w-5 h-5 text-primary-600 dark:text-primary-400">
              {feature.icon}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {feature.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Live counter for active users
export const LiveUserCounter: React.FC<{
  baseCount?: number;
  className?: string;
}> = ({ baseCount = 1247, className }) => {
  const [count, setCount] = React.useState(baseCount);

  React.useEffect(() => {
    // Simulate live user count changes
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.max(baseCount - 50, Math.min(baseCount + 50, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [baseCount]);

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5",
      "bg-green-50 dark:bg-green-900/20",
      "border border-green-200 dark:border-green-800",
      "rounded-full text-sm",
      className
    )}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-green-700 dark:text-green-300">
        <span className="font-semibold tabular-nums">{count.toLocaleString()}</span> usuários online
      </span>
    </div>
  );
};