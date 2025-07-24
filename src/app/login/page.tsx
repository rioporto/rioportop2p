import { LoginForm } from '@/components/forms/LoginForm';
import { Metadata } from 'next';
import { pageMetadata, siteConfig } from '@/lib/seo-config';
import { Alert } from '@/components/ui/Alert';

export const metadata: Metadata = {
  title: pageMetadata.login.title,
  description: pageMetadata.login.description,
  keywords: pageMetadata.login.keywords,
  openGraph: {
    title: pageMetadata.login.title,
    description: pageMetadata.login.description,
    url: `${siteConfig.url}/login`,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: pageMetadata.login.title,
    description: pageMetadata.login.description,
  },
  alternates: {
    canonical: `${siteConfig.url}/login`,
  },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { verified?: string; email?: string; error?: string };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            Rio Porto P2P
          </h1>
          <h2 className="mt-6 text-3xl font-semibold text-white">
            Acessar Plataforma
          </h2>
          <p className="mt-2 text-lg text-gray-400">
            Entre com sua conta para continuar
          </p>
        </div>

        {searchParams.verified === 'true' && (
          <Alert variant="success" className="mb-4">
            <p className="text-sm">
              Email verificado com sucesso! Agora você pode fazer login.
            </p>
          </Alert>
        )}

        {searchParams.error === 'verification_failed' && (
          <Alert variant="error" className="mb-4">
            <p className="text-sm">
              Erro ao verificar email. Por favor, tente novamente ou solicite um novo link.
            </p>
          </Alert>
        )}

        <div className="bg-gray-900 py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-gray-800">
          <LoginForm />
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-400">
            Novo por aqui?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              Criar conta grátis
            </a>
          </p>
          
          <p className="text-xs text-gray-500">
            Protegido por criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  );
}