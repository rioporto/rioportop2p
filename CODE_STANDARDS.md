# 📋 PADRÕES DE CÓDIGO - RIO PORTO P2P

## 🎯 DIRETRIZES OBRIGATÓRIAS PARA TODOS OS AGENTES

### 1. ESTRUTURA DE PASTAS
```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas autenticadas
│   ├── api/               # API routes
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI skeumórficos
│   ├── forms/            # Componentes de formulário
│   └── layouts/          # Layouts reutilizáveis
├── lib/                   # Utilitários e configurações
│   ├── auth/             # Lógica de autenticação
│   ├── db/               # Configuração do banco
│   └── utils/            # Funções auxiliares
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types/interfaces
├── services/              # Serviços e integrações
└── styles/                # Estilos e temas
```

### 2. CONVENÇÕES DE CÓDIGO

#### TypeScript
- **SEMPRE** usar TypeScript strict mode
- **SEMPRE** tipar todas as funções e variáveis
- **NUNCA** usar `any` - use `unknown` se necessário
- Interfaces começam com `I` (ex: `IUser`)
- Types são PascalCase (ex: `UserRole`)

#### Componentes React
```tsx
// SEMPRE usar arrow functions com tipo explícito
interface IComponentProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export const Component: React.FC<IComponentProps> = ({ title, variant = 'primary' }) => {
  return <div>{title}</div>;
};
```

#### Nomenclatura
- Componentes: PascalCase (`UserProfile.tsx`)
- Funções: camelCase (`getUserById`)
- Constantes: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- Arquivos: kebab-case (`user-service.ts`)

### 3. DESIGN SYSTEM SKEUMÓRFICO

#### Cores Base
```css
:root {
  --primary: #2563eb;      /* Azul principal */
  --secondary: #10b981;    /* Verde sucesso */
  --accent: #f59e0b;       /* Laranja destaque */
  --danger: #ef4444;       /* Vermelho erro */
  --background: #f3f4f6;   /* Cinza claro */
  --surface: #ffffff;      /* Branco */
  --text-primary: #111827; /* Texto principal */
  --text-secondary: #6b7280; /* Texto secundário */
}
```

#### Sombras e Elevação
```css
.elevation-1 { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.elevation-2 { box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
.elevation-3 { box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
```

#### Componentes Skeumórficos
- Bordas arredondadas suaves (8-12px)
- Gradientes sutis para profundidade
- Texturas realistas quando apropriado
- Feedback visual em interações

### 4. BANCO DE DADOS (NEON)

#### Convenções SQL
- Tabelas: snake_case plural (`users`, `transactions`)
- Colunas: snake_case (`created_at`, `user_id`)
- Primary keys: `id` (UUID)
- Timestamps: `created_at`, `updated_at`

#### Prisma Schema
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("users")
}
```

### 5. API ROUTES

#### Estrutura de Resposta
```typescript
interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: string;
    version: string;
  };
}
```

#### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### 6. AUTENTICAÇÃO (4 NÍVEIS)

#### Níveis de KYC
```typescript
enum KYCLevel {
  PLATFORM_ACCESS = 0,  // Email + Nome
  BASIC = 1,           // + CPF
  INTERMEDIATE = 2,    // + Documento + Endereço
  ADVANCED = 3         // + Selfie com documento
}
```

### 7. SEGURANÇA

- **SEMPRE** validar inputs (usar Zod)
- **SEMPRE** sanitizar dados do usuário
- **NUNCA** expor informações sensíveis
- **SEMPRE** usar HTTPS
- **SEMPRE** implementar rate limiting

### 8. PERFORMANCE

- Lazy loading para componentes pesados
- Image optimization com next/image
- Code splitting automático
- Cache estratégico (Redis quando implementado)

### 9. TESTES

- Mínimo 80% de cobertura
- Testes unitários com Jest
- Testes E2E com Cypress
- Testes de integração para APIs

### 10. COMMITS

Formato: `tipo(escopo): descrição`

Tipos:
- feat: nova funcionalidade
- fix: correção de bug
- docs: documentação
- style: formatação
- refactor: refatoração
- test: testes
- chore: tarefas gerais

---

**IMPORTANTE**: Todos os agentes DEVEM seguir estes padrões rigorosamente para manter consistência e qualidade do código.