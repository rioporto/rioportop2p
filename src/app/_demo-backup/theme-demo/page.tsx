"use client";

import React, { useState } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme, useIsDark, useThemeColors, usePrefersReducedMotion } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

export default function ThemeDemoPage() {
  const { theme, setTheme, autoThemeEnabled, setAutoThemeEnabled, customTheme, setCustomTheme } = useTheme();
  const isDark = useIsDark();
  const themeColors = useThemeColors();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const customThemes = ['blue', 'purple', 'green', 'contrast'] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Sistema de Temas Rio Porto P2P
          </h1>
          <p className="text-lg text-text-secondary">
            Dark Mode profissional com transições suaves e detecção automática
          </p>
        </motion.div>

        {/* Main Theme Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-surface-primary rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-2xl font-semibold text-text-primary">Toggle Principal</h2>
              <ThemeToggle size="lg" showLabel />
              <p className="text-sm text-text-tertiary text-center max-w-md">
                Clique no botão acima para alternar entre modo claro e escuro. 
                O tema é salvo automaticamente e sincronizado entre abas.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Theme Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Current Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-primary rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Tema Atual</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-text-secondary">Claro</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-text-secondary">Escuro</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={theme === 'system'}
                  onChange={() => setTheme('system')}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-text-secondary">Sistema</span>
              </label>
            </div>
          </motion.div>

          {/* Auto Theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-primary rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Tema Automático</h3>
            <p className="text-sm text-text-secondary mb-4">
              Muda automaticamente baseado no horário (18h-6h escuro)
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoThemeEnabled}
                onChange={(e) => setAutoThemeEnabled(e.target.checked)}
                className="w-5 h-5 text-primary rounded"
              />
              <span className="text-text-secondary">Ativar tema automático</span>
            </label>
          </motion.div>

          {/* Custom Themes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface-primary rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Temas Customizados</h3>
            <div className="space-y-2">
              <button
                onClick={() => setCustomTheme(undefined)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !customTheme ? 'bg-primary text-white' : 'hover:bg-surface-hover'
                }`}
              >
                Padrão
              </button>
              {customThemes.map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setCustomTheme(themeName)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors capitalize ${
                    customTheme === themeName ? 'bg-primary text-white' : 'hover:bg-surface-hover'
                  }`}
                >
                  {themeName}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Color Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface-primary rounded-xl p-6 shadow-lg mb-12"
        >
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Cores do Tema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Primary Colors */}
            <div>
              <div className="h-20 bg-gradient-primary rounded-lg mb-2 shadow-md" />
              <p className="text-sm text-text-secondary">Primary</p>
            </div>
            <div>
              <div className="h-20 bg-gradient-secondary rounded-lg mb-2 shadow-md" />
              <p className="text-sm text-text-secondary">Secondary</p>
            </div>
            <div>
              <div className="h-20 bg-gradient-success rounded-lg mb-2 shadow-md" />
              <p className="text-sm text-text-secondary">Success</p>
            </div>
            <div>
              <div className="h-20 bg-gradient-warning rounded-lg mb-2 shadow-md" />
              <p className="text-sm text-text-secondary">Warning</p>
            </div>
            
            {/* Crypto Colors */}
            <div>
              <div className="h-20 bg-gradient-btc rounded-lg mb-2 shadow-md flex items-center justify-center">
                <span className="text-white font-bold">BTC</span>
              </div>
              <p className="text-sm text-text-secondary">Bitcoin</p>
            </div>
            <div>
              <div className="h-20 bg-gradient-eth rounded-lg mb-2 shadow-md flex items-center justify-center">
                <span className="text-white font-bold">ETH</span>
              </div>
              <p className="text-sm text-text-secondary">Ethereum</p>
            </div>
            <div>
              <div className="h-20 bg-gradient-usdt rounded-lg mb-2 shadow-md flex items-center justify-center">
                <span className="text-white font-bold">USDT</span>
              </div>
              <p className="text-sm text-text-secondary">Tether</p>
            </div>
            <div>
              <div className="h-20 bg-gradient-luxury rounded-lg mb-2 shadow-md flex items-center justify-center">
                <span className="text-gray-900 font-bold">GOLD</span>
              </div>
              <p className="text-sm text-text-secondary">Luxury</p>
            </div>
          </div>
        </motion.div>

        {/* Component Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6 mb-12"
        >
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Exemplos de Componentes</h3>
          
          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-skeuomorphic">
              <h4 className="font-semibold text-text-primary mb-2">Card Skeumórfico</h4>
              <p className="text-text-secondary text-sm">
                Este é um exemplo de card com sombras skeumórficas que se adaptam ao tema.
              </p>
            </div>
            
            <div className="glass-effect p-6 rounded-xl">
              <h4 className="font-semibold text-text-primary mb-2">Glass Effect</h4>
              <p className="text-text-secondary text-sm">
                Card com efeito glass morphism adaptado para cada tema.
              </p>
            </div>
            
            <div className="bg-surface-primary p-6 rounded-xl border border-border-primary">
              <h4 className="font-semibold text-text-primary mb-2">Card com Borda</h4>
              <p className="text-text-secondary text-sm">
                Card simples com bordas que mudam de cor conforme o tema.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="bg-surface-primary rounded-xl p-6 shadow-lg">
            <h4 className="font-semibold text-text-primary mb-4">Botões</h4>
            <div className="flex flex-wrap gap-4">
              <button className="btn-skeuomorphic">
                Primário
              </button>
              <button className="px-6 py-3 bg-gradient-secondary text-white rounded-lg shadow-medium hover:shadow-hard transition-all">
                Secundário
              </button>
              <button className="px-6 py-3 bg-gradient-success text-white rounded-lg shadow-medium hover:shadow-hard transition-all">
                Sucesso
              </button>
              <button className="px-6 py-3 bg-gradient-warning text-white rounded-lg shadow-medium hover:shadow-hard transition-all">
                Aviso
              </button>
              <button className="px-6 py-3 bg-gradient-danger text-white rounded-lg shadow-medium hover:shadow-hard transition-all">
                Perigo
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <div className="bg-surface-primary rounded-xl p-6 shadow-lg">
            <h4 className="font-semibold text-text-primary mb-4">Campos de Input</h4>
            <div className="space-y-4 max-w-md">
              <input 
                type="text" 
                placeholder="Input skeumórfico"
                className="input-skeuomorphic w-full"
              />
              <textarea 
                placeholder="Textarea com tema adaptativo"
                rows={3}
                className="input-skeuomorphic w-full resize-none"
              />
              <select className="input-skeuomorphic w-full">
                <option>Selecione uma opção</option>
                <option>Opção 1</option>
                <option>Opção 2</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Advanced Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-surface-primary rounded-xl p-6 shadow-lg"
        >
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-text-primary">Configurações Avançadas</h3>
            <svg 
              className={`w-5 h-5 text-text-secondary transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAdvanced && (
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="font-medium text-text-primary mb-2">Informações do Sistema</h4>
                <div className="bg-surface-secondary rounded-lg p-4 space-y-2">
                  <p className="text-sm text-text-secondary">
                    Tema resolvido: <span className="font-mono text-text-primary">{isDark ? 'dark' : 'light'}</span>
                  </p>
                  <p className="text-sm text-text-secondary">
                    Preferência de movimento reduzido: <span className="font-mono text-text-primary">{prefersReducedMotion ? 'sim' : 'não'}</span>
                  </p>
                  <p className="text-sm text-text-secondary">
                    Tema customizado: <span className="font-mono text-text-primary">{customTheme || 'nenhum'}</span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-text-primary mb-2">Cores Atuais</h4>
                <div className="bg-surface-secondary rounded-lg p-4">
                  <pre className="text-xs text-text-secondary overflow-x-auto">
                    {JSON.stringify(themeColors, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-surface-primary rounded-xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-semibold text-text-primary mb-6">Recursos do Sistema</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary">Transições Suaves</h4>
                  <p className="text-sm text-text-secondary">Fade de 300ms entre temas sem piscar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary">Persistência Local</h4>
                  <p className="text-sm text-text-secondary">Preferências salvas no localStorage</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary">Detecção do Sistema</h4>
                  <p className="text-sm text-text-secondary">Respeita preferências do OS</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary">Sem FOUC</h4>
                  <p className="text-sm text-text-secondary">Script inline previne flash</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary">Tema Automático</h4>
                  <p className="text-sm text-text-secondary">Baseado em horário do dia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary">Sincronização</h4>
                  <p className="text-sm text-text-secondary">Entre abas do navegador</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary">Acessibilidade</h4>
                  <p className="text-sm text-text-secondary">Contraste WCAG AAA</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary">Mobile Friendly</h4>
                  <p className="text-sm text-text-secondary">Meta theme-color dinâmica</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}