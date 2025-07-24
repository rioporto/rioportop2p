import { Metadata } from 'next';

export const siteConfig = {
  name: 'Rio Porto P2P',
  shortName: 'Rio Porto',
  description: 'Plataforma P2P segura para comprar e vender Bitcoin no Brasil. Sistema de custódia que protege suas transações, KYC em níveis e pagamento via PIX.',
  url: 'https://rioporto.com.br',
  ogImage: 'https://rioporto.com.br/og-image.png',
  language: 'pt-BR',
  locale: 'pt_BR',
  keywords: [
    'comprar bitcoin p2p',
    'vender bitcoin p2p',
    'p2p bitcoin brasil',
    'bitcoin peer to peer',
    'comprar bitcoin pix',
    'vender bitcoin pix',
    'bitcoin sem taxa',
    'bitcoin seguro brasil',
    'plataforma p2p criptomoedas',
    'exchange p2p brasil',
    'bitcoin para iniciantes',
    'como comprar bitcoin',
    'bitcoin custódia segura',
    'kyc bitcoin brasil',
    'rio porto p2p'
  ],
  author: {
    name: 'Rio Porto Team',
    twitter: '@rioportop2p',
  },
  social: {
    twitter: '@rioportop2p',
    facebook: 'rioportop2p',
    instagram: 'rioportop2p',
    linkedin: 'rio-porto-p2p',
  }
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: siteConfig.author.twitter,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
};

// Page-specific metadata
export const pageMetadata = {
  home: {
    title: 'Comprar e Vender Bitcoin P2P no Brasil | Rio Porto P2P',
    description: 'A plataforma P2P mais segura do Brasil para comprar e vender Bitcoin. PIX em 30 segundos, taxa zero no primeiro mês, sistema de custódia que impede golpes.',
    keywords: [
      ...siteConfig.keywords,
      'bitcoin brasil 2025',
      'melhor plataforma p2p',
      'bitcoin iniciantes brasil'
    ],
  },
  login: {
    title: 'Login',
    description: 'Faça login em sua conta Rio Porto P2P para comprar e vender Bitcoin com segurança.',
    keywords: ['login bitcoin', 'entrar rio porto', 'acessar conta p2p'],
  },
  register: {
    title: 'Criar Conta - Ganhe R$ 500 de Bônus',
    description: 'Crie sua conta na Rio Porto P2P e ganhe R$ 500 de bônus na primeira transação. Cadastro em 2 minutos, sem burocracia.',
    keywords: ['criar conta bitcoin', 'cadastro p2p', 'bonus bitcoin brasil', 'registro rio porto'],
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Gerencie suas transações P2P de Bitcoin com segurança e facilidade.',
    keywords: ['dashboard bitcoin', 'painel p2p', 'gerenciar bitcoin'],
  },
  listings: {
    title: 'Ofertas de Bitcoin P2P',
    description: 'Encontre as melhores ofertas para comprar e vender Bitcoin via PIX. Transações seguras com sistema de custódia.',
    keywords: ['ofertas bitcoin', 'anuncios p2p', 'comprar bitcoin pix', 'vender bitcoin pix'],
  },
  kyc: {
    title: 'Verificação KYC',
    description: 'Complete sua verificação KYC para aumentar seus limites de transação na Rio Porto P2P.',
    keywords: ['kyc bitcoin', 'verificacao p2p', 'documentos bitcoin brasil'],
  },
};

// Structured Data Schemas
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'BR',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
  },
  sameAs: [
    `https://twitter.com/${siteConfig.social.twitter}`,
    `https://facebook.com/${siteConfig.social.facebook}`,
    `https://instagram.com/${siteConfig.social.instagram}`,
    `https://linkedin.com/company/${siteConfig.social.linkedin}`,
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Como comprar Bitcoin na Rio Porto P2P?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'É muito simples: 1) Crie sua conta gratuita, 2) Escolha uma oferta de venda, 3) Faça o PIX, 4) Receba seu Bitcoin. O processo leva menos de 2 minutos.',
      },
    },
    {
      '@type': 'Question',
      name: 'É seguro comprar Bitcoin P2P?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim! A Rio Porto P2P utiliza um sistema de custódia que protege compradores e vendedores. Os Bitcoins ficam travados até que ambas as partes confirmem a transação.',
      },
    },
    {
      '@type': 'Question',
      name: 'Qual a taxa para comprar Bitcoin?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Taxa ZERO no primeiro mês! Depois, apenas 1% por transação - metade do preço dos concorrentes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Preciso enviar documentos para começar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Não! Você pode começar a comprar e vender imediatamente. A verificação KYC é opcional e serve apenas para aumentar seus limites.',
      },
    },
    {
      '@type': 'Question',
      name: 'Como funciona o bônus de R$ 500?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ao criar sua conta e fazer sua primeira transação, você recebe R$ 500 de bônus que pode ser usado para comprar Bitcoin. Promoção por tempo limitado.',
      },
    },
  ],
};

export const aggregateRatingSchema = {
  '@context': 'https://schema.org',
  '@type': 'AggregateRating',
  ratingValue: '4.9',
  bestRating: '5',
  worstRating: '1',
  ratingCount: '15247',
  reviewCount: '12893',
};

export const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Rio Porto P2P - Plataforma Bitcoin',
  description: siteConfig.description,
  brand: {
    '@type': 'Brand',
    name: siteConfig.name,
  },
  aggregateRating: aggregateRatingSchema,
  offers: {
    '@type': 'Offer',
    priceCurrency: 'BRL',
    price: '0',
    priceValidUntil: '2025-12-31',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
  },
};

// Helper function to generate JSON-LD script
export function generateJsonLd(data: any): string {
  return JSON.stringify(data);
}

// Performance optimization hints
export const resourceHints = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
  { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
];

// Security headers configuration
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
];