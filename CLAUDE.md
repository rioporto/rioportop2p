# Rio Porto P2P - Documentação para Claude

## Visão Geral
Sistema P2P completo para compra e venda de criptomoedas desenvolvido com Next.js 15, TypeScript, Prisma, PostgreSQL (Neon) e Railway.

## Arquitetura

### Stack Tecnológica
- **Frontend**: Next.js 15.4.3 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Deploy**: Railway (Auto-deploy via GitHub)
- **Autenticação**: NextAuth.js v5
- **Real-time**: Pusher/WebSocket
- **Pagamentos**: Mercado Pago PIX API

### Estrutura de Diretórios
```
src/
├── app/                    # App Router pages
│   ├── (dashboard)/       # Páginas autenticadas
│   │   ├── listings/      # Marketplace
│   │   ├── messages/      # Chat
│   │   └── trades/        # Transações
│   ├── api/               # API Routes
│   │   ├── listings/      # CRUD anúncios
│   │   ├── transactions/  # Gerenciamento transações
│   │   ├── chat/          # Mensagens
│   │   ├── payments/      # PIX/webhooks
│   │   └── ratings/       # Avaliações
│   └── dashboard/         # Dashboard principal
├── components/            # Componentes React
│   ├── listings/         # Cards, filtros
│   ├── transactions/     # Status, escrow
│   ├── payments/         # QR code, status
│   └── ratings/          # Estrelas, badges
├── services/             # Lógica de negócio
│   ├── escrow/          # Serviço de custódia
│   ├── payments/        # Integração PIX
│   ├── chat/            # WebSocket
│   └── reputation/      # Cálculo de reputação
├── lib/                 # Utilidades
│   ├── auth/           # Configuração auth
│   ├── db/             # Cliente Prisma
│   └── pusher/         # Cliente WebSocket
└── types/              # TypeScript types
```

## Padrões de Código (DEVELOPMENT_ORCHESTRATION.md)

### API Routes
```typescript
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }
    // Lógica aqui
    return apiResponse.success(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Componentes
- Sempre "use client" para interatividade
- Props com interface I{ComponentName}Props
- Tailwind classes com cn() helper
- Componentes puros e reutilizáveis

### Serviços
- Métodos estáticos
- Tratamento de erros robusto
- Tipos bem definidos
- Transações atômicas

## Fluxo de Transação P2P

1. **Criação de Anúncio**
   - Usuário cria listing (compra/venda)
   - Define crypto, preço, limites, pagamento

2. **Início de Transação**
   - Comprador/vendedor inicia negociação
   - Sistema cria escrow automático
   - Chat privado é aberto

3. **Pagamento**
   - Gera QR Code PIX (quando configurado)
   - Aguarda confirmação via webhook
   - Ou confirmação manual

4. **Liberação**
   - Vendedor libera criptomoedas
   - Sistema finaliza escrow
   - Ambos avaliam

5. **Reputação**
   - Score calculado automaticamente
   - Badges por conquistas
   - Níveis: Bronze → Diamante

## Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # Verificar código
npm run type-check   # Verificar tipos
```

### Banco de Dados
```bash
npx prisma generate  # Gerar cliente Prisma
npx prisma migrate dev  # Criar migrations
npx prisma studio    # Interface visual DB
```

### Deploy
```bash
git add .
git commit -m "feat: descrição"
git push origin main  # Auto-deploy Railway
```

## Variáveis de Ambiente

### Já Configuradas
- AUTH_SECRET, AUTH_URL, AUTH_TRUST_HOST
- AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
- DATABASE_URL
- RESEND_API_KEY
- SMS_DEV_API_KEY

### Pendentes (ver ENVIRONMENT_VARIABLES.md)
- PUSHER_* (chat tempo real)
- MERCADO_PAGO_* (pagamentos)
- CLOUDINARY_* (uploads)

## Problemas Conhecidos

1. **Chat sem real-time**: Configurar Pusher
2. **PIX mockado**: Configurar Mercado Pago
3. **Sem upload de imagens**: Configurar Cloudinary

## Próximas Features

1. **Dashboard Admin**
   - Gerenciar disputas
   - Monitorar transações
   - Relatórios

2. **Mobile App**
   - React Native
   - Push notifications

3. **Mais Cryptos**
   - Integração exchanges
   - Cotações em tempo real

4. **KYC Avançado**
   - Verificação documentos
   - Níveis de verificação

## Testes

Ver TESTING_GUIDE.md para guia completo de testes.

## Contatos e URLs

- **Produção**: https://rioporto.com.br
- **GitHub**: https://github.com/rioporto/rioportop2p
- **Railway**: Deploy automático via GitHub
- **Neon**: Console em https://console.neon.tech