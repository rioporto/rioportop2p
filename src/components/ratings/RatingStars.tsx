"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface IRatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export const RatingStars: React.FC<IRatingStarsProps> = ({
  value,
  onChange,
  readonly = false,
  size = "md",
  showValue = false,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue !== null ? hoverValue : value;

  const sizes = {
    sm: {
      star: "w-4 h-4",
      text: "text-xs",
      gap: "gap-0.5",
    },
    md: {
      star: "w-6 h-6",
      text: "text-sm",
      gap: "gap-1",
    },
    lg: {
      star: "w-8 h-8",
      text: "text-base",
      gap: "gap-1.5",
    },
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const getStarColor = (starIndex: number) => {
    const filled = starIndex <= displayValue;
    const halfFilled = starIndex - 0.5 === displayValue;

    if (halfFilled) {
      return "text-yellow-500";
    }

    return filled ? "text-yellow-500" : "text-gray-300";
  };

  const getStarFill = (starIndex: number) => {
    const fillPercentage = Math.min(Math.max(displayValue - (starIndex - 1), 0), 1) * 100;
    return fillPercentage;
  };

  return (
    <div className={cn("flex items-center", sizes[size].gap, className)}>
      <div className={cn("flex", sizes[size].gap)}>
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <button
            key={starIndex}
            type="button"
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={cn(
              "relative transition-all duration-200",
              !readonly && [
                "cursor-pointer",
                "hover:scale-110",
                "active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded",
              ],
              readonly && "cursor-default"
            )}
            aria-label={`Rate ${starIndex} star${starIndex > 1 ? "s" : ""}`}
          >
            {/* Background Star (empty) */}
            <svg
              className={cn(
                sizes[size].star,
                "text-gray-300",
                "transition-colors duration-200"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>

            {/* Filled Star */}
            <svg
              className={cn(
                sizes[size].star,
                "absolute inset-0",
                getStarColor(starIndex),
                "transition-all duration-200"
              )}
              fill="currentColor"
              viewBox="0 0 24 24"
              style={{
                clipPath: `inset(0 ${100 - getStarFill(starIndex)}% 0 0)`,
              }}
            >
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        ))}
      </div>

      {showValue && (
        <span
          className={cn(
            sizes[size].text,
            "font-semibold text-gray-700 ml-1",
            "tabular-nums"
          )}
        >
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// Componente de exibição compacta para listagens
interface IRatingDisplayProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export const RatingDisplay: React.FC<IRatingDisplayProps> = ({
  value,
  count,
  size = "sm",
  showCount = true,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RatingStars value={value} readonly size={size} />
      {showCount && count !== undefined && (
        <span className="text-gray-500 text-sm">({count})</span>
      )}
    </div>
  );
};