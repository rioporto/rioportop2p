"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDownIcon, ClockIcon, CurrencyDollarIcon, StarIcon, FireIcon } from "@heroicons/react/24/outline";

export type SortOption = "newest" | "price_low" | "price_high" | "reputation" | "popular";

interface SortOptionsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

const sortOptions = [
  {
    value: "newest" as SortOption,
    label: "Mais Recentes",
    icon: ClockIcon,
    description: "Anúncios mais novos primeiro"
  },
  {
    value: "price_low" as SortOption,
    label: "Menor Preço",
    icon: CurrencyDollarIcon,
    description: "Do menor para o maior preço"
  },
  {
    value: "price_high" as SortOption,
    label: "Maior Preço",
    icon: CurrencyDollarIcon,
    description: "Do maior para o menor preço"
  },
  {
    value: "reputation" as SortOption,
    label: "Melhor Reputação",
    icon: StarIcon,
    description: "Vendedores mais confiáveis"
  },
  {
    value: "popular" as SortOption,
    label: "Mais Populares",
    icon: FireIcon,
    description: "Mais transações realizadas"
  }
];

export const SortOptions: React.FC<SortOptionsProps> = ({
  value,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = sortOptions.find(option => option.value === value) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3",
          "px-4 py-3 rounded-xl",
          "bg-gradient-to-b from-gray-50 to-gray-100",
          "border border-gray-300",
          "shadow-skeuo-sm hover:shadow-skeuo-md",
          "transition-all duration-200",
          "group relative overflow-hidden",
          isOpen && "shadow-skeuo-inset border-gray-400"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            "bg-gradient-to-b from-white to-gray-50",
            "border border-gray-200",
            "shadow-skeuo-xs"
          )}>
            <selectedOption.icon className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">
              {selectedOption.label}
            </div>
            <div className="text-xs text-gray-500">
              Ordenar resultados
            </div>
          </div>
        </div>
        
        <ChevronDownIcon 
          className={cn(
            "w-5 h-5 text-gray-400",
            "transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />

        {/* Gloss effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(255,255,255,0.8) 0%, 
              transparent 50%)`
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full mt-2",
          "bg-white rounded-xl",
          "border border-gray-200",
          "shadow-elevation-3",
          "overflow-hidden",
          "animate-in fade-in slide-in-from-top-1"
        )}>
          {sortOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = option.value === value;
            
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3",
                  "hover:bg-gray-50 transition-colors",
                  "relative group",
                  isSelected && "bg-blue-50",
                  index !== sortOptions.length - 1 && "border-b border-gray-100"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  "bg-gradient-to-b from-white to-gray-50",
                  "border border-gray-200",
                  "shadow-skeuo-xs",
                  "group-hover:shadow-skeuo-sm",
                  isSelected && "from-blue-50 to-blue-100 border-blue-200"
                )}>
                  <Icon className={cn(
                    "w-4 h-4",
                    isSelected ? "text-blue-600" : "text-gray-600"
                  )} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-blue-900" : "text-gray-900"
                  )}>
                    {option.label}
                  </div>
                  <div className={cn(
                    "text-xs",
                    isSelected ? "text-blue-600" : "text-gray-500"
                  )}>
                    {option.description}
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Componente compacto para mobile
export const SortOptionsMobile: React.FC<SortOptionsProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className={cn(
        "w-full px-4 py-3 pr-10",
        "bg-gradient-to-b from-gray-50 to-gray-100",
        "border border-gray-300 rounded-xl",
        "shadow-skeuo-sm",
        "text-sm font-medium text-gray-900",
        "appearance-none",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem'
      }}
    >
      {sortOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};