"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CTAButton } from "./CTAButton";
import { cn } from "@/lib/utils/cn";

interface IExitIntentPopupProps {
  /** Callback when user clicks CTA */
  onCTAClick: () => void;
  /** Callback when popup is closed */
  onClose?: () => void;
  /** Delay before showing popup (ms) */
  delay?: number;
  /** Show only once per session */
  showOnce?: boolean;
  /** Custom headline */
  headline?: string;
  /** Custom description */
  description?: string;
  /** Show countdown offer */
  showCountdown?: boolean;
  /** Offer percentage */
  offerPercentage?: number;
  /** Show on mobile */
  showOnMobile?: boolean;
}

export const ExitIntentPopup: React.FC<IExitIntentPopupProps> = ({
  onCTAClick,
  onClose,
  delay = 0,
  showOnce = true,
  headline = "Espere! Não vá embora ainda!",
  description = "Cadastre-se agora e ganhe acesso ao nosso curso P2P gratuito!",
  showCountdown = true,
  offerPercentage = 100,
  showOnMobile = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [countdown, setCountdown] = useState(59); // 59 seconds
  const [isClosing, setIsClosing] = useState(false);

  // Check if popup should be shown based on session
  useEffect(() => {
    if (showOnce) {
      const shown = sessionStorage.getItem("exitIntentShown");
      if (shown === "true") {
        setHasShown(true);
      }
    }
  }, [showOnce]);

  // Exit intent detection
  useEffect(() => {
    if (hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger on desktop when mouse leaves through the top
      if (e.clientY <= 0 && !showOnMobile && window.innerWidth >= 768) {
        showPopup();
      }
    };

    // Mobile exit intent - detect when user scrolls up quickly
    let lastScrollTop = 0;
    let scrollVelocity = 0;
    let lastScrollTime = Date.now();

    const handleScroll = () => {
      if (!showOnMobile || window.innerWidth >= 768) return;

      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastScrollTime;
      
      if (timeDiff > 0) {
        scrollVelocity = (lastScrollTop - currentScrollTop) / timeDiff;
      }

      // Detect fast upward scroll (exit intent on mobile)
      if (scrollVelocity > 2 && currentScrollTop < lastScrollTop && currentScrollTop < 100) {
        showPopup();
      }

      lastScrollTop = currentScrollTop;
      lastScrollTime = currentTime;
    };

    // Back button detection for mobile
    const handlePopState = () => {
      if (showOnMobile && window.innerWidth < 768) {
        showPopup();
        // Push state again to keep user on page
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Set up listeners after delay
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
      
      if (showOnMobile) {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("popstate", handlePopState);
        // Push initial state for back button detection
        window.history.pushState(null, "", window.location.href);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [delay, hasShown, showOnMobile]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible || !showCountdown || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, showCountdown, countdown]);

  const showPopup = useCallback(() => {
    if (!hasShown) {
      setIsVisible(true);
      setHasShown(true);
      
      if (showOnce) {
        sessionStorage.setItem("exitIntentShown", "true");
      }

      // Track exit intent shown
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "exit_intent_shown", {
          delay,
          device: window.innerWidth < 768 ? "mobile" : "desktop",
        });
      }
    }
  }, [hasShown, showOnce, delay]);

  const handleClose = () => {
    setIsClosing(true);
    
    // Track exit intent dismissed
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exit_intent_dismissed", {
        countdown_remaining: countdown,
      });
    }

    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleCTAClick = () => {
    // Track exit intent conversion
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exit_intent_conversion", {
        countdown_remaining: countdown,
        offer_percentage: offerPercentage,
      });
    }

    handleClose();
    onCTAClick();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]",
          "transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={cn(
          "fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101]",
          "max-w-lg mx-auto",
          "transition-all duration-300",
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10" />
          
          {/* Content */}
          <div className="relative p-8 sm:p-10 text-center">
            {/* Animated icon */}
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              {/* Sparkles */}
              <div className="absolute -top-2 -left-2 text-yellow-400">
                <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l1.09 3.35L16.5 6l-3.35 1.09L12 10.5l-1.09-3.41L7.5 6l3.41-1.09L12 2m5.5 7l.72 2.22L20.5 12l-2.22.72L17.5 15l-.72-2.28L14.5 12l2.28-.72L17.5 9M3.5 9l.72 2.22L6.5 12l-2.22.72L3.5 15l-.72-2.28L.5 12l2.28-.72L3.5 9z" />
                </svg>
              </div>
              <div className="absolute -bottom-2 -right-2 text-primary-400">
                <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 24 24" style={{ animationDelay: "500ms" }}>
                  <path d="M12 2l1.09 3.35L16.5 6l-3.35 1.09L12 10.5l-1.09-3.41L7.5 6l3.41-1.09L12 2z" />
                </svg>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 animate-slideInUp">
              {headline}
            </h2>

            {/* Offer badge */}
            {showCountdown && (
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 animate-pulse">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {offerPercentage}% GRÁTIS
                </span>
                {countdown > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    por {countdown}s
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-sm mx-auto animate-slideInUp" style={{ animationDelay: "100ms" }}>
              {description}
            </p>

            {/* Benefits list */}
            <ul className="space-y-3 mb-8 text-left max-w-xs mx-auto">
              {[
                "Sistema de escrow inteligente",
                "Curso P2P completo incluído",
                "Suporte 24/7 via chat",
                "Sem taxas ocultas"
              ].map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 animate-slideInLeft"
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <CTAButton
              text="QUERO COMEÇAR AGORA"
              onClick={handleCTAClick}
              variant="primary"
              size="lg"
              fullWidthMobile
              className="mb-4"
              analyticsEvent="exit_intent_cta_click"
            />

            {/* Alternative action */}
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Talvez mais tarde
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }
      `}</style>
    </>
  );
};