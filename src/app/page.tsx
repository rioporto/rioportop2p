import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Stats } from '@/components/landing/Stats';
import { CryptoList } from '@/components/landing/CryptoList';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Stats Section */}
      <Stats />

      {/* Crypto List Section */}
      <CryptoList />

      {/* CTA Final Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-primary-900/20 to-gray-900 relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-secondary-500/10" />
          <div className="absolute inset-0 texture-carbon opacity-5" />
        </div>

        <div className="container-premium relative z-10">
          <Card
            variant="glass"
            className="max-w-4xl mx-auto text-center p-12 backdrop-blur-xl"
            theme="dark"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Pronto para começar sua jornada
              <br />
              <span className="text-gradient bg-gradient-luxury">no mundo cripto?</span>
            </h2>
            
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de brasileiros que já negociam criptomoedas 
              com segurança e praticidade na Rio Porto P2P
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register">
                <Button
                  variant="gradient"
                  gradient="luxury"
                  size="lg"
                  className="min-w-[200px] shadow-xl hover:shadow-2xl"
                  glow
                  glowColor="warning"
                >
                  Criar Conta Grátis
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              
              <Link href="/login">
                <Button
                  variant="neon"
                  size="lg"
                  className="min-w-[200px]"
                  glow
                  glowColor="primary"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Seguro</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>Cadastro Rápido</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>5.0 Avaliação</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo e descrição */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Rio Porto P2P</h3>
              <p className="mb-4">
                A plataforma de negociação P2P mais segura e confiável do Brasil. 
                Compre e venda criptomoedas diretamente com outros usuários.
              </p>
              <div className="flex gap-4">
                <Link href="/showcase" className="hover:text-white transition-colors">
                  Design System
                </Link>
                <span className="text-gray-600">|</span>
                <Link href="/about" className="hover:text-white transition-colors">
                  Sobre Nós
                </Link>
              </div>
            </div>

            {/* Links rápidos */}
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Segurança</Link></li>
                <li><Link href="/fees" className="hover:text-white transition-colors">Taxas</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Suporte</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link href="/aml" className="hover:text-white transition-colors">AML/KYC</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            <p>© 2025 Rio Porto P2P. Todos os direitos reservados.</p>
            <p className="mt-2">
              Desenvolvido com Next.js 14 + Neon PostgreSQL
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}