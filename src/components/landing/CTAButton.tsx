"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ICTAButtonProps {
  /** Primary text for the CTA */
  text: string;
  /** Alternative text for A/B testing */
  alternativeText?: string;
  /** Click handler */
  onClick: () => void;
  /** Variant style */
  variant?: "primary" | "secondary" | "urgent" | "value";
  /** Size of the button */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show urgency indicator */
  showUrgency?: boolean;
  /** Urgency message */
  urgencyMessage?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Enable A/B testing */
  enableABTest?: boolean;
  /** Custom class name */
  className?: string;
  /** Analytics event name */
  analyticsEvent?: string;
  /** Additional analytics data */
  analyticsData?: Record<string, any>;
  /** Show trust signals */
  showTrustSignals?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width on mobile */
  fullWidthMobile?: boolean;
}

export const CTAButton: React.FC<ICTAButtonProps> = ({
  text,
  alternativeText,
  onClick,
  variant = "primary",
  size = "lg",
  showUrgency = false,
  urgencyMessage,
  icon,
  enableABTest = false,
  className,
  analyticsEvent = "cta_click",
  analyticsData = {},
  showTrustSignals = false,
  loading = false,
  disabled = false,
  fullWidthMobile = true,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // A/B Testing logic
  useEffect(() => {
    if (enableABTest && alternativeText) {
      // Simple A/B test: 50/50 split based on timestamp
      const useAlternative = new Date().getTime() % 2 === 0;
      setDisplayText(useAlternative ? alternativeText : text);
      
      // Track which variant was shown
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "ab_test_variant", {
          test_name: "cta_text",
          variant: useAlternative ? "B" : "A",
          text: useAlternative ? alternativeText : text,
        });
      }
    }
  }, [text, alternativeText, enableABTest]);

  const handleClick = () => {
    if (disabled || loading) return;

    // Increment click count for micro-interactions
    setClickCount(prev => prev + 1);

    // Track analytics event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", analyticsEvent, {
        cta_variant: variant,
        cta_text: displayText,
        click_count: clickCount + 1,
        has_urgency: showUrgency,
        ...analyticsData,
      });
    }

    // Add haptic feedback on mobile
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }

    onClick();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          button: "gradient-primary",
          glow: "primary" as const,
          gradient: "primary" as const,
        };
      case "secondary":
        return {
          button: "gradient-secondary",
          glow: "secondary" as const,
          gradient: "secondary" as const,
        };
      case "urgent":
        return {
          button: "gradient-warning",
          glow: "warning" as const,
          gradient: "warning" as const,
        };
      case "value":
        return {
          button: "gradient-success",
          glow: "success" as const,
          gradient: "success" as const,
        };
      default:
        return {
          button: "gradient-primary",
          glow: "primary" as const,
          gradient: "primary" as const,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={cn("relative inline-block", fullWidthMobile && "w-full sm:w-auto")}>
      {/* Urgency indicator above button */}
      {showUrgency && urgencyMessage && (
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-center animate-pulse">
          <span className="text-xs font-medium text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
            {urgencyMessage}
          </span>
        </div>
      )}

      {/* Main CTA Button */}
      <Button
        variant="gradient"
        gradient={styles.gradient}
        size={size}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
        loading={loading}
        glow={isHovered || clickCount > 0}
        glowColor={styles.glow}
        pulse={variant === "urgent"}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "shadow-lg hover:shadow-xl",
          fullWidthMobile && "w-full sm:w-auto",
          isHovered && "transform scale-105",
          clickCount > 0 && "animate-subtle-bounce",
          className
        )}
        icon={icon}
        animate="scaleUp"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {displayText}
          
          {/* Micro-interaction: Click feedback */}
          {clickCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
        </span>

        {/* Shimmer effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </Button>

      {/* Trust signals below button */}
      {showTrustSignals && (
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            100% Seguro
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            +100K usuários
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          to {
            transform: translateX(200%);
          }
        }
        
        @keyframes subtle-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 1s ease-out;
        }
        
        .animate-subtle-bounce {
          animation: subtle-bounce 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

// Pre-configured CTA variants for common use cases
export const PrimaryCTA: React.FC<Partial<ICTAButtonProps>> = (props) => (
  <CTAButton
    text="EU QUERO"
    variant="primary"
    showTrustSignals
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    }
    {...props}
  />
);

export const UrgentCTA: React.FC<Partial<ICTAButtonProps>> = (props) => (
  <CTAButton
    text="GARANTIR MINHA VAGA"
    variant="urgent"
    showUrgency
    urgencyMessage="Últimas vagas disponíveis!"
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    {...props}
  />
);

export const ValueCTA: React.FC<Partial<ICTAButtonProps>> = (props) => (
  <CTAButton
    text="ACESSAR CURSO GRÁTIS"
    variant="value"
    icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    }
    {...props}
  />
);