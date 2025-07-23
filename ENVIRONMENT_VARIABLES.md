# Variáveis de Ambiente - Rio Porto P2P

## Variáveis já configuradas no Railway

### Autenticação
- `AUTH_SECRET` - ✅ Configurado
- `AUTH_URL` - ✅ Configurado (https://rioporto.com.br)
- `AUTH_TRUST_HOST` - ✅ Configurado (true)

### OAuth - Google
- `AUTH_GOOGLE_ID` - ✅ Configurado
- `AUTH_GOOGLE_SECRET` - ✅ Configurado

### Banco de Dados
- `DATABASE_URL` - ✅ Configurado (Neon PostgreSQL)

### Email
- `RESEND_API_KEY` - ✅ Configurado

### SMS (opcional)
- `SMS_DEV_API_KEY` - ✅ Configurado

## Variáveis pendentes de configuração

### Chat em Tempo Real - Pusher
Necessário criar conta em https://pusher.com e configurar:
- `PUSHER_APP_ID` - ID da aplicação Pusher
- `PUSHER_KEY` - Chave pública do Pusher
- `PUSHER_SECRET` - Chave secreta do Pusher
- `PUSHER_CLUSTER` - Cluster do Pusher (ex: us2, eu, ap1)
- `NEXT_PUBLIC_PUSHER_KEY` - Mesma chave pública (para client-side)
- `NEXT_PUBLIC_PUSHER_CLUSTER` - Mesmo cluster (para client-side)

### Pagamentos - Mercado Pago
Necessário criar conta em https://www.mercadopago.com.br/developers e configurar:
- `MERCADO_PAGO_ACCESS_TOKEN` - Token de acesso da API
- `MERCADO_PAGO_PUBLIC_KEY` - Chave pública
- `MERCADO_PAGO_WEBHOOK_SECRET` - Secret para validar webhooks

### Upload de Arquivos (opcional)
Para suportar upload de imagens no chat:
- `CLOUDINARY_URL` - URL de configuração do Cloudinary
- `CLOUDINARY_CLOUD_NAME` - Nome do cloud
- `CLOUDINARY_API_KEY` - Chave da API
- `CLOUDINARY_API_SECRET` - Secret da API

## Como configurar no Railway

1. Acesse seu projeto no Railway
2. Vá em "Variables"
3. Adicione cada variável com seu respectivo valor
4. O deploy será reiniciado automaticamente

## Modo de Desenvolvimento

Para desenvolvimento local, o sistema funciona com valores mockados para:
- Pusher: Usa polling ao invés de WebSocket real
- Mercado Pago: Gera QR codes de teste e simula confirmações

## Prioridade de Configuração

1. **Alta Prioridade** (necessário para produção):
   - Pusher (chat em tempo real)
   - Mercado Pago (pagamentos PIX)

2. **Média Prioridade** (melhora a experiência):
   - Cloudinary (upload de arquivos)

3. **Baixa Prioridade** (opcional):
   - Outras integrações futuras