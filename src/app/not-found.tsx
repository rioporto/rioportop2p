import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página não encontrada - Rio Porto P2P',
  description: 'A página que você está procurando não foi encontrada. Volte para a página inicial da Rio Porto P2P.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-400">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">
            Oops! Página não encontrada
          </h2>
          <p className="text-xl text-gray-400 mt-4">
            Parece que você se perdeu no mundo das criptomoedas. 
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button
              variant="gradient"
              gradient="luxury"
              size="lg"
              className="min-w-[200px]"
              glow
            >
              Voltar ao início
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link href="/listings" className="text-blue-400 hover:text-blue-300 transition-colors">
              Ver ofertas
            </Link>
            <span className="hidden sm:inline text-gray-600">•</span>
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Criar conta
            </Link>
            <span className="hidden sm:inline text-gray-600">•</span>
            <Link href="/support" className="text-blue-400 hover:text-blue-300 transition-colors">
              Suporte
            </Link>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-gray-900/50 border border-gray-800">
          <h3 className="text-lg font-semibold mb-3">Páginas populares:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
              → Como funciona o P2P
            </Link>
            <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
              → Segurança e garantias
            </Link>
            <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
              → Perguntas frequentes
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
              → Sobre a Rio Porto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}