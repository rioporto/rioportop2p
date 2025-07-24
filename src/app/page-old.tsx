'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HomePageStructuredData } from './page-metadata';

export default function Home() {
  const [activeUsers, setActiveUsers] = useState(1247);
  
  // Simular usuários ativos aumentando
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <HomePageStructuredData />
      <main className="min-h-screen bg-black text-white">
      {/* Hero Section - Impacto Imediato */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background animado */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 container-premium text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge de urgência */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-red-500/10 border border-red-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-sm font-medium text-red-400">
                {activeUsers} pessoas online agora
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Ganhe <span className="text-gradient bg-gradient-to-r from-green-400 to-emerald-400">R$ 500</span>
              <br />
              na sua primeira transação
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Apenas hoje. Cadastre-se e receba bônus instantâneo para começar a comprar Bitcoin.
            </p>

            <Link href="/register">
              <Button
                variant="gradient"
                gradient="luxury"
                size="xl"
                className="text-xl px-12 py-6 animate-pulse"
                glow
              >
                QUERO MEU BÔNUS
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              Sem pegadinhas • Saque imediato • 2 minutos para começar
            </p>
          </motion.div>
        </div>
      </section>

      {/* Seção 2: Segurança - Principal Argumento */}
      <section className="py-32 relative">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Seu dinheiro 100% protegido
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Sistema de custódia que <span className="text-white font-semibold">impede golpes</span>. 
                Fundos liberados apenas após confirmação de ambas as partes.
              </p>
            </div>

            <Link href="/register">
              <Button
                variant="neon"
                size="lg"
                className="min-w-[300px]"
                glow
                glowColor="primary"
              >
                Criar conta segura agora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Seção 3: Velocidade */}
      <section className="py-32 bg-gradient-to-b from-gray-900/50 to-black relative">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                PIX em <span className="text-green-400">30 segundos</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Compre Bitcoin instantaneamente. Sem burocracia, sem espera.
                <br />
                <span className="text-white font-semibold">24 horas por dia, 7 dias por semana.</span>
              </p>
            </div>

            <Link href="/register">
              <Button
                variant="gradient"
                gradient="success"
                size="lg"
                className="min-w-[300px]"
                glow
              >
                Começar a comprar agora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Seção 4: Taxas */}
      <section className="py-32 relative">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="relative">
                <div className="text-8xl font-bold text-gradient bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
                  0%
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Taxa ZERO no primeiro mês
                </h2>
              </div>
              <p className="text-xl text-gray-400 mb-8">
                Depois, apenas 1% por transação. 
                <span className="text-white font-semibold"> Metade do preço</span> dos concorrentes.
              </p>
            </div>

            <Link href="/register">
              <Button
                variant="gradient"
                gradient="warning"
                size="lg"
                className="min-w-[300px]"
                glow
              >
                Aproveitar taxa zero
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Seção 5: Social Proof */}
      <section className="py-32 bg-gradient-to-b from-gray-900/50 to-black relative">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-12">
              Por que <span className="text-gradient bg-gradient-to-r from-blue-400 to-purple-400">15.000+ brasileiros</span>
              <br />
              escolheram a Rio Porto?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card variant="glass" className="p-6" theme="dark">
                <div className="text-3xl font-bold text-green-400 mb-2">R$ 50M+</div>
                <p className="text-gray-400">negociados por mês</p>
              </Card>
              
              <Card variant="glass" className="p-6" theme="dark">
                <div className="text-3xl font-bold text-blue-400 mb-2">4.9/5.0</div>
                <p className="text-gray-400">avaliação média</p>
              </Card>
              
              <Card variant="glass" className="p-6" theme="dark">
                <div className="text-3xl font-bold text-purple-400 mb-2">2 min</div>
                <p className="text-gray-400">tempo médio de transação</p>
              </Card>
            </div>

            <Link href="/register">
              <Button
                variant="neon"
                size="lg"
                className="min-w-[300px]"
                glow
                glowColor="secondary"
              >
                Fazer parte da comunidade
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Seção Final: Urgência */}
      <section className="py-32 relative">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Card
              variant="glass"
              className="p-12 border-2 border-red-500/50"
              theme="dark"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-red-500/10 border border-red-500/20">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-red-400">
                  Oferta limitada
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Últimas <span className="text-red-400">24 horas</span> com bônus de R$ 500
              </h2>
              
              <p className="text-xl text-gray-400 mb-8">
                Após isso, o bônus cai para R$ 100. 
                <br />
                <span className="text-white font-semibold">Não perca essa oportunidade única.</span>
              </p>

              <Link href="/register">
                <Button
                  variant="gradient"
                  gradient="luxury"
                  size="xl"
                  className="text-xl px-12 py-6 animate-pulse"
                  glow
                >
                  GARANTIR MEU BÔNUS DE R$ 500
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cadastro em 2 minutos</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Sem documentos agora</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="py-8 border-t border-gray-900">
        <div className="container-premium text-center text-sm text-gray-500">
          <p>© 2025 Rio Porto P2P. CNPJ: 00.000.000/0001-00</p>
          <p className="mt-2">
            <Link href="/terms" className="hover:text-white">Termos</Link>
            {' • '}
            <Link href="/privacy" className="hover:text-white">Privacidade</Link>
            {' • '}
            <Link href="/support" className="hover:text-white">Suporte</Link>
          </p>
        </div>
      </footer>
    </main>
    </>
  );
}