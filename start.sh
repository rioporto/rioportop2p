#!/bin/bash

echo "🚀 Iniciando Rio Porto P2P..."
echo ""

# Mata qualquer processo anterior
echo "🔄 Limpando processos anteriores..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Limpa cache
echo "🧹 Limpando cache..."
rm -rf .next

# Inicia o servidor
echo "✨ Iniciando servidor..."
echo ""
npm run dev

# Se falhar, tenta na porta 3001
if [ $? -ne 0 ]; then
  echo "❌ Erro ao iniciar na porta 3000"
  echo "🔄 Tentando porta 3001..."
  PORT=3001 npm run dev
fi