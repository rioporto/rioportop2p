# Guia de Testes - Rio Porto P2P

## Fluxo Completo de Teste

### 1. Autenticação
- [x] Acesse https://rioporto.com.br
- [x] Faça login com basico@rioporto.com
- [x] Você será redirecionado ao dashboard

### 2. Criar um Anúncio
1. No dashboard, clique em "Publicar Anúncio"
2. Preencha os campos:
   - Tipo: Venda ou Compra
   - Criptomoeda: BTC, ETH, USDT, etc.
   - Quantidade: Ex: 0.01
   - Preço: Ex: 250000
   - Métodos de pagamento: PIX, TED, Dinheiro
   - Limites: Mín 100, Máx 5000
   - Descrição: Instruções para o comprador
3. Clique em "Publicar Anúncio"

### 3. Visualizar Anúncios
1. Vá para "Marketplace"
2. Use os filtros:
   - Tipo (Compra/Venda)
   - Criptomoeda
   - Método de pagamento
   - Faixa de valor
3. Clique em um anúncio para ver detalhes

### 4. Iniciar uma Transação
1. Na página de detalhes do anúncio
2. Digite o valor desejado
3. Clique em "Iniciar Negociação"
4. O sistema criará:
   - Uma transação com escrow
   - Um chat privado
   - Status de acompanhamento

### 5. Chat e Negociação
1. Use o chat para:
   - Combinar detalhes
   - Enviar comprovantes
   - Tirar dúvidas
2. O vendedor deve:
   - Aguardar confirmação de pagamento
   - Liberar as criptomoedas
3. O comprador deve:
   - Realizar o pagamento
   - Confirmar no sistema

### 6. Pagamento PIX (quando configurado)
1. Clique em "Gerar QR Code PIX"
2. Escaneie o código com seu app bancário
3. O sistema receberá webhook de confirmação
4. Status atualizado automaticamente

### 7. Finalização e Avaliação
1. Após pagamento confirmado:
   - Vendedor libera criptomoedas
   - Sistema registra transação completa
2. Ambas as partes avaliam:
   - Estrelas de 1 a 5
   - Comentário opcional
3. Reputação é atualizada

### 8. Sistema de Reputação
- Bronze: Iniciante (0-4 transações)
- Prata: Intermediário (5-19 transações)
- Ouro: Avançado (20-49 transações)
- Diamante: Expert (50+ transações)

## Casos de Teste Importantes

### Teste 1: Fluxo Feliz
1. Criar anúncio de venda
2. Outro usuário compra
3. Pagamento realizado
4. Criptomoedas liberadas
5. Ambos avaliam positivamente

### Teste 2: Cancelamento
1. Iniciar transação
2. Cancelar antes do pagamento
3. Verificar se escrow foi liberado

### Teste 3: Disputa
1. Iniciar transação
2. Simular problema
3. Abrir disputa
4. Aguardar resolução

### Teste 4: Filtros e Busca
1. Criar múltiplos anúncios
2. Testar cada filtro
3. Verificar ordenação
4. Testar paginação

## Monitoramento

### Logs no Railway
- Verificar logs de aplicação
- Monitorar erros de API
- Acompanhar webhooks

### Banco de Dados
- Verificar criação de registros
- Conferir integridade referencial
- Monitorar performance

## Problemas Comuns

### Chat não atualiza em tempo real
- Configurar variáveis Pusher no Railway
- Verificar console do navegador

### QR Code PIX não aparece
- Configurar Mercado Pago
- Verificar logs de erro

### Imagens não carregam no chat
- Configurar Cloudinary
- Usar texto enquanto não configurado