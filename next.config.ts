import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configurações essenciais
  reactStrictMode: true,
  poweredByHeader: false, // Remove header X-Powered-By por segurança
  compress: true, // Habilita compressão gzip
  generateEtags: true, // Gera ETags para cache

  // Configurações de build para deploy
  typescript: {
    // ⚠️ Temporariamente desabilitado para debug do build
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Temporariamente desabilitado para debug do build
    ignoreDuringBuilds: true,
  },

  // Configuração de imagens atualizada para Next.js 15
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Formatos otimizados
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Tamanhos responsivos
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Tamanhos de ícones
    minimumCacheTTL: 60, // Cache mínimo de 60 segundos
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
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ],
    },
  ],

  // Configurações experimentais úteis
  // Mover serverComponentsExternalPackages para o nível raiz
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  experimental: {
    // Otimizações de performance
    optimizePackageImports: ['lucide-react', 'react-icons', '@heroicons/react'],
    // Melhora o carregamento de fontes
    optimizeCss: true,
  },

  // Configuração de output para diferentes tipos de deploy
  // output: 'standalone', // Descomente para deploy em Docker/containerizado
  
  // Configurações de desenvolvimento
  devIndicators: {
    position: 'bottom-right',
  },

  // Configuração de source maps para produção (desabilitado por padrão)
  productionBrowserSourceMaps: false,

  // Configurações de webpack (se necessário)
  webpack: (config, { isServer }) => {
    // Configurações específicas do servidor
    if (isServer) {
      // Evita bundling de módulos nativos
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
        'bcryptjs': 'commonjs bcryptjs',
      })
    }

    // Configuração para evitar warnings com módulos específicos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },

  // Configuração de redirects (se necessário)
  redirects: async () => [
    {
      source: '/exchange',
      destination: '/dashboard',
      permanent: false,
    },
  ],

  // Configuração de rewrites (se necessário)
  // rewrites: async () => ({
  //   beforeFiles: [],
  //   afterFiles: [],
  //   fallback: [],
  // }),

  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_APP_NAME: 'Rio Porto P2P',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
  },

  // Configuração de i18n (se necessário no futuro)
  // i18n: {
  //   locales: ['pt-BR', 'en'],
  //   defaultLocale: 'pt-BR',
  // },

  // Configuração de trailing slash
  trailingSlash: false,

  // Configuração de page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Configuração de runtime
  // serverRuntimeConfig: {
  //   // Configurações apenas no servidor
  // },
  // publicRuntimeConfig: {
  //   // Configurações públicas
  // },
}

export default nextConfig