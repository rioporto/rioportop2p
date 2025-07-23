# Sistema de Autenticação - Rio Porto P2P Exchange

## Configuração Inicial

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Configure as seguintes variáveis:

- `DATABASE_URL`: URL de conexão com PostgreSQL (Neon)
- `NEXTAUTH_URL`: URL da aplicação (http://localhost:3000 em dev)
- `NEXTAUTH_SECRET`: Chave secreta (gerar com `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: Credenciais OAuth do Google

### 2. Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular banco com dados de teste (opcional)
npm run db:seed
```

### 3. Executar a Aplicação

```bash
npm run dev
```

## Estrutura Implementada

### Arquivos Criados

#### Autenticação Core
- `/src/lib/auth/auth.ts` - Configuração principal do NextAuth
- `/src/lib/auth/auth.config.ts` - Providers e configurações
- `/src/lib/auth/utils.ts` - Utilitários de autenticação
- `/src/middleware.ts` - Middleware de proteção de rotas

#### Tipos e Validações
- `/src/types/auth.ts` - Tipos TypeScript para autenticação
- `/src/lib/validations/auth.ts` - Schemas de validação com Zod

#### API Routes
- `/src/app/api/auth/[...nextauth]/route.ts` - Endpoint NextAuth
- `/src/app/api/auth/register/route.ts` - Registro de usuários
- `/src/app/api/auth/verify-email/route.ts` - Verificação de email

#### Páginas
- `/src/app/(auth)/login/page.tsx` - Página de login
- `/src/app/(auth)/register/page.tsx` - Página de registro
- `/src/app/(auth)/verify/page.tsx` - Página de verificação
- `/src/app/(dashboard)/dashboard/page.tsx` - Dashboard inicial
- `/src/app/(dashboard)/kyc/page.tsx` - Página de KYC

#### Componentes
- `/src/components/forms/LoginForm.tsx` - Formulário de login
- `/src/components/forms/RegisterForm.tsx` - Formulário de registro
- `/src/components/ui/LogoutButton.tsx` - Botão de logout

#### Serviços (Preparados para Integração)
- `/src/services/email.service.ts` - Serviço de email (Resend)
- `/src/services/sms.service.ts` - Serviço de SMS (SMSDev)

#### Banco de Dados
- `/prisma/schema.prisma` - Schema do banco de dados
- `/prisma/seed.ts` - Script de seed para testes

## Níveis de KYC Implementados

1. **Level 0 - PLATFORM_ACCESS**
   - Email verificado + Nome
   - Acesso básico à plataforma
   - Sem limite de transação

2. **Level 1 - BASIC**
   - + CPF verificado
   - Limite: R$ 5.000/mês
   - Habilita: Trading P2P, Depósito PIX

3. **Level 2 - INTERMEDIATE**
   - + Documento com foto + Comprovante endereço
   - Limite: R$ 30.000/mês
   - Habilita: Transferência bancária

4. **Level 3 - ADVANCED**
   - + Selfie com documento
   - Limite: R$ 50.000/mês
   - Habilita: Saque de criptomoedas

## Usuários de Teste

Após executar `npm run db:seed`:

- `user0@example.com` - Nível 0
- `user1@example.com` - Nível 1
- `user2@example.com` - Nível 2
- `user3@example.com` - Nível 3

Senha para todos: `Test@123`

## Funcionalidades Implementadas

### Autenticação
- ✅ Login com email/senha
- ✅ Login com Google OAuth
- ✅ Registro de novos usuários
- ✅ Validação de campos com Zod
- ✅ Hash de senha com bcrypt
- ✅ Sessão JWT segura

### Proteção de Rotas
- ✅ Middleware de autenticação
- ✅ Guards baseados em nível KYC
- ✅ Redirecionamento automático
- ✅ Preservação de URL de callback

### Verificação
- ✅ Sistema de tokens de verificação
- ✅ Página de verificação de email
- ✅ Templates de email preparados

### Preparado para Integração
- ✅ Serviço de email (Resend)
- ✅ Serviço de SMS (SMSDev)
- ✅ Estrutura para upload de documentos

## Próximos Passos

1. Configurar Google OAuth Console
2. Obter API keys do Resend e SMSDev
3. Implementar upload de documentos KYC
4. Adicionar verificação de SMS
5. Implementar reset de senha
6. Adicionar 2FA (autenticação dois fatores)