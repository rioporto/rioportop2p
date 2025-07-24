'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  const handleCTAClick = () => {
    router.push('/register')
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section Simplificada */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            APRENDA COMPRAR OU VENDER BITCOIN VIA P2P
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Domine tudo sobre P2P + treinamento grátis. A forma mais segura e econômica de negociar Bitcoin.
          </p>

          <button
            onClick={handleCTAClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-8 py-4 rounded-full text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            EU QUERO
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Sem pegadinhas • Comece Agora • 2 minutos para começar
          </p>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Três passos simples para começar sua jornada no P2P com segurança
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="relative bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4 mt-2">Aprenda em 30 minutos</h3>
              <p className="text-gray-600">
                Acesse nosso treinamento gratuito e domine os conceitos essenciais do P2P. 
                Material didático criado especialmente para iniciantes.
              </p>
            </div>
            
            <div className="relative bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4 mt-2">Configure com nosso suporte</h3>
              <p className="text-gray-600">
                Nossa equipe te ajuda a configurar sua carteira e fazer as primeiras operações. 
                Suporte personalizado via WhatsApp.
              </p>
            </div>
            
            <div className="relative bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4 mt-2">Opere com confiança</h3>
              <p className="text-gray-600">
                Compre e venda Bitcoin com segurança. Você no controle total dos seus fundos, 
                com nossa comunidade sempre disponível.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Por que a Rio Porto P2P é diferente?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combinamos a segurança de uma instituição financeira com a liberdade do P2P
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Atendimento VIP Personalizado</h3>
              <p className="text-gray-600">
                Como ter um gerente de banco só seu, disponível 24/7. Suporte humanizado que entende suas necessidades.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Educação P2P 100% Gratuita</h3>
              <p className="text-gray-600">
                Curso completo do básico ao avançado. Domine P2P em 30 dias com nosso método exclusivo.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Seus Fundos, Seu Controle</h3>
              <p className="text-gray-600">
                Nunca custodiamos seu dinheiro. Você mantém total controle com segurança de instituição financeira.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Suporte Por Todos os Canais</h3>
              <p className="text-gray-600">
                Chat com IA, comunidade ativa, consultoria 1:1. Escolha como prefere ser atendido.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Negociação Direta e Segura</h3>
              <p className="text-gray-600">
                P2P, B2P ou OTC para grandes volumes. Flexibilidade total com proteção garantida.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">100% Regulamentado</h3>
              <p className="text-gray-600">
                Conformidade total com legislação brasileira. Opere com tranquilidade e segurança jurídica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar sua jornada P2P?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Junte-se aos brasileiros que já descobriram a liberdade financeira através do P2P. 
            Cadastro gratuito, sem pegadinhas.
          </p>
          <button
            onClick={handleCTAClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-4 rounded-full text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            QUERO COMEÇAR AGORA
          </button>
          <p className="mt-4 text-sm text-gray-500">
            🔒 Cadastro seguro • 📚 Curso grátis incluso • ⚡ Comece em 2 minutos
          </p>
        </div>
      </section>
    </main>
  )
}