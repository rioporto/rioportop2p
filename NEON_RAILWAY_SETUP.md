# 🔗 Conectando Neon Database ao Railway - Passo a Passo

## 📋 Pré-requisitos
- Conta no Neon (https://neon.tech)
- Conta no Railway (https://railway.app)
- Projeto criado em ambas plataformas

## 🚀 Passo 1: Obter Connection String do Neon

1. **Acesse o Neon Dashboard**
   - Entre em https://console.neon.tech
   - Selecione seu projeto

2. **Copie a Connection String**
   - No dashboard, clique em "Connection Details"
   - Selecione "Pooled connection" (importante!)
   - Copie a string que aparece, será algo como:
   ```
   postgresql://usuario:senha@ep-nome-projeto.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **Copie também a Direct Connection**
   - Mude para "Direct connection"
   - Copie esta string também (usaremos para migrations)

## 🚂 Passo 2: Configurar Variáveis no Railway

1. **Acesse o Railway Dashboard**
   - Entre em https://railway.app/dashboard
   - Clique no seu projeto
   - Clique no serviço (rioportop2p)

2. **Vá em Variables**
   - Clique na aba "Variables"
   - Delete a variável DATABASE_URL que o Railway criou automaticamente

3. **Adicione as Variáveis do Neon**
   
   Clique em "New Variable" e adicione:

   ```env
   # Conexão principal (pooled)
   DATABASE_URL=postgresql://usuario:senha@ep-nome-projeto.sa-east-1.aws.neon.tech/neondb?sslmode=require
   
   # Conexão direta (para migrations)
   DATABASE_URL_UNPOOLED=postgresql://usuario:senha@ep-nome-projeto.sa-east-1.aws.neon.tech/neondb?sslmode=require
   
   # NextAuth (OBRIGATÓRIO)
   NEXTAUTH_URL=https://rioportop2p.up.railway.app
   NEXTAUTH_SECRET=cole-aqui-o-resultado-de-openssl-rand-base64-32
   
   # Environment
   NODE_ENV=production
   ```

## 🔑 Passo 3: Gerar NEXTAUTH_SECRET

No seu terminal local, execute:
```bash
openssl rand -base64 32
```

Copie o resultado e cole no valor de NEXTAUTH_SECRET no Railway.

## ✅ Passo 4: Aplicar as Variáveis

1. Após adicionar todas as variáveis, clique em "Save"
2. O Railway deve reiniciar o deploy automaticamente
3. Se não reiniciar, clique em "Redeploy" no canto superior direito

## 🗄️ Passo 5: Executar Migrations (Após Deploy)

Quando o deploy estiver completo e rodando:

```bash
# No terminal local, execute:
railway run npx prisma db push

# Depois, popule com dados de teste:
railway run npm run db:seed
```

## 🔍 Verificação

1. **No Railway:**
   - O deploy deve mostrar "Success"
   - Os logs não devem mostrar erros de conexão

2. **No Neon:**
   - Dashboard deve mostrar conexões ativas
   - Você pode ver as queries sendo executadas

## ❗ Troubleshooting

### Erro: "Can't reach database server"
- Verifique se copiou a connection string corretamente
- Certifique-se de usar a versão com ?sslmode=require

### Erro: "Invalid prisma.schema"
- Certifique-se que DATABASE_URL_UNPOOLED está configurado
- Verifique se o schema tem directUrl configurado

### Erro: "NEXTAUTH_URL missing"
- A URL deve ser HTTPS (não HTTP)
- Deve corresponder exatamente à URL do Railway

## 📊 Monitoramento

No Neon Dashboard você pode:
- Ver queries em tempo real
- Monitorar performance
- Ver uso de conexões

No Railway você pode:
- Ver logs em tempo real
- Monitorar uso de recursos
- Ver métricas de requisições