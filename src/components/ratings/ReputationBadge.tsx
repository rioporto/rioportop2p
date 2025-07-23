"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface IReputationBadgeProps {
  score: number;
  transactions: number;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
}

interface ILevelConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  textColor: string;
  shadowColor: string;
}

export const ReputationBadge: React.FC<IReputationBadgeProps> = ({
  score,
  transactions,
  level,
  size = "md",
  showDetails = true,
  className,
}) => {
  // Determinar nível baseado no score e transações se não fornecido
  const calculateLevel = (): "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" => {
    if (level) return level;

    if (transactions >= 50 && score >= 4.5) return "EXPERT";
    if (transactions >= 20 && score >= 4.0) return "ADVANCED";
    if (transactions >= 5 && score >= 3.5) return "INTERMEDIATE";
    return "BEGINNER";
  };

  const userLevel = calculateLevel();

  const levelConfigs: Record<string, ILevelConfig> = {
    BEGINNER: {
      label: "Bronze",
      color: "from-bronze-400 to-bronze-600",
      bg: "bg-gradient-to-b from-bronze-400 to-bronze-600",
      border: "border-bronze-700",
      icon: "🥉",
      textColor: "text-white",
      shadowColor: "shadow-bronze-500/30",
    },
    INTERMEDIATE: {
      label: "Prata",
      color: "from-gray-300 to-gray-500",
      bg: "bg-gradient-to-b from-gray-300 to-gray-500",
      border: "border-gray-600",
      icon: "🥈",
      textColor: "text-gray-800",
      shadowColor: "shadow-gray-500/30",
    },
    ADVANCED: {
      label: "Ouro",
      color: "from-yellow-400 to-yellow-600",
      bg: "bg-gradient-to-b from-yellow-400 to-yellow-600",
      border: "border-yellow-700",
      icon: "🥇",
      textColor: "text-gray-800",
      shadowColor: "shadow-yellow-500/30",
    },
    EXPERT: {
      label: "Diamante",
      color: "from-blue-400 to-purple-600",
      bg: "bg-gradient-to-b from-blue-400 to-purple-600",
      border: "border-purple-700",
      icon: "💎",
      textColor: "text-white",
      shadowColor: "shadow-purple-500/30",
    },
  };

  const config = levelConfigs[userLevel];
  const isVerified = score > 4.5;

  const sizes = {
    sm: {
      badge: "px-3 py-1.5 text-sm rounded-lg",
      icon: "text-base",
      details: "text-xs",
      verifiedIcon: "w-3 h-3",
    },
    md: {
      badge: "px-4 py-2 text-base rounded-xl",
      icon: "text-lg",
      details: "text-sm",
      verifiedIcon: "w-4 h-4",
    },
    lg: {
      badge: "px-5 py-3 text-lg rounded-2xl",
      icon: "text-xl",
      details: "text-base",
      verifiedIcon: "w-5 h-5",
    },
  };

  const currentSize = sizes[size];

  if (!showDetails) {
    // Badge compacto
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          config.bg,
          config.border,
          config.textColor,
          "border-2",
          "font-bold",
          "shadow-lg",
          config.shadowColor,
          currentSize.badge,
          "relative overflow-hidden",
          className
        )}
      >
        <span className={currentSize.icon}>{config.icon}</span>
        <span>{config.label}</span>
        {isVerified && (
          <svg
            className={cn(currentSize.verifiedIcon, "text-green-400")}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {/* Shine effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `linear-gradient(135deg, 
              transparent 30%, 
              rgba(255,255,255,0.5) 50%, 
              transparent 70%)`,
          }}
        />
      </span>
    );
  }

  // Badge detalhado
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center",
        "p-4 rounded-2xl",
        config.bg,
        config.border,
        config.textColor,
        "border-2",
        "shadow-xl",
        config.shadowColor,
        "relative overflow-hidden",
        "transition-all duration-300 hover:shadow-2xl hover:scale-105",
        className
      )}
    >
      {/* Ícone principal */}
      <div className="text-3xl mb-2">{config.icon}</div>

      {/* Nome do nível */}
      <h3 className="text-xl font-bold mb-1">{config.label}</h3>

      {/* Score com estrelas */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={cn(
                "w-4 h-4",
                star <= Math.round(score) ? "text-yellow-400" : "text-gray-400"
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="font-bold">{score.toFixed(1)}</span>
        {isVerified && (
          <svg
            className="w-5 h-5 text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Número de transações */}
      <p className={cn(currentSize.details, "opacity-90")}>
        {transactions} transações
      </p>

      {/* Efeito de brilho animado para diamante */}
      {userLevel === "EXPERT" && (
        <div className="absolute -inset-1 opacity-20">
          <div className="w-full h-full animate-pulse">
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(105deg, 
                  transparent 40%, 
                  rgba(255,255,255,0.7) 50%, 
                  transparent 60%)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Shine effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `linear-gradient(135deg, 
            transparent 30%, 
            rgba(255,255,255,0.5) 50%, 
            transparent 70%)`,
        }}
      />
    </div>
  );
};

// Componente auxiliar para exibir múltiplos badges
interface IReputationGroupProps {
  badges: Array<{
    userId: string;
    score: number;
    transactions: number;
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  }>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ReputationGroup: React.FC<IReputationGroupProps> = ({
  badges,
  size = "sm",
  className,
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge) => (
        <ReputationBadge
          key={badge.userId}
          score={badge.score}
          transactions={badge.transactions}
          level={badge.level}
          size={size}
          showDetails={false}
        />
      ))}
    </div>
  );
};