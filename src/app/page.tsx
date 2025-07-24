'use client'

import React from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { BenefitsSection } from '@/components/landing/BenefitsSection'
import { SecuritySection } from '@/components/landing/SecuritySection'
import { SocialProofSection } from '@/components/landing/SocialProofSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FloatingCTA } from '@/components/landing/FloatingCTA'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* Hero Section */}
        <HeroSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Security Section */}
        <SecuritySection />

        {/* Social Proof Section */}
        <SocialProofSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Platform Access CTA */}
        <section className="py-12 bg-black text-center">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-gray-400 mb-4">Já tem cadastro?</p>
            <a href="/login">
              <button className="px-6 py-3 border border-gray-600 text-gray-300 rounded-full hover:border-gray-400 hover:text-white transition-all duration-200">
                Acessar a Plataforma
              </button>
            </a>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-t from-gray-900 to-black relative">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/20"
            >

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Comece sua jornada P2P
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  com segurança total
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Junte-se aos brasileiros que já descobriram a forma mais 
                segura e transparente de comprar e vender Bitcoin.
              </p>

              <button
                onClick={() => window.location.href = '/register'}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105"
              >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-r from-green-600 to-emerald-600 blur-lg animate-pulse"></span>
                <span className="relative">QUERO COMEÇAR AGORA</span>
                <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cadastro em 5 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Burocracia mínima</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Curso P2P grátis</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-800 bg-gray-900 mb-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-gray-400 text-sm">
                © 2025 Rio Porto P2P. CNPJ: 00.000.000/0001-00
              </div>
              <div className="flex items-center gap-6 text-sm">
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Termos de Uso
                </a>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacidade
                </a>
                <a href="/support" className="text-gray-400 hover:text-white transition-colors">
                  Suporte
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Floating CTA and Progress Bar */}
      <FloatingCTA />
    </>
  )
}