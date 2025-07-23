# 🚀 COMO INICIAR O SERVIDOR

## Comando para iniciar:
```bash
npm run dev
```

## URLs disponíveis:
- http://localhost:3000 - Página inicial
- http://localhost:3000/login - Login
- http://localhost:3000/register - Registro
- http://localhost:3000/showcase - Design System
- http://localhost:3000/dashboard - Dashboard (requer login)

## Usuários de teste:
- acesso@rioporto.com / senha123 (Nível 0)
- basico@rioporto.com / senha123 (Nível 1)
- intermediario@rioporto.com / senha123 (Nível 2)
- avancado@rioporto.com / senha123 (Nível 3)

## Problemas comuns:

### Erro de porta em uso:
```bash
# Encontrar processo na porta 3000
lsof -i :3000
# Matar processo
kill -9 <PID>
```

### Erro de módulos:
```bash
npm install
```

### Erro de banco:
```bash
npm run db:push
npm run db:seed
```