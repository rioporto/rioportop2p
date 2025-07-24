import { MobileOptimizedRegisterForm } from '@/components/forms/MobileOptimizedRegisterForm';
import '@/styles/mobile-optimizations.css';

export default function RegisterMobileTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Mobile */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">RioPorto P2P</h1>
          <a 
            href="/login" 
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            Entrar
          </a>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="py-6">
        <div className="text-center mb-6 px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Crie sua conta
          </h2>
          <p className="text-gray-600">
            Negocie criptomoedas com segurança
          </p>
        </div>

        {/* Formulário Otimizado */}
        <MobileOptimizedRegisterForm />

        {/* Informações adicionais */}
        <div className="mt-8 px-4 pb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <h3 className="font-semibold text-blue-900 mb-2">
              Por que escolher a RioPorto?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Transações seguras com escrow</li>
              <li>✓ Suporte 24/7 via WhatsApp</li>
              <li>✓ Melhores taxas do mercado</li>
              <li>✓ PIX instantâneo</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Indicador de otimizações ativas (apenas para teste) */}
      <div className="fixed bottom-20 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs shadow-lg">
        Mobile Optimized ✓
      </div>
    </div>
  );
}