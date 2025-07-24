"use client";

import React from "react";
import { ITestimonial } from "@/types/social-proof";

interface SchemaMarkupProps {
  testimonials?: ITestimonial[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({
  testimonials = [],
  aggregateRating
}) => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rio Porto P2P",
    "description": "Plataforma segura de negociação P2P de criptomoedas no Brasil",
    "url": "https://rioportop2p.com",
    "logo": "https://rioportop2p.com/logo.png",
    "sameAs": [
      "https://www.google.com/maps/place/RIO+PORTO+P2P/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["Portuguese"],
      "areaServed": "BR"
    }
  };

  const reviewsSchema = testimonials.map((testimonial) => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": testimonial.author
    },
    "datePublished": testimonial.date,
    "reviewBody": testimonial.content,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": testimonial.rating,
      "bestRating": "5",
      "worstRating": "1"
    }
  }));

  const aggregateRatingSchema = aggregateRating ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Rio Porto P2P",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue.toString(),
      "reviewCount": aggregateRating.reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviewsSchema
  } : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "O Rio Porto P2P é seguro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, o Rio Porto P2P é 100% seguro. Todas as transações são protegidas por escrow, todos os usuários passam por verificação KYC, e oferecemos suporte dedicado durante todo o processo."
        }
      },
      {
        "@type": "Question",
        "name": "Quanto tempo leva uma transação no Rio Porto P2P?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Em média, as transações são concluídas em menos de 5 minutos. Nossa equipe de suporte está disponível para garantir que tudo ocorra rapidamente e com segurança."
        }
      },
      {
        "@type": "Question",
        "name": "Qual o valor mínimo para transação?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Não temos valor mínimo fixo. Atendemos desde pequenas transações até grandes volumes, sempre com o mesmo nível de segurança e atenção personalizada."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {aggregateRatingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};