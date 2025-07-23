# Rio Porto P2P 🚀

Plataforma P2P de criptomoedas com design skeumórfico exclusivo.

## 🌐 Status: EM PRODUÇÃO!

**URL**: https://rioportop2p.up.railway.app

## 📊 Stack Tecnológico

- **Frontend**: Next.js 15 + TypeScript
- **Estilização**: TailwindCSS + Animações customizadas
- **Banco de Dados**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autenticação**: NextAuth.js v5
- **Deploy**: Railway
- **APIs**: CoinGecko, Mercado Pago (em implementação)

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:generate
npm run db:push

# Desenvolvimento local
npm run dev

# Build para produção
npm run build
npm run start
```

## 🔧 Configuração

### Variáveis de Ambiente Necessárias:

```env
# Banco de Dados (Neon)
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Autenticação
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# APIs Externas
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
```

### Usuários de Teste:

| Email | Senha | KYC Level |
|-------|-------|-----------|
| basico@rioporto.com | senha123 | BASIC |
| intermediario@rioporto.com | senha123 | INTERMEDIATE |
| avancado@rioporto.com | senha123 | ADVANCED |

## 📁 Estrutura do Projeto

```
src/
├── app/           # Rotas e páginas (App Router)
├── components/    # Componentes reutilizáveis
├── lib/          # Utilitários e configurações
├── services/     # Integrações externas
└── types/        # TypeScript types

prisma/
├── schema.prisma  # 24 modelos de dados
└── seed.ts       # Dados iniciais
```

## 🎨 Features Implementadas

- ✅ Sistema de autenticação completo
- ✅ 4 níveis de KYC
- ✅ Design skeumórfico com animações
- ✅ Dashboard responsivo
- ✅ API routes estruturadas
- ✅ Integração com CoinGecko
- ✅ Sistema de permissões por nível

## 🔄 Em Desenvolvimento

- 🚧 Sistema P2P de trading
- 🚧 Integração PIX/Mercado Pago
- 🚧 Chat em tempo real
- 🚧 Sistema de reputação
- 🚧 Validação KYC com OCR

## 📚 Documentação

- [Status de Desenvolvimento](./DEVELOPMENT_STATUS.md)
- [Próximos Passos](./NEXT_STEPS_2025_01_23.md)
- [Padrões de Código](./CODE_STANDARDS.md)
- [Setup do Banco](./DATABASE_SETUP.md)

## 🛡️ Segurança

- Rate limiting implementado
- Validação de inputs em todas as rotas
- Autenticação em dois fatores (em desenvolvimento)
- Criptografia de dados sensíveis

## 📄 Licença

Privado - Todos os direitos reservados © 2025 Rio Porto P2P