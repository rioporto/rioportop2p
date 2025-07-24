'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RestrictedAccessInfo } from './RestrictedAccessInfo'

const faqs = [
  {
    question: "O que é P2P e como funciona?",
    answer: "P2P (Peer-to-Peer) é a forma de comprar e vender Bitcoin diretamente entre pessoas, sem intermediários. Na Rio Porto, você negocia com outros usuários verificados, mas com a segurança de nossa custódia que protege ambas as partes contra golpes.",
    category: "básico"
  },
  {
    question: "É seguro comprar Bitcoin via P2P?",
    answer: "Sim! Nossa plataforma utiliza um sistema de custódia (escrow) que mantém o Bitcoin travado até que o pagamento seja confirmado. Além disso, todos os usuários passam por verificação KYC e têm reputação transparente baseada em transações anteriores.",
    category: "segurança"
  },
  {
    question: "Quanto tempo leva uma transação P2P?",
    answer: "A maioria das transações é concluída em menos de 2 minutos! Assim que o vendedor confirma o recebimento do PIX, o Bitcoin é liberado automaticamente. Nosso sistema funciona 24/7, incluindo fins de semana e feriados.",
    category: "operacional"
  },
  {
    question: "Quais são as taxas da plataforma?",
    answer: "Oferecemos TAXA ZERO nos primeiros 30 dias! Após o período promocional, cobramos apenas 1% por transação - metade do que a maioria dos concorrentes cobra. Não há taxas ocultas ou custos de manutenção.",
    category: "custos"
  },
  {
    question: "Preciso enviar documentos para começar?",
    answer: "Não! Você pode começar a operar imediatamente com limites básicos. Para aumentar seus limites, oferecemos um sistema progressivo de verificação KYC - você envia documentos apenas quando quiser operar valores maiores.",
    category: "cadastro"
  },
  {
    question: "Como funciona o sistema de reputação?",
    answer: "Cada usuário tem uma pontuação baseada em: número de transações concluídas, avaliações recebidas, tempo de resposta e ausência de disputas. Você pode ver o histórico completo de qualquer usuário antes de negociar.",
    category: "segurança"
  },
  {
    question: "E se eu tiver um problema durante a transação?",
    answer: "Nosso suporte está disponível 24/7 para usuários cadastrados através de múltiplos canais: WhatsApp direto, sistema de tickets, assistente IA Claudia e e-mail prioritário. Em caso de disputa, nossa equipe especializada analisa o histórico da transação e resolve de forma justa, sempre protegendo a parte honesta.",
    category: "suporte"
  },
  {
    question: "Posso cancelar uma transação?",
    answer: "Sim, transações podem ser canceladas por acordo mútuo antes do pagamento ser confirmado. Após a confirmação do pagamento, o processo segue automaticamente para proteger ambas as partes.",
    category: "operacional"
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "Atualmente aceitamos PIX (mais rápido e popular), TED e transferências entre contas do mesmo banco. O PIX é recomendado por ser instantâneo e funcionar 24/7.",
    category: "pagamento"
  },
  {
    question: "Como faço para sacar meu Bitcoin?",
    answer: "Você pode criar um anúncio de venda e receber em reais via PIX em minutos, ou transferir seu Bitcoin para qualquer carteira externa quando quiser. Não há limites ou restrições para saques.",
    category: "operacional"
  }
]

const categories = [
  { id: "todos", label: "Todas", icon: "📋" },
  { id: "básico", label: "Básico", icon: "🎯" },
  { id: "segurança", label: "Segurança", icon: "🔒" },
  { id: "operacional", label: "Operações", icon: "⚡" },
  { id: "custos", label: "Custos", icon: "💰" },
  { id: "cadastro", label: "Cadastro", icon: "✍️" },
  { id: "suporte", label: "Suporte", icon: "💬" },
  { id: "pagamento", label: "Pagamento", icon: "💳" }
]

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("todos")
  const [openItems, setOpenItems] = useState<number[]>([])

  const filteredFaqs = activeCategory === "todos" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory)

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">frequentes</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tudo que você precisa saber sobre P2P antes de começar
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-300 overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl"
                >
                  <h3 className="text-lg font-medium text-white pr-8">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      openItems.includes(index) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Restricted Access Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12"
        >
          <RestrictedAccessInfo />
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Ainda tem dúvidas?</h3>
            <p className="text-gray-400 mb-6">
              Cadastre-se para acessar nosso suporte completo e começar sua jornada no P2P
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = '/register'}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Cadastrar e tirar dúvidas
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}