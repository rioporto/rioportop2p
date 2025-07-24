"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { IMetric } from "@/types/social-proof";

interface MetricsDisplayProps {
  metric: IMetric;
  className?: string;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  metric,
  className,
  animate = true,
  size = "md"
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(metric.value);
      return;
    }

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
  }, [animate, metric.value]);

  useEffect(() => {
    if (!isVisible || !animate) return;

    const duration = 2000;
    const startTime = Date.now();
    const endValue = metric.value;

    const updateNumber = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = endValue * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [metric.value, isVisible, animate]);

  const sizeClasses = {
    sm: {
      container: "p-4",
      value: "text-2xl",
      label: "text-sm",
      trend: "text-xs"
    },
    md: {
      container: "p-6",
      value: "text-3xl md:text-4xl",
      label: "text-base",
      trend: "text-sm"
    },
    lg: {
      container: "p-8",
      value: "text-4xl md:text-5xl",
      label: "text-lg",
      trend: "text-base"
    }
  };

  const sizes = sizeClasses[size];

  const formatValue = (val: number) => {
    // If it's a percentage or small number, show decimals
    if (metric.suffix === "%" || val < 100) {
      return val.toFixed(val < 10 ? 1 : 0);
    }
    // For larger numbers, format with commas
    return Math.floor(val).toLocaleString();
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "relative group",
        "bg-gray-800/50 backdrop-blur-sm",
        "border border-gray-700/50",
        "rounded-xl",
        "hover:border-gray-600/50",
        "transition-all duration-300",
        "hover:transform hover:scale-105",
        "overflow-hidden",
        sizes.container,
        className
      )}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Value */}
        <div className={cn(
          "font-bold mb-2",
          "text-gradient bg-gradient-to-r from-primary-400 to-secondary-400",
          sizes.value
        )}>
          {metric.prefix}
          {formatValue(displayValue)}
          {metric.suffix}
        </div>

        {/* Label */}
        <div className={cn(
          "text-gray-400 font-medium mb-2",
          sizes.label
        )}>
          {metric.label}
        </div>

        {/* Trend indicator */}
        {metric.trend && (
          <div className={cn(
            "flex items-center gap-1",
            sizes.trend,
            metric.trend.isPositive ? "text-green-400" : "text-red-400"
          )}>
            <svg
              className={cn(
                "w-4 h-4",
                !metric.trend.isPositive && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{metric.trend.value}%</span>
          </div>
        )}

        {/* Description */}
        {metric.description && (
          <p className={cn(
            "text-gray-500 mt-2",
            size === "sm" ? "text-xs" : "text-sm"
          )}>
            {metric.description}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-2000"
          style={{
            width: isVisible && animate ? '100%' : '0%',
            transitionDelay: '500ms'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-10px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
};