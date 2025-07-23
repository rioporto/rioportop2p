# 🪟 GUIA WSL PARA WINDOWS

## ⚠️ IMPORTANTE
Este projeto deve ser executado DENTRO do WSL Ubuntu, não no Windows!

## 🚀 Como iniciar o servidor:

### Método 1 - Windows Terminal (Recomendado)
1. Abra o Windows Terminal
2. Clique na seta ▼ e selecione "Ubuntu"
3. Execute:
   ```bash
   cd ~/Projetos/rioporto-app/rioporto-p2p
   npm run dev
   ```

### Método 2 - PowerShell
```powershell
# Entre no WSL primeiro
wsl

# Depois navegue e execute
cd ~/Projetos/rioporto-app/rioporto-p2p
npm run dev
```

### Método 3 - Comando direto
```powershell
wsl -e bash -c "cd ~/Projetos/rioporto-app/rioporto-p2p && npm run dev"
```

## 🌐 Acessar a aplicação
Após iniciar o servidor, acesse no navegador Windows:
- http://localhost:3000

## 📁 Acessar arquivos do Windows Explorer
Caminho: `\\wsl.localhost\Ubuntu\home\johnnyhelder\Projetos\rioporto-app\rioporto-p2p`

## 🛠️ VS Code com WSL
1. Instale a extensão "WSL" no VS Code
2. Use `Ctrl+Shift+P` → "WSL: Open Folder in WSL"
3. O terminal do VS Code já estará no contexto correto

## ❌ Erros comuns

### "Não há suporte para caminhos UNC"
- Você está tentando executar do Windows
- Use um dos métodos acima para entrar no WSL

### "comando não encontrado"
- Certifique-se de estar no WSL Ubuntu
- Execute `which npm` para verificar se o npm está instalado

### Porta 3000 em uso
```bash
# No WSL, execute:
lsof -i :3000
kill -9 <PID>
```