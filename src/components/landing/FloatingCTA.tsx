"use client";

import React, { useState, useEffect } from "react";
import { CTAButton } from "./CTAButton";
import { cn } from "@/lib/utils/cn";

interface IFloatingCTAProps {
  /** Text for the CTA button */
  ctaText?: string;
  /** Click handler */
  onCTAClick: () => void;
  /** Show after scrolling X pixels */
  showAfterScroll?: number;
  /** Position of the floating CTA */
  position?: "bottom" | "bottom-right" | "bottom-left";
  /** Hide on specific screen sizes */
  hideOnDesktop?: boolean;
  /** Show countdown timer */
  showCountdown?: boolean;
  /** Countdown duration in seconds */
  countdownDuration?: number;
  /** Custom class name */
  className?: string;
}

export const FloatingCTA: React.FC<IFloatingCTAProps> = ({
  ctaText = "EU QUERO",
  onCTAClick,
  showAfterScroll = 100,
  position = "bottom",
  hideOnDesktop = true,
  showCountdown = false,
  countdownDuration = 300, // 5 minutes
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [countdown, setCountdown] = useState(countdownDuration);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > showAfterScroll);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll]);

  // Show/hide logic
  useEffect(() => {
    // Don't show if user has already interacted
    if (hasInteracted) {
      setIsVisible(false);
      return;
    }

    // Show after scroll threshold
    if (scrolled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500); // Small delay for better UX

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [scrolled, hasInteracted]);

  // Countdown timer
  useEffect(() => {
    if (!showCountdown || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown, countdown]);

  // Handle CTA click
  const handleClick = () => {
    setHasInteracted(true);
    
    // Track floating CTA interaction
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "floating_cta_click", {
        position,
        countdown_remaining: countdown,
        scroll_depth: window.scrollY,
      });
    }

    onCTAClick();
  };

  // Format countdown display
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Position styles
  const getPositionStyles = () => {
    const base = "fixed z-50 transition-all duration-500 ease-out";
    
    switch (position) {
      case "bottom":
        return cn(base, "bottom-0 left-0 right-0 px-4 pb-4");
      case "bottom-right":
        return cn(base, "bottom-4 right-4");
      case "bottom-left":
        return cn(base, "bottom-4 left-4");
      default:
        return base;
    }
  };

  return (
    <>
      {/* Floating CTA Container */}
      <div
        className={cn(
          getPositionStyles(),
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
          hideOnDesktop && "lg:hidden",
          className
        )}
      >
        <div className={cn(
          "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700",
          "backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95",
          position === "bottom" ? "w-full" : "max-w-sm"
        )}>
          {/* Close button */}
          <button
            onClick={() => setHasInteracted(true)}
            className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-4">
            {/* Countdown timer */}
            {showCountdown && countdown > 0 && (
              <div className="mb-3 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Oferta expira em</span>
                <div className="text-2xl font-bold text-orange-500 tabular-nums">
                  {formatCountdown(countdown)}
                </div>
              </div>
            )}

            {/* Value proposition */}
            <div className="mb-4 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Comece a negociar crypto com segurança
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="text-green-500 font-semibold">Grátis</span> • Sem taxas ocultas • 100% seguro
              </p>
            </div>

            {/* CTA Button */}
            <CTAButton
              text={ctaText}
              onClick={handleClick}
              variant="primary"
              size="md"
              fullWidthMobile
              showTrustSignals={false}
              analyticsEvent="floating_cta_click"
              analyticsData={{
                position,
                countdown_remaining: countdown,
              }}
            />

            {/* Trust badges */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verificado</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop blur for mobile when CTA is visible */}
      {isVisible && position === "bottom" && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setHasInteracted(true)}
        />
      )}
    </>
  );
};

// Mini floating CTA variant
export const MiniFloatingCTA: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "w-14 h-14 rounded-full",
        "bg-gradient-to-r from-primary-500 to-primary-600",
        "text-white shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-300",
        "hover:scale-110 active:scale-95",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
        "lg:hidden", // Mobile only
        className
      )}
      aria-label="Abrir formulário de cadastro"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-75" />
    </button>
  );
};