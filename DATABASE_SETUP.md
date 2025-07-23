# 🗄️ Configuração do Banco de Dados - Rio Porto P2P

## 📋 Pré-requisitos

1. Conta no [Neon](https://neon.tech) para PostgreSQL serverless
2. Node.js 18+ instalado
3. Arquivo `.env.local` configurado

## 🚀 Configuração Inicial

### 1. Criar banco de dados no Neon

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Crie um novo projeto
3. Copie a connection string (com pooling e sem pooling)

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
# URL com pooling para aplicação
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"

# URL direta para migrações (sem pooling)
DIRECT_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

### 3. Gerar cliente Prisma

```bash
npm run db:generate
```

### 4. Executar migrações

```bash
npm run db:migrate
```

### 5. Popular banco com dados de teste

```bash
npm run db:seed
```

## 📝 Scripts Disponíveis

- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:migrate` - Executa migrações pendentes
- `npm run db:push` - Sincroniza schema sem histórico de migrações
- `npm run db:seed` - Popula banco com dados de teste
- `npm run db:studio` - Abre interface visual do Prisma Studio
- `npm run db:reset` - Reseta banco de dados (CUIDADO!)

## 🔐 Níveis de KYC

O sistema implementa 4 níveis de KYC:

1. **PLATFORM_ACCESS (Nível 0)**
   - Apenas email e nome
   - Sem permissão para transações

2. **BASIC (Nível 1)**
   - Email + CPF verificados
   - Limites básicos de transação

3. **INTERMEDIATE (Nível 2)**
   - Documentos + Endereço verificados
   - Limites médios de transação

4. **ADVANCED (Nível 3)**
   - Selfie com documento verificada
   - Limites máximos de transação

## 👥 Usuários de Teste

Após executar o seed, os seguintes usuários estarão disponíveis:

| Email | Senha | KYC Level | Descrição |
|-------|-------|-----------|-----------|
| admin@rioporto.com | Admin@123 | ADVANCED | Administrador |
| joao.silva@email.com | User@123 | ADVANCED | Usuário completo |
| maria.santos@email.com | User@123 | INTERMEDIATE | Usuário médio |
| pedro.oliveira@email.com | User@123 | BASIC | Usuário básico |
| ana.costa@email.com | User@123 | PLATFORM_ACCESS | Apenas cadastro |

## 🏗️ Estrutura do Banco

### Principais Tabelas

- **users** - Usuários e informações de KYC
- **user_profiles** - Perfis detalhados
- **user_documents** - Documentos KYC
- **wallets** - Carteiras de criptomoedas
- **orders** - Ordens de compra/venda
- **trades** - Execuções de ordens
- **p2p_ads** - Anúncios P2P
- **p2p_trades** - Negociações P2P
- **payment_methods** - Métodos de pagamento
- **pix_transactions** - Transações PIX
- **audit_logs** - Logs de auditoria

## 🔧 Desenvolvimento

### Visualizar dados

```bash
npm run db:studio
```

Acesse http://localhost:5555 para visualizar e editar dados.

### Criar nova migração

```bash
npx prisma migrate dev --name nome_da_migracao
```

### Resetar banco (desenvolvimento)

```bash
npm run db:reset
```

⚠️ **ATENÇÃO**: Este comando apaga todos os dados!

## 🐛 Troubleshooting

### Erro de conexão

1. Verifique se as URLs no `.env.local` estão corretas
2. Confirme que o banco Neon está ativo
3. Teste a conexão diretamente no console Neon

### Erro de migração

1. Use `DIRECT_URL` sem pooling para migrações
2. Verifique se o schema está válido com `npx prisma validate`

### Erro de tipos

1. Execute `npm run db:generate` após mudanças no schema
2. Reinicie o TypeScript server no VSCode

## 📚 Documentação

- [Prisma Docs](https://www.prisma.io/docs)
- [Neon Docs](https://neon.tech/docs)
- [Modelo de Dados Completo](/home/johnnyhelder/Projetos/rioporto-app/Planejamento Claude/01-Analise-Arquitetura/modelo-dados.md)