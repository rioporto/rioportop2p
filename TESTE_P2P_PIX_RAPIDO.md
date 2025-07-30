# 🚀 Guia Rápido - Teste P2P com PIX Real

## Fluxo Completo em 10 Passos

### 1️⃣ Preparação (2 usuários)
```
Usuário A (Vendedor): vendedor@teste.com
Usuário B (Comprador): comprador@teste.com
```

### 2️⃣ Vendedor - Cadastrar Chave PIX
1. Login como vendedor
2. Ir para https://rioporto.com.br/pix-keys
3. Clicar "Adicionar Chave PIX"
4. Inserir chave PIX real (CPF, email, etc)
5. Marcar como "Chave Padrão"

### 3️⃣ Vendedor - Criar Anúncio
1. Ir para https://rioporto.com.br/listings/new
2. Escolher:
   - Tipo: **VENDA**
   - Crypto: **BTC**
   - Preço: **R$ 100,00** (teste pequeno)
   - Quantidade: **0.001 BTC**
3. Publicar anúncio

### 4️⃣ Comprador - Iniciar Trade
1. Login como comprador
2. Ir para https://rioporto.com.br/listings
3. Encontrar anúncio do vendedor
4. Clicar "Comprar"
5. Confirmar quantidade

### 5️⃣ Comprador - Pagamento PIX
1. Será redirecionado para `/trades/{id}/payment`
2. **QR Code PIX aparecerá**
3. Abrir app do banco
4. Escanear QR Code
5. Pagar R$ 100,00

### 6️⃣ Aguardar Confirmação
- Status mudará automaticamente
- De "Aguardando Pagamento" → "Pagamento Confirmado"
- Webhook Mercado Pago notifica em ~5-10 segundos

### 7️⃣ Vendedor - Liberar Crypto
1. Acessar https://rioporto.com.br/trades
2. Trade aparecerá com botão "Liberar"
3. Ir para `/trades/{id}/release`
4. Confirmar liberação

### 8️⃣ Finalização
- Status muda para "Concluída"
- Ambos podem avaliar
- Reputação é atualizada

### 9️⃣ Verificar Dashboard
Ambos usuários devem ver:
- Volume total atualizado
- Trade nas "Transações Recentes"
- Estatísticas atualizadas

### 🔟 Testar Chat
Durante a trade:
1. Abrir chat em `/messages/{transactionId}`
2. Enviar mensagens
3. Verificar indicadores "digitando..."
4. Confirmar entrega em tempo real

---

## ⚠️ Checklist de Verificação

### Antes de Começar
- [ ] Webhook Mercado Pago configurado
- [ ] Variáveis de ambiente no Railway
- [ ] Pusher configurado para chat

### Durante o Teste
- [ ] QR Code gerado corretamente
- [ ] Pagamento processado pelo banco
- [ ] Webhook recebido (logs Railway)
- [ ] Status atualizado automaticamente
- [ ] Chat funcionando em tempo real

### Problemas Comuns
1. **QR Code não aparece**: Verificar MERCADO_PAGO_ACCESS_TOKEN
2. **Status não atualiza**: Verificar webhook URL no Mercado Pago
3. **Chat não real-time**: Verificar credenciais Pusher

---

## 📱 Valores Sugeridos para Teste

### Teste Mínimo
- Valor: R$ 1,00
- Crypto: 0.00001 BTC

### Teste Realista
- Valor: R$ 100,00
- Crypto: 0.001 BTC

### Teste Stress
- Valor: R$ 1.000,00
- Crypto: 0.01 BTC

---

## 🔍 Monitoramento

### Railway Logs
```bash
# Ver logs em tempo real
railway logs -f

# Filtrar por webhook
railway logs -f | grep webhook
```

### Mercado Pago Dashboard
1. Acessar https://mercadopago.com.br/developers
2. Ver "Atividade" → "Pagamentos"
3. Verificar status e notificações

---

## ✅ Sucesso = 
- PIX pago e confirmado ✓
- Crypto "liberada" ✓
- Ambos avaliaram ✓
- Dashboard atualizado ✓
- Chat funcionou ✓