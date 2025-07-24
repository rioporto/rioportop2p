"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface IScrollToTopProps {
  /** Target element ID to scroll to (optional) */
  targetId?: string;
  /** Show after scrolling X pixels */
  showAfterScroll?: number;
  /** Position of the button */
  position?: "bottom-right" | "bottom-left";
  /** Custom class name */
  className?: string;
  /** Hide on desktop */
  hideOnDesktop?: boolean;
}

export const ScrollToTop: React.FC<IScrollToTopProps> = ({
  targetId,
  showAfterScroll = 300,
  position = "bottom-right",
  className,
  hideOnDesktop = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > showAfterScroll);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll]);

  const scrollToTarget = () => {
    setIsScrolling(true);

    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Track scroll to top action
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "scroll_to_action", {
        target: targetId || "top",
        scroll_depth: window.scrollY,
      });
    }

    setTimeout(() => setIsScrolling(false), 1000);
  };

  const positionClasses = position === "bottom-right" 
    ? "bottom-6 right-6" 
    : "bottom-6 left-6";

  return (
    <button
      onClick={scrollToTarget}
      className={cn(
        "fixed z-40",
        positionClasses,
        "w-12 h-12 rounded-full",
        "bg-white dark:bg-gray-800 shadow-lg",
        "flex items-center justify-center",
        "transition-all duration-300",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none",
        isScrolling && "animate-bounce",
        hideOnDesktop && "lg:hidden",
        className
      )}
      aria-label={targetId ? "Ir para cadastro" : "Voltar ao topo"}
    >
      <svg 
        className={cn(
          "w-6 h-6 text-gray-600 dark:text-gray-300",
          "transition-transform duration-300",
          isScrolling && "scale-125"
        )}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>

      {/* Pulse ring on hover */}
      <span className="absolute inset-0 rounded-full bg-primary-500 opacity-0 hover:animate-ping hover:opacity-20" />
    </button>
  );
};

// Smooth scroll utility function
export const smoothScrollTo = (elementId: string, offset: number = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    // Track smooth scroll
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "smooth_scroll", {
        target_element: elementId,
        offset: offset,
      });
    }
  }
};