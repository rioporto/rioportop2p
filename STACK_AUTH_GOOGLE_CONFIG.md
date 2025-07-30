# Configuração do Google OAuth com Stack Auth

## ⚠️ Status Atual
O login com Google está retornando erro de configuração. Para ativar o login social, siga os passos abaixo:

## 📋 Passos para Configurar

### 1. Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ (Google+ API)
4. Vá para "Credenciais" → "Criar credenciais" → "ID do cliente OAuth"

### 2. Configurar OAuth
1. Tipo de aplicativo: **Aplicativo Web**
2. Nome: **Rio Porto P2P**
3. URIs de redirecionamento autorizados:
   - `https://rioporto.com.br/handler/sign-in/callback/google`
   - `http://localhost:3000/handler/sign-in/callback/google` (para desenvolvimento)

### 3. Obter Credenciais
Após criar, você receberá:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

### 4. Configurar no Stack Auth Dashboard
1. Acesse o [Stack Auth Dashboard](https://app.stack-auth.com)
2. Vá para Settings → OAuth Providers
3. Ative o Google OAuth
4. Cole o Client ID e Client Secret

### 5. Variáveis de Ambiente (já configuradas no Railway)
As variáveis do Stack Auth já estão configuradas:
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`

## 🔧 Solução Temporária
Enquanto o Google OAuth não está configurado, os usuários podem:
1. Criar conta com email e senha
2. Fazer login com email e senha
3. Usar a funcionalidade "Esqueceu a senha" se necessário

## 📝 Notas
- O erro "Configuration" indica que o Google OAuth não está configurado no Stack Auth
- Isso NÃO afeta o login com email/senha
- A página de erro foi criada para informar os usuários adequadamente