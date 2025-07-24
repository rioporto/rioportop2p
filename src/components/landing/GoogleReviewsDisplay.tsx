"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { IGoogleReview } from "@/types/social-proof";
import { Card } from "@/components/ui/Card";

interface GoogleReviewsDisplayProps {
  reviews: IGoogleReview[];
  className?: string;
}

export const GoogleReviewsDisplay: React.FC<GoogleReviewsDisplayProps> = ({
  reviews,
  className
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-600"
        )}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Google Maps Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-500" viewBox="0 0 48 48" fill="currentColor">
            <path d="M24 4C16.28 4 10 10.28 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.72-6.28-14-14-14zm0 19c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-white">Avaliações do Google</h3>
            <p className="text-sm text-gray-400">Verificadas pelo Google Maps</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">5.0</span>
          <div className="flex">{renderStars(5)}</div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card
            key={review.id}
            variant="flat"
            className="p-4 bg-gray-800/30 border-gray-700/50"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {review.photoUrl ? (
                  <img
                    src={review.photoUrl}
                    alt={review.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{review.author}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-xs text-gray-500">{review.time}</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 48 48" fill="currentColor">
                    <path d="M44 24c0 11.05-8.95 20-20 20S4 35.05 4 24 12.95 4 24 4s20 8.95 20 20zM12 28.5v-9l6 4.5 6-4.5v9h3v-15h-3l-6 4.5-6-4.5h-3v15h3z"/>
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">{review.text}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View More Link */}
      <div className="text-center mt-6">
        <a
          href="https://www.google.com/maps/place/RIO+PORTO+P2P/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
        >
          <span>Ver todas as avaliações</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};

// Sample Google Reviews data (in production, this would be fetched from Google Places API)
export const sampleGoogleReviews: IGoogleReview[] = [
  {
    id: "gr1",
    author: "Ana Silva",
    rating: 5,
    text: "Excelente plataforma P2P! Fiz minha primeira compra de Bitcoin e o processo foi super seguro. O suporte respondeu todas minhas dúvidas rapidamente.",
    time: "há 1 semana"
  },
  {
    id: "gr2",
    author: "Pedro Santos",
    rating: 5,
    text: "Melhor experiência que tive com P2P. A verificação KYC foi rápida e a transação concluída em minutos. Recomendo!",
    time: "há 2 semanas"
  },
  {
    id: "gr3",
    author: "Mariana Costa",
    rating: 5,
    text: "Atendimento diferenciado! Me ajudaram em todo o processo, desde a criação da conta até a conclusão da minha primeira venda de USDT.",
    time: "há 3 semanas"
  }
];