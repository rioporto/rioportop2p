"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface ListingSkeletonProps {
  count?: number;
  className?: string;
}

export const ListingSkeleton: React.FC<ListingSkeletonProps> = ({
  count = 6,
  className
}) => {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {[...Array(count)].map((_, index) => (
        <Card 
          key={index} 
          className="overflow-hidden animate-pulse"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'both'
          }}
        >
          <CardContent className="p-6 space-y-4">
            {/* Header com badge e cripto */}
            <div className="flex justify-between items-start">
              <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
                <div className="h-6 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              </div>
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              <div className="h-8 w-36 bg-gradient-to-r from-gray-300 to-gray-400 rounded" />
            </div>

            {/* Limites */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                <div className="h-5 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                <div className="h-5 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
              </div>
            </div>

            {/* Métodos de pagamento */}
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
              <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
              <div className="h-6 w-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Footer com vendedor e ação */}
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-3 w-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-10 w-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg" />
            </div>
          </CardContent>

          {/* Efeito de shimmer */}
          <div 
            className="absolute inset-0 -translate-x-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
            }}
          />
        </Card>
      ))}
    </div>
  );
};

// Skeleton para filtros
export const FilterSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Tipo de operação */}
      <div className="space-y-2">
        <div className="h-4 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
      </div>

      {/* Criptomoedas */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
          ))}
        </div>
      </div>

      {/* Faixa de preço */}
      <div className="space-y-2">
        <div className="h-4 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
      </div>

      {/* Métodos de pagamento */}
      <div className="space-y-2">
        <div className="h-4 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Apenas verificados */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
        <div className="h-8 w-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
      </div>
    </div>
  );
};