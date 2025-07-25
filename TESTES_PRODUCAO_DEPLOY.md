# 🧪 Roteiro Completo de Testes em Produção - Rio Porto P2P

**Data do Deploy:** 25/01/2025  
**URL de Produção:** https://rioporto.com.br  
**Status:** ✅ Deploy bem-sucedido no Railway

---

## 📋 Checklist Rápido de Testes

### 🔐 Autenticação (PRIORIDADE MÁXIMA)
- [ ] Registro de novo usuário funciona
- [ ] Email de verificação é enviado
- [ ] Login com email/senha funciona
- [ ] Login com Google OAuth funciona
- [ ] Logout funciona corretamente
- [ ] Sessão persiste ao navegar

### 💰 Funcionalidades Core P2P
- [ ] Criar anúncio de compra
- [ ] Criar anúncio de venda
- [ ] Listar anúncios no marketplace
- [ ] Filtros de busca funcionam
- [ ] Iniciar transação P2P

### 💬 Chat em Tempo Real (Pusher)
- [ ] Enviar mensagem no chat
- [ ] Receber mensagem em tempo real
- [ ] Indicador de digitação funciona
- [ ] Notificações aparecem

### 📸 Upload de Imagens (Cloudinary)
- [ ] Upload de foto de perfil
- [ ] Upload de documentos KYC
- [ ] Preview de imagem funciona
- [ ] Imagens são salvas corretamente

### 📱 Mobile e Responsividade
- [ ] Site carrega bem no celular
- [ ] Formulários funcionam no mobile
- [ ] Chat funciona no mobile
- [ ] Scroll e navegação suaves

---

## 🔍 Testes Detalhados

### 1. AUTENTICAÇÃO E REGISTRO

#### 1.1 Teste de Registro Completo
**URL:** https://rioporto.com.br/register

**Passos:**
1. Abra a página de registro
2. Preencha o formulário com:
   ```
   Nome: [Seu nome de teste]
   Email: [Email válido que você tem acesso]
   WhatsApp: [Número válido]
   Senha: [Senha forte com 8+ caracteres]
   ```
3. Observe o indicador de força da senha
4. Marque "Li e aceito os termos"
5. Clique em "Criar conta"

**Verificar:**
- ✓ Validação em tempo real funciona
- ✓ Indicador de senha muda cores (vermelho → amarelo → verde)
- ✓ Botão fica habilitado quando formulário válido
- ✓ Após clicar, redireciona para página de confirmação
- ✓ Email de verificação chega na caixa de entrada

**Se houver erro, anotar:**
- Mensagem de erro exata
- Em qual campo ocorreu
- Screenshot se possível

#### 1.2 Teste de Login Email/Senha
**URL:** https://rioporto.com.br/login

**Passos:**
1. Use as credenciais criadas no registro
2. Digite email e senha
3. Clique em "Entrar"

**Verificar:**
- ✓ Login bem-sucedido
- ✓ Redireciona para /dashboard
- ✓ Nome do usuário aparece no header
- ✓ Menu de usuário funciona

#### 1.3 Teste de Login com Google
**URL:** https://rioporto.com.br/login

**Passos:**
1. Clique no botão "Entrar com Google"
2. Selecione sua conta Google
3. Autorize o acesso

**Verificar:**
- ✓ Redireciona para accounts.google.com
- ✓ Retorna ao site após autorizar
- ✓ Cria conta ou conecta com existente
- ✓ Dashboard carrega corretamente

#### 1.4 Teste de Verificação de Email
**Passos:**
1. Acesse seu email
2. Procure por email de "Rio Porto P2P"
3. Clique no link de verificação

**Verificar:**
- ✓ Email chegou (verificar spam também)
- ✓ Link funciona
- ✓ Página confirma verificação
- ✓ Badge de "Email verificado" aparece

---

### 2. FUNCIONALIDADES P2P

#### 2.1 Criar Anúncio de Venda
**URL:** https://rioporto.com.br/dashboard → "Criar Anúncio"

**Passos:**
1. Clique em "Criar Anúncio"
2. Selecione:
   ```
   Tipo: Venda
   Criptomoeda: Bitcoin
   Preço: Mercado + 2%
   Mínimo: R$ 100
   Máximo: R$ 5.000
   Método: PIX
   ```
3. Adicione instruções de negociação
4. Clique em "Publicar anúncio"

**Verificar:**
- ✓ Formulário valida limites
- ✓ Preview do anúncio aparece
- ✓ Anúncio é criado com sucesso
- ✓ Aparece em "Meus anúncios"
- ✓ Aparece no marketplace público

#### 2.2 Buscar e Filtrar Anúncios
**URL:** https://rioporto.com.br/listings

**Passos:**
1. Acesse o marketplace
2. Teste filtros:
   - Por criptomoeda (Bitcoin, Ethereum)
   - Por tipo (Compra/Venda)
   - Por método de pagamento
   - Por faixa de valor
3. Ordene por preço/reputação

**Verificar:**
- ✓ Filtros aplicam corretamente
- ✓ Resultados atualizam em tempo real
- ✓ Contador de resultados correto
- ✓ Ordenação funciona

#### 2.3 Iniciar Transação
**Passos:**
1. Encontre um anúncio ativo
2. Clique em "Negociar"
3. Digite o valor desejado
4. Confirme a transação

**Verificar:**
- ✓ Modal de confirmação aparece
- ✓ Cálculos estão corretos
- ✓ Transação é criada
- ✓ Redireciona para página da transação
- ✓ Chat é aberto automaticamente

---

### 3. CHAT EM TEMPO REAL (PUSHER)

#### 3.1 Teste Básico de Chat
**Pré-requisito:** Ter uma transação ativa

**Passos:**
1. Abra a transação
2. Digite uma mensagem no chat
3. Envie a mensagem
4. Abra a MESMA transação em outra aba/dispositivo

**Verificar:**
- ✓ Mensagem aparece instantaneamente
- ✓ Timestamp correto
- ✓ Indicador de "lido" funciona
- ✓ Notificação sonora (se habilitada)

#### 3.2 Teste de Indicador de Digitação
**Passos:**
1. Em uma aba, comece a digitar
2. Na outra aba, observe o indicador

**Verificar:**
- ✓ "Fulano está digitando..." aparece
- ✓ Desaparece quando para de digitar

#### 3.3 Teste de Notificações
**Passos:**
1. Com chat aberto em uma aba
2. Envie mensagem de outra aba/dispositivo

**Verificar:**
- ✓ Contador de não lidas aumenta
- ✓ Notificação no browser (se permitida)
- ✓ Som de notificação toca

---

### 4. UPLOAD DE IMAGENS (CLOUDINARY)

#### 4.1 Upload de Avatar
**URL:** https://rioporto.com.br/profile

**Passos:**
1. Acesse seu perfil
2. Clique em "Alterar foto"
3. Selecione uma imagem JPG/PNG < 5MB
4. Aguarde upload

**Verificar:**
- ✓ Preview aparece antes de salvar
- ✓ Barra de progresso funciona
- ✓ Imagem é salva
- ✓ Aparece em todos os lugares (header, chat, etc)

#### 4.2 Upload de Documentos KYC
**URL:** https://rioporto.com.br/kyc

**Passos:**
1. Inicie processo de verificação
2. Faça upload de documento

**Verificar:**
- ✓ Aceita formatos permitidos
- ✓ Rejeita arquivos muito grandes
- ✓ Preview funciona
- ✓ Documento é enviado para análise

---

### 5. TESTES MOBILE 📱

#### 5.1 Teste em Smartphone
**Dispositivos sugeridos:** iPhone e Android

**Verificar:**
- ✓ Site carrega completamente
- ✓ Não há scroll horizontal
- ✓ Botões são clicáveis
- ✓ Formulários funcionam
- ✓ Teclado não cobre campos
- ✓ Chat funciona bem

#### 5.2 Teste de Performance Mobile
**Passos:**
1. Desative o WiFi (use 4G)
2. Navegue pelo site

**Verificar:**
- ✓ Páginas carregam em < 3 segundos
- ✓ Imagens são otimizadas
- ✓ Não trava ao rolar

---

### 6. MONITORAMENTO E LOGS 🔍

#### 6.1 Console do Navegador
**Como verificar:** Pressione F12 → Aba Console

**Procurar por:**
- ❌ Erros em vermelho
- ⚠️ Warnings importantes
- 🔴 Failed to fetch
- 🔴 404/500 errors

#### 6.2 Railway Logs
**Onde:** Dashboard do Railway → Projeto → Logs

**Procurar por:**
- Error
- Failed
- Unhandled
- Critical
- Timeout

---

## 🐛 Como Reportar Problemas

### Informações Essenciais:
1. **Página onde ocorreu:** URL completa
2. **O que você estava fazendo:** Passo a passo
3. **O que aconteceu:** Descrição do erro
4. **O que deveria acontecer:** Comportamento esperado
5. **Console do navegador:** Screenshot dos erros
6. **Dispositivo:** Desktop/Mobile, navegador, SO

### Template de Reporte:
```
PROBLEMA: [Título breve]
URL: https://rioporto.com.br/...
PASSOS:
1. Fiz login
2. Cliquei em X
3. Erro apareceu

ERRO: [Mensagem exata]
ESPERADO: [O que deveria acontecer]
CONSOLE: [Screenshot]
DISPOSITIVO: Chrome no Windows 11
```

---

## 🎯 Ordem de Prioridade

### 🔴 CRÍTICO (Fazer primeiro)
1. Registro de usuário
2. Login (email e Google)
3. Criar anúncio
4. Iniciar transação

### 🟡 IMPORTANTE (Fazer em seguida)
5. Chat em tempo real
6. Upload de imagens
7. Filtros do marketplace
8. Navegação mobile

### 🟢 DESEJÁVEL (Se houver tempo)
9. Verificação KYC completa
10. Fluxo completo de transação
11. Sistema de avaliações
12. Notificações push

---

## 📊 Resultado dos Testes

### Resumo (preencher após testes):
- **Total de testes:** 40
- **✅ Passou:** ___
- **❌ Falhou:** ___
- **⚠️ Com problemas:** ___

### Problemas Encontrados:
1. _____________________
2. _____________________
3. _____________________

### Observações Gerais:
_____________________
_____________________
_____________________

---

## 🚀 Próximos Passos

Após completar os testes:
1. Priorizar correção dos problemas críticos
2. Agendar correções dos problemas médios
3. Documentar melhorias sugeridas
4. Planejar testes automatizados

---

**Boa viagem! 🛫**  
Quando voltar, siga este roteiro do início ao fim.  
Qualquer dúvida, o histórico do chat tem todo o contexto.

*Documento criado em 25/01/2025 por Claude Code*