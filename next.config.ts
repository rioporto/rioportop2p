import { withSentryConfig } from '@sentry/nextjs';
import './src/env.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Configuração do middleware
  middleware: {
    // Habilitar Edge Runtime para melhor performance
    runtime: 'edge',
    // Matcher configurado no middleware.ts
  },
  // Configurações de segurança
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],
};

// Configuração do Sentry
const sentryWebpackPluginOptions = {
  org: "rioporto",
  project: "rioporto-p2p",
  silent: true,
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
