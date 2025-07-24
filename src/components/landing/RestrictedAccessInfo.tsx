'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function RestrictedAccessInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto text-center"
    >
      <h3 className="text-2xl font-bold text-white mb-4">
        Benefícios Exclusivos para Usuários Cadastrados
      </h3>
      <div className="space-y-3 text-left">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-300">
            <span className="font-semibold text-white">WhatsApp Direto:</span> Acesso ao nosso suporte via WhatsApp
          </p>
        </div>
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-300">
            <span className="font-semibold text-white">Abrir Tickets:</span> Sistema de suporte com acompanhamento
          </p>
        </div>
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-300">
            <span className="font-semibold text-white">Claudia IA:</span> Assistente inteligente 24/7
          </p>
        </div>
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-300">
            <span className="font-semibold text-white">E-mail Prioritário:</span> Respostas em até 1 hora útil
          </p>
        </div>
      </div>
      <button
        onClick={() => window.location.href = '/register'}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
      >
        Cadastre-se para Ter Acesso
      </button>
    </motion.div>
  )
}