# Rio Porto P2P - Documentação de Testes Completos

## 🎯 Visão Geral
Este documento contém todos os passos para testar as funcionalidades implementadas na plataforma Rio Porto P2P.

## 📋 Checklist de Funcionalidades para Testar

- [ ] Dashboard Principal
- [ ] Gerenciamento de Chaves PIX
- [ ] Fluxo de Pagamento PIX (P2P)
- [ ] Chat em Tempo Real
- [ ] Sistema de Transações
- [ ] Autenticação Stack Auth

---

## 1️⃣ Dashboard Principal

### Pré-requisitos
- Usuário autenticado
- Acesso em: https://rioporto.com.br/dashboard

### Testes a Realizar

#### 1.1 Visualização de Estatísticas
- [ ] Verificar se o "Volume Total" está calculando corretamente
- [ ] Confirmar contagem de "Trades Completos"
- [ ] Validar "Anúncios Ativos"
- [ ] Checar cálculo de "Reputação"

#### 1.2 Ações Rápidas
- [ ] Testar botão "Comprar Crypto" → deve redirecionar para `/listings?type=SELL`
- [ ] Testar botão "Vender Crypto" → deve redirecionar para `/listings?type=BUY`
- [ ] Testar botão "Criar Anúncio" → deve redirecionar para `/listings/new`
- [ ] Testar botão "Minhas Chaves PIX" → deve redirecionar para `/pix-keys`

#### 1.3 Transações Recentes
- [ ] Verificar listagem de transações
- [ ] Clicar em uma transação → deve abrir detalhes em `/trades/{id}`
- [ ] Validar badges de status (Pendente, Concluída, etc.)

#### 1.4 Mensagens Recentes
- [ ] Verificar listagem de mensagens
- [ ] Indicador de mensagens não lidas
- [ ] Clicar em mensagem → deve abrir chat em `/messages/{transactionId}`

---

## 2️⃣ Gerenciamento de Chaves PIX

### Pré-requisitos
- Usuário autenticado
- Acesso em: https://rioporto.com.br/pix-keys

### Testes a Realizar

#### 2.1 Adicionar Nova Chave PIX
1. Clicar em "Adicionar Chave PIX"
2. Testar cada tipo de chave:
   - [ ] **CPF**: Inserir `123.456.789-00` → deve formatar automaticamente
   - [ ] **CNPJ**: Inserir `12.345.678/0001-00` → deve formatar automaticamente
   - [ ] **Email**: Inserir `teste@email.com` → deve validar formato
   - [ ] **Telefone**: Inserir `(11) 98765-4321` → deve formatar automaticamente
   - [ ] **Chave Aleatória**: Inserir UUID válido

3. Validações:
   - [ ] Campo deve mostrar ícone verde ✓ quando válido
   - [ ] Campo deve mostrar ícone vermelho ⚠️ quando inválido
   - [ ] Badge deve mostrar tipo detectado automaticamente

4. Opções:
   - [ ] Marcar "Definir como chave padrão"
   - [ ] Clicar em "Adicionar Chave"
   - [ ] Deve mostrar tela de sucesso com animação

#### 2.2 Listagem de Chaves
- [ ] Verificar cards de estatísticas (Total, Verificadas, Padrão)
- [ ] Cada chave deve mostrar:
  - Tipo (CPF, Email, etc.)
  - Banco
  - Status (Verificada)
  - Badge "Padrão" se aplicável

#### 2.3 Ações nas Chaves
- [ ] Testar "Definir como padrão" → apenas uma chave pode ser padrão
- [ ] Testar "Remover" → deve pedir confirmação
- [ ] Verificar animações ao adicionar/remover

---

## 3️⃣ Fluxo de Pagamento PIX (P2P)

### Pré-requisitos
- Dois usuários teste (Comprador e Vendedor)
- Vendedor deve ter chave PIX cadastrada
- Anúncio de venda criado

### Testes a Realizar

#### 3.1 Iniciando uma Trade
1. **Como Comprador**:
   - [ ] Acessar anúncio de venda
   - [ ] Clicar em "Comprar"
   - [ ] Inserir quantidade desejada
   - [ ] Confirmar criação da trade

#### 3.2 Pagamento PIX
1. **Como Comprador** em `/trades/{id}/payment`:
   - [ ] Verificar exibição do QR Code PIX
   - [ ] Validar copia-e-cola do código PIX
   - [ ] Confirmar valor correto (BRL)
   - [ ] Testar timer de 30 minutos
   - [ ] Verificar atualização automática do status (polling 5s)

2. **Simulação de Pagamento**:
   - [ ] Usar app bancário para pagar via PIX
   - [ ] Aguardar confirmação automática
   - [ ] Status deve mudar para "PAYMENT_CONFIRMED"

#### 3.3 Liberação de Crypto
1. **Como Vendedor** em `/trades/{id}/release`:
   - [ ] Verificar se aparece apenas após pagamento confirmado
   - [ ] Validar informações da transação
   - [ ] Clicar em "Liberar Criptomoeda"
   - [ ] Confirmar modal de segurança
   - [ ] Status deve mudar para "COMPLETED"

---

## 4️⃣ Chat em Tempo Real

### Pré-requisitos
- Trade ativa entre dois usuários
- Ambos usuários em dispositivos/abas diferentes

### Testes a Realizar

#### 4.1 Envio de Mensagens
- [ ] Digitar mensagem e enviar
- [ ] Mensagem deve aparecer instantaneamente
- [ ] Verificar alinhamento (direita para remetente, esquerda para destinatário)

#### 4.2 Indicadores em Tempo Real
- [ ] **Digitando**: Aparecer "está digitando..." quando outro usuário digita
- [ ] **Leitura**: Duplo check azul quando mensagem é lida
- [ ] **Entrega**: Check único quando mensagem é entregue

#### 4.3 Funcionalidades Avançadas
- [ ] Responder mensagem → deve mostrar preview da mensagem original
- [ ] Scroll automático para novas mensagens
- [ ] Persistência de mensagens ao recarregar página

#### 4.4 Notificações
- [ ] Badge de mensagens não lidas no dashboard
- [ ] Contador atualizar em tempo real

---

## 5️⃣ Sistema de Transações

### Testes de Estados

#### 5.1 Fluxo Completo de Estados
Verificar transição correta entre estados:

1. [ ] `PENDING` → Criação inicial
2. [ ] `AWAITING_PAYMENT` → Após confirmação do comprador
3. [ ] `PAYMENT_CONFIRMED` → Após pagamento PIX confirmado
4. [ ] `RELEASING_CRYPTO` → Durante liberação
5. [ ] `COMPLETED` → Transação finalizada

#### 5.2 Casos de Erro
- [ ] Timeout de pagamento (30 min) → Status `CANCELLED`
- [ ] Cancelamento manual → Status `CANCELLED`
- [ ] Disputa aberta → Status `DISPUTED`

---

## 6️⃣ Autenticação Stack Auth

### Testes a Realizar

#### 6.1 Login/Registro
- [ ] Criar nova conta
- [ ] Login com credenciais
- [ ] Logout
- [ ] Recuperação de senha

#### 6.2 Proteção de Rotas
Verificar redirecionamento para login em:
- [ ] `/dashboard`
- [ ] `/trades`
- [ ] `/pix-keys`
- [ ] `/messages`

---

## 🚨 Testes de Segurança

### Validações Críticas

1. **Chaves PIX**:
   - [ ] Impossível adicionar chave de terceiros
   - [ ] Validação com Mercado Pago

2. **Pagamentos**:
   - [ ] Valor não pode ser alterado após criação
   - [ ] Apenas vendedor pode liberar crypto

3. **Chat**:
   - [ ] Apenas participantes da trade podem enviar mensagens
   - [ ] Histórico preservado e imutável

---

## 📱 Testes de Responsividade

Testar em diferentes dispositivos:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x812)

Verificar em cada tela:
- [ ] Dashboard
- [ ] PIX Keys
- [ ] Payment/Release
- [ ] Chat

---

## 🐛 Bugs Conhecidos para Verificar

1. [ ] Stack Auth `toClientJson` - verificar se ainda ocorre erro no console
2. [ ] Webhook Mercado Pago - confirmar se está recebendo notificações

---

## 📊 Métricas de Performance

Medir tempos de carregamento:
- [ ] Dashboard: < 2s
- [ ] Chat messages: < 100ms (tempo real)
- [ ] PIX payment status: atualização a cada 5s

---

## ✅ Critérios de Aceitação

Para considerar os testes completos:
- Todos os checkboxes marcados
- Nenhum erro crítico encontrado
- Performance dentro dos limites aceitáveis
- Funcionalidades core operacionais

---

## 📝 Template de Reporte de Bugs

```markdown
### Bug #[número]
**Descrição**: [descrição clara do problema]
**Passos para Reproduzir**:
1. [passo 1]
2. [passo 2]
**Resultado Esperado**: [o que deveria acontecer]
**Resultado Atual**: [o que está acontecendo]
**Severidade**: Crítica / Alta / Média / Baixa
**Screenshots**: [se aplicável]
```

---

## 🚀 Próximos Passos Após Testes

1. Corrigir bugs críticos encontrados
2. Implementar melhorias de UX identificadas
3. Otimizar performance onde necessário
4. Preparar para testes com usuários reais