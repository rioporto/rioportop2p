import { RegisterFormUX } from '@/components/forms/RegisterFormUX';
import { TrustBadgesDark } from '@/components/forms/TrustBadgesDark';
import { SecurityInfoDark } from '@/components/forms/SecurityInfoDark';
import { ScrollDebug } from '@/components/debug/ScrollDebug';
import { Metadata } from 'next';
import { pageMetadata, siteConfig, organizationSchema, generateJsonLd } from '@/lib/seo-config';
import Script from 'next/script';
import '@/styles/register-scroll-fix.css';

export const metadata: Metadata = {
  title: pageMetadata.register.title,
  description: pageMetadata.register.description,
  keywords: pageMetadata.register.keywords,
  openGraph: {
    title: pageMetadata.register.title,
    description: pageMetadata.register.description,
    url: `${siteConfig.url}/register`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.register.title,
    description: pageMetadata.register.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/register`,
  },
};

// Schema para página de registro
const registerPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: pageMetadata.register.title,
  description: pageMetadata.register.description,
  url: `${siteConfig.url}/register`,
  mainEntity: {
    '@type': 'Service',
    name: 'Cadastro Rio Porto P2P',
    description: 'Serviço de cadastro para plataforma P2P de Bitcoin',
    provider: organizationSchema,
    serviceType: 'Registro de usuário',
    areaServed: {
      '@type': 'Country',
      name: 'Brasil'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Bônus de Cadastro',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Bônus de R$ 500',
          description: 'Ganhe R$ 500 de bônus na primeira transação',
          price: '0',
          priceCurrency: 'BRL'
        }
      ]
    }
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cadastro',
        item: `${siteConfig.url}/register`
      }
    ]
  }
};

export default function RegisterPage() {
  return (
    <>
      <Script
        id="register-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJsonLd(registerPageSchema),
        }}
      />
      {process.env.NODE_ENV === 'development' && <ScrollDebug />}
      <main 
        className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-4 sm:px-6 lg:px-8 py-12 register-page"
        role="main"
        aria-labelledby="register-heading"
      >
        <div className="max-w-6xl w-full mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Rio Porto P2P
            </h1>
            <h2 id="register-heading" className="mt-6 text-3xl font-semibold text-white">
              Crie sua conta
            </h2>
            <p className="mt-2 text-lg text-gray-400">
              Comece sua jornada P2P com segurança
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna principal com formulário */}
            <section 
              className="lg:col-span-2"
              aria-label="Formulário de cadastro"
            >
              <div className="bg-gray-900 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-800">
                <RegisterFormUX />
              </div>
            </section>

            {/* Coluna lateral com badges de segurança */}
            <aside 
              className="space-y-6"
              aria-label="Informações de segurança e benefícios"
            >
              {/* Trust Badges para tema escuro */}
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <TrustBadgesDark />
              </div>

              {/* Security Info para tema escuro */}
              <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <SecurityInfoDark />
              </div>
            </aside>
          </div>

          <footer className="text-center space-y-4 mt-8" aria-label="Links e informações adicionais">
            <ul className="flex items-center justify-center space-x-6 text-sm" role="list">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">Seguro</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">Rápido</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">Confiável</span>
              </li>
            </ul>
            
            <p className="text-xs text-gray-500">
              Ao criar uma conta, você concorda com nossos{' '}
              <a 
                href="/terms" 
                className="text-blue-400 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                aria-label="Ler termos e condições"
              >
                termos e condições
              </a>
            </p>

            <nav aria-label="Links relacionados">
              <p className="text-sm text-gray-400">
                Já tem uma conta?{' '}
                <a 
                  href="/login" 
                  className="text-blue-400 hover:text-blue-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                >
                  Fazer login
                </a>
              </p>
            </nav>
          </footer>
        </div>
      </main>
    </>
  );
}