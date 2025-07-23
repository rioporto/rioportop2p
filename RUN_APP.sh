#!/bin/bash

echo "🚀 Iniciando Rio Porto P2P Exchange..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verifica se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório do projeto!"
    exit 1
fi

# Limpa processos anteriores
echo "🧹 Limpando processos anteriores..."
pkill -f "next dev" 2>/dev/null || true

# Limpa cache se solicitado
if [ "$1" == "--clean" ]; then
    echo "🗑️  Limpando cache do Next.js..."
    rm -rf .next
fi

# Inicia o servidor
echo ""
echo -e "${GREEN}✅ Iniciando servidor de desenvolvimento...${NC}"
echo ""
echo -e "${YELLOW}📌 URLs disponíveis:${NC}"
echo "   - http://localhost:3000"
echo "   - http://localhost:3000/showcase (Design System)"
echo "   - http://localhost:3000/login"
echo "   - http://localhost:3000/register"
echo ""
echo -e "${YELLOW}👥 Usuários de teste:${NC}"
echo "   - basico@rioporto.com / senha123"
echo "   - intermediario@rioporto.com / senha123"
echo "   - avancado@rioporto.com / senha123"
echo ""
echo "🔄 Pressione Ctrl+C para parar o servidor"
echo ""

# Inicia o Next.js
npm run dev