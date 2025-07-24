'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
    answer: "Nosso suporte está disponível 24/7 via WhatsApp para ajudar imediatamente. Em caso de disputa, nossa equipe especializada analisa o histórico da transação e resolve de forma justa, sempre protegendo a parte honesta.",
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
              Nossa equipe está pronta para ajudar você a começar sua jornada no P2P
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/register'}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Começar agora
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}