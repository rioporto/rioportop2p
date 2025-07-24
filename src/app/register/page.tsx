import { RegisterForm } from '@/components/forms/RegisterForm';
import { Metadata } from 'next';
import { pageMetadata, siteConfig } from '@/lib/seo-config';

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

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            Rio Porto P2P
          </h1>
          <h2 className="mt-6 text-3xl font-semibold text-white">
            Crie sua conta
          </h2>
          <p className="mt-2 text-lg text-gray-400">
            Comece sua jornada P2P com segurança
          </p>
        </div>

        <div className="bg-gray-900 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-800">
          <RegisterForm />
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Seguro</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Rápido</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Confiável</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos{' '}
            <a href="/terms" className="text-blue-400 hover:text-blue-300">
              termos e condições
            </a>
          </p>

          <p className="text-sm text-gray-400">
            Já tem uma conta?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}