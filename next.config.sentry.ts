import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { securityHeaders } from "./src/lib/seo-config";

/**
 * Configuração do Next.js com Sentry integrado
 * 
 * IMPORTANTE: Para ativar esta configuração:
 * 1. Crie conta no Sentry: https://sentry.io
 * 2. Adicione NEXT_PUBLIC_SENTRY_DSN no .env
 * 3. Renomeie este arquivo para next.config.ts
 * 4. Delete o next.config.ts atual
 */

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['rioporto.com.br'],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
};

// Configuração do Sentry
const sentryWebpackPluginOptions = {
  // Silencia o Sentry durante builds locais
  silent: true,

  // Organização e projeto do Sentry
  org: "rioporto",
  project: "rioporto-p2p",

  // Upload de source maps para melhor debugging
  widenClientFileUpload: true,

  // Oculta source maps dos usuários
  hideSourceMaps: true,

  // Desabilita logs do Sentry em desenvolvimento
  disableLogger: true,

  // Automaticamente injeta Sentry nas páginas
  automaticVercelMonitors: true,
};

// Exporta configuração com Sentry wrapper
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);