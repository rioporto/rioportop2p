# 🚨 AÇÕES URGENTES DE SEGURANÇA - RIO PORTO P2P

**SEVERIDADE: CRÍTICA**  
**DATA: 24/01/2025**  
**AÇÃO REQUERIDA: IMEDIATA**

## ❌ VULNERABILIDADES CRÍTICAS ENCONTRADAS

### 1. CREDENCIAIS EXPOSTAS NO REPOSITÓRIO

**Arquivo:** `.env` commitado no repositório

**Credenciais Comprometidas:**
```
DATABASE_URL: PostgreSQL com senha "npg_O9pf5oNAiQmR"
NEXTAUTH_SECRET: 1K1qrnuSXmdQ/NcXwHjm0iCAY3bLyRp/WMvJgjz1gOo=
RESEND_API_KEY: re_QVcGMJj1_GhVvPaEDPZYsCqStqTGqDsLL
SMSDEV_API_KEY: M70FUYVPKBRO5UELRDWLVOF6TYTFFR5LW5HDB...
COINGECKO_API_KEY: CG-1iMh8DqKhxh3kB9L1RYRmJfe
Google OAuth: 374012026497-9mo6vuqelhn8dm6etvl8...
```

### 2. AUTENTICAÇÃO DESATIVADA

**Arquivo:** `src/middleware.ts`
```typescript
// LINHA 30: TODO - MIDDLEWARE DESATIVADO!
return NextResponse.next(); // PERMITE ACESSO IRRESTRITO
```

### 3. APIs DESPROTEGIDAS

- `/api/debug-env` - Expõe variáveis de ambiente
- `/api/fix-optional-fields` - Permite alterações no banco
- Todas as rotas de `/api/listings/*`
- Todas as rotas de `/api/transactions/*`

## 🔥 AÇÕES IMEDIATAS (FAZER AGORA!)

### PASSO 1: Revogar Credenciais (15 minutos)

```bash
# 1. Acesse cada serviço e revogue/regenere:
```

**Neon Database:**
1. Acesse https://console.neon.tech
2. Vá em Settings > Database
3. Reset password
4. Copie nova DATABASE_URL

**Resend:**
1. Acesse https://resend.com/api-keys
2. Delete a key atual
3. Create new API key

**SMSDev:**
1. Acesse painel SMSDev
2. Regenere API key

**CoinGecko:**
1. Acesse https://www.coingecko.com/en/api/pricing
2. Revogue e gere nova key

**Google OAuth:**
1. Acesse https://console.cloud.google.com
2. APIs & Services > Credentials
3. Delete e recrie OAuth 2.0 Client

### PASSO 2: Remover do Git (5 minutos)

```bash
# Execute EXATAMENTE estes comandos:
cd /home/johnnyhelder/Projetos/rioporto-app/rioporto-p2p

# Remover arquivos do git
git rm --cached .env
git rm --cached .env.local
git rm --cached .env.production

# Adicionar ao .gitignore
echo -e "\n# Environment files\n.env\n.env.*\n!.env.example" >> .gitignore

# Commit de segurança
git add .gitignore
git commit -m "security: remove exposed credentials and update gitignore"
git push origin main
```

### PASSO 3: Criar Novo .env (10 minutos)

```bash
# Criar novo arquivo .env com as NOVAS credenciais
cp .env.example .env

# Editar com as novas credenciais
nano .env
```

### PASSO 4: Ativar Middleware (20 minutos)

**Arquivo:** `src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rotas públicas permitidas
  const publicPaths = ['/login', '/register', '/api/auth', '/', '/verify'];
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Verificar autenticação
  const token = request.cookies.get('next-auth.session-token');
  
  if (!token) {
    // APIs retornam 401
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // Páginas redirecionam para login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

### PASSO 5: Deploy Urgente (10 minutos)

```bash
# Verificar alterações
git status

# Commit das correções de segurança
git add -A
git commit -m "security: critical security fixes - enable auth middleware"
git push origin main

# Deploy vai acontecer automaticamente via Railway
```

## 🔒 CHECKLIST DE VERIFICAÇÃO

- [ ] Todas as credenciais antigas revogadas
- [ ] Novas credenciais geradas
- [ ] .env removido do repositório
- [ ] .gitignore atualizado
- [ ] Novo .env criado localmente
- [ ] Middleware ativado
- [ ] Deploy realizado
- [ ] Testar login em produção
- [ ] Verificar que APIs retornam 401 sem auth

## 📞 CONTATOS DE EMERGÊNCIA

- **Neon Support:** https://neon.tech/support
- **Railway Support:** https://railway.app/help
- **GitHub Security:** https://github.com/security

## ⚠️ PRÓXIMAS 24 HORAS

1. Implementar rate limiting
2. Adicionar CSRF protection
3. Configurar Sentry para monitoramento
4. Revisar todas as rotas de API
5. Implementar logging de segurança

---

**TEMPO TOTAL ESTIMADO: 1 HORA**  
**IMPACTO SE NÃO RESOLVER: Sistema totalmente comprometido**  
**STATUS ATUAL: Sistema vulnerável e exposto**