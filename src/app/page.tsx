'use client'

import React from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { BenefitsSection } from '@/components/landing/BenefitsSection'
import { SocialProofSection } from '@/components/landing/SocialProofSection'
import { FloatingCTA } from '@/components/landing/FloatingCTA'
import { ExitIntentPopup } from '@/components/landing/ExitIntentPopup'
import { ConversionAnalytics } from '@/components/analytics/ConversionAnalytics'
import { useRouter } from 'next/navigation'
import { HomePageStructuredData } from './page-metadata'

export default function Home() {
  const router = useRouter()
  
  const handleCTAClick = () => {
    router.push('/register')
  }

  return (
    <>
      <HomePageStructuredData />
      <main className="min-h-screen bg-white text-gray-900">
        <ConversionAnalytics />
        
        <HeroSection
          onCtaClick={handleCTAClick}
          backgroundVariant="animated"
        />
        
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
        
        <BenefitsSection />
        
        {/* Segurança e Conformidade Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Segurança e Conformidade
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Opere com tranquilidade em uma plataforma 100% regulamentada
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Conformidade com legislação brasileira</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Relatórios automáticos para Imposto de Renda</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Sistema anti-fraude com IA</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Verificação KYC em níveis</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Custódia 100% do usuário</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Transparência total nas operações</span>
              </div>
            </div>
          </div>
        </section>
        
        <SocialProofSection />
        
        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tire suas dúvidas sobre P2P e nossa plataforma
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
                <summary className="font-semibold text-lg flex justify-between items-center list-none">
                  Preciso ter experiência para começar?
                  <span className="text-2xl text-blue-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600">
                  Não! Nossa plataforma foi criada pensando em iniciantes. 
                  Com nosso treinamento gratuito e suporte personalizado, 
                  você aprende tudo do zero em menos de 30 minutos.
                </p>
              </details>
              
              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
                <summary className="font-semibold text-lg flex justify-between items-center list-none">
                  Qual o valor mínimo para começar?
                  <span className="text-2xl text-blue-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600">
                  Você pode começar com apenas R$ 50. Não existe valor máximo - 
                  atendemos desde pequenos investidores até operações OTC de alto valor, 
                  como clientes que vendem imóveis para comprar Bitcoin.
                </p>
              </details>
              
              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
                <summary className="font-semibold text-lg flex justify-between items-center list-none">
                  É realmente seguro?
                  <span className="text-2xl text-blue-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600">
                  Sim! Utilizamos um sistema de reputação transparente, verificação de identidade 
                  em níveis e, o mais importante: seus fundos ficam sempre sob seu controle, 
                  nunca em nossa custódia. Além disso, temos suporte 24/7 para qualquer necessidade.
                </p>
              </details>
              
              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
                <summary className="font-semibold text-lg flex justify-between items-center list-none">
                  Como funciona o suporte?
                  <span className="text-2xl text-blue-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600">
                  Oferecemos múltiplos canais: chat com IA para dúvidas rápidas, 
                  comunidade ativa no WhatsApp/Telegram para trocar experiências, 
                  e consultoria personalizada para operações complexas ou aprendizado avançado.
                </p>
              </details>
              
              <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer group">
                <summary className="font-semibold text-lg flex justify-between items-center list-none">
                  Quais as vantagens sobre exchanges tradicionais?
                  <span className="text-2xl text-blue-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-gray-600">
                  No P2P você tem: menores taxas (economia de até 70%), privacidade aumentada, 
                  múltiplas formas de pagamento (PIX, TED, dinheiro), sem limites artificiais 
                  de saque, e principalmente - você possui suas chaves privadas.
                </p>
              </details>
            </div>
          </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-white text-center">
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
        
        <FloatingCTA />
        <ExitIntentPopup />
      </main>
    </>
  )
}