'use client'

import React from 'react'

export default function RegisterTestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Página de Teste - Register</h1>
        <p className="text-xl mb-8">Se você está vendo isso, o roteamento está funcionando!</p>
        <a href="/" className="text-blue-400 hover:text-blue-300 underline">
          Voltar para a Home
        </a>
      </div>
    </div>
  )
}