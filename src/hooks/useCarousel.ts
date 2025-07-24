"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseCarouselOptions {
  totalItems: number;
  autoPlayInterval?: number;
  loop?: boolean;
}

export const useCarousel = ({ 
  totalItems, 
  autoPlayInterval = 5000,
  loop = true 
}: UseCarouselOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle auto-play
  useEffect(() => {
    if (!isAutoPlaying || totalItems <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex, totalItems, autoPlayInterval]);

  // Resume auto-play after user interaction
  const resumeAutoPlay = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    
    setIsAutoPlaying(false);
    autoPlayTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000); // Resume after 10 seconds
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (loop) {
        return (prev + 1) % totalItems;
      }
      return Math.min(prev + 1, totalItems - 1);
    });
  }, [totalItems, loop]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (loop) {
        return prev === 0 ? totalItems - 1 : prev - 1;
      }
      return Math.max(prev - 1, 0);
    });
  }, [totalItems, loop]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    resumeAutoPlay();
  }, [resumeAutoPlay]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
      resumeAutoPlay();
    }
    if (isRightSwipe) {
      goToPrevious();
      resumeAutoPlay();
    }

    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd, goToNext, goToPrevious, resumeAutoPlay]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
        resumeAutoPlay();
      } else if (e.key === "ArrowRight") {
        goToNext();
        resumeAutoPlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, resumeAutoPlay]);

  return {
    currentIndex,
    isAutoPlaying,
    goToNext,
    goToPrevious,
    goToSlide,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    canGoNext: loop || currentIndex < totalItems - 1,
    canGoPrevious: loop || currentIndex > 0
  };
};