# 🚂 Deploy no Railway - Guia Completo

## ✅ Checklist Pré-Deploy

### 1. No Railway Dashboard:
- [ ] Criar novo projeto
- [ ] Conectar repositório GitHub
- [ ] Adicionar PostgreSQL (Add Service > Database > PostgreSQL)

### 2. Variáveis de Ambiente no Railway:

Vá em **Variables** e adicione:

```env
# NextAuth (OBRIGATÓRIO)
NEXTAUTH_URL=https://SEU-APP.up.railway.app
NEXTAUTH_SECRET=use_este_comando_para_gerar: openssl rand -base64 32

# Node
NODE_ENV=production

# Database (Railway adiciona automaticamente)
# DATABASE_URL será preenchido automaticamente
```

### 3. Gerar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Comandos Importantes:

**Instalar Railway CLI (opcional mas útil):**
```bash
npm install -g @railway/cli
```

**Ver logs em tempo real:**
```bash
railway logs --tail
```

**Executar comandos no servidor:**
```bash
railway run npm run db:push
railway run npm run db:seed
```

## 🚨 Após o Deploy:

1. **Inicializar banco de dados:**
   ```bash
   railway run npm run db:push
   railway run npm run db:seed
   ```

2. **Verificar logs:**
   ```bash
   railway logs
   ```

3. **URLs de teste:**
   - https://SEU-APP.up.railway.app
   - https://SEU-APP.up.railway.app/showcase
   - https://SEU-APP.up.railway.app/test-login

## 🐛 Troubleshooting:

### Erro de build:
- Verifique os logs: `railway logs`
- Certifique-se que `postinstall` está no package.json

### Erro de banco:
- Verifique se DATABASE_URL está configurado
- Execute: `railway run npm run db:push`

### Erro 500:
- Verifique NEXTAUTH_SECRET
- Verifique NEXTAUTH_URL (deve ser HTTPS)

## 📊 Monitoramento:

No terminal, mantenha aberto:
```bash
railway logs --tail --json | grep -E "(error|Error|ERROR)"
```

Isso mostrará apenas erros em tempo real!