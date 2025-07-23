#!/bin/bash

echo "🚂 Verificando status do Railway..."
echo ""

# Mostrar informações do projeto
echo "📋 Informações do Projeto:"
railway status
echo ""

# Tentar pegar logs
echo "📝 Logs mais recentes:"
railway logs 2>&1 | head -n 50

echo ""
echo "💡 Dicas:"
echo "- Para ver logs de build: railway logs --build"
echo "- Para ver logs de deploy: railway logs --deployment"
echo "- Para monitorar em tempo real: watch -n 5 railway logs"
echo ""
echo "🌐 Verifique também no dashboard: https://railway.app/dashboard"