import { withSentryConfig } from "@sentry/nextjs";
import { securityHeaders } from "./src/lib/seo-config.js";

const nextConfig = {
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
export default withSentryConfig(
  nextConfig,
  {
    // Para todos os arquivos de código fonte do Sentry
    silent: true,
    org: "rioporto",
    project: "rioporto-p2p",
  },
  {
    // Para tree-shaking do Sentry
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);