# 🎯 Próximos Passos - Deploy Railway

## 🔍 Monitorar o Deploy

1. **Acesse o link do build:**
   ```
   https://railway.com/project/2842abb1-c55f-47f5-9166-6eca721832d1/service/9b715928-409a-4b83-9bee-21c4d2d003bd
   ```

2. **No Dashboard do Railway:**
   - Vá em **Variables** no serviço
   - Adicione as seguintes variáveis:
   
   ```env
   NEXTAUTH_URL=https://rioportop2p.up.railway.app
   NEXTAUTH_SECRET=[gerar com: openssl rand -base64 32]
   NODE_ENV=production
   ```

3. **Aguarde o build completar** (5-10 minutos)

## ✅ Após o Deploy Bem-Sucedido

### 1. Executar Migrações do Banco:
```bash
railway run npm run db:push
```

### 2. Popular Banco com Dados de Teste:
```bash
railway run npm run db:seed
```

### 3. Testar Aplicação:
- Acesse: https://rioportop2p.up.railway.app
- Teste login com:
  - basico@rioporto.com / teste123
  - intermediario@rioporto.com / teste123
  - avancado@rioporto.com / teste123

## 🐛 Se Houver Erros

### Erro de Variáveis de Ambiente:
```bash
# Gerar NEXTAUTH_SECRET
openssl rand -base64 32

# Adicionar no Railway Dashboard
```

### Erro de Banco de Dados:
```bash
# Verificar conexão
railway run npx prisma db push

# Ver logs detalhados
railway logs
```

### Erro 500 no Site:
1. Verifique NEXTAUTH_URL (deve ser HTTPS)
2. Verifique NEXTAUTH_SECRET está configurado
3. Execute as migrações do banco

## 📊 Comandos Úteis

```bash
# Ver logs em tempo real
watch -n 5 railway logs

# Ver status do serviço
railway status

# Executar comandos no servidor
railway run [comando]

# Fazer novo deploy
railway up
```

## 🎉 Sucesso!

Quando estiver funcionando:
1. A aplicação estará em: https://rioportop2p.up.railway.app
2. O banco PostgreSQL estará rodando
3. A autenticação estará funcionando
4. Os níveis de KYC estarão configurados