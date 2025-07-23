# 🎼 ORQUESTRAÇÃO DO DESENVOLVIMENTO - RIO PORTO P2P

## 📐 ARQUITETURA E PADRÕES OBRIGATÓRIOS

### Estrutura de Arquivos
```
src/
├── app/
│   ├── api/
│   │   ├── listings/      # Sistema P2P
│   │   ├── transactions/  # Transações
│   │   ├── chat/         # Chat
│   │   ├── payments/     # Pagamentos
│   │   └── ratings/      # Reputação
│   └── (dashboard)/
│       ├── listings/     # UI Anúncios
│       ├── trades/       # UI Transações
│       └── messages/     # UI Chat
├── components/
│   ├── listings/        # Componentes P2P
│   ├── chat/           # Componentes Chat
│   └── payments/       # Componentes Pagamento
├── services/
│   ├── p2p/           # Lógica P2P
│   ├── escrow/        # Lógica Escrow
│   └── notifications/ # Notificações
└── types/
    ├── listings.ts    # Tipos P2P
    ├── transactions.ts # Tipos Transações
    └── chat.ts        # Tipos Chat
```

### Padrões de Código

#### 1. API Routes (App Router)
```typescript
// Padrão para todas as rotas
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { apiResponse, handleApiError } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return apiResponse.unauthorized();
    }
    
    // Lógica aqui
    
    return apiResponse.success(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### 2. Componentes React
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface IComponentProps {
  // Props tipadas
}

export function ComponentName({ ...props }: IComponentProps) {
  // Estado e lógica
  
  return (
    // JSX com classes Tailwind
  );
}
```

#### 3. Tipos TypeScript
```typescript
// Sempre em arquivos separados em /types
export interface IListing {
  id: string;
  userId: string;
  type: 'BUY' | 'SELL';
  cryptocurrency: string;
  fiatCurrency: string;
  pricePerUnit: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  terms?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4. Prisma Schema
```prisma
model Listing {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id])
  type            ListingType
  cryptocurrency  String
  fiatCurrency    String   @default("BRL")
  pricePerUnit    Decimal  @map("price_per_unit")
  minAmount       Decimal  @map("min_amount")
  maxAmount       Decimal  @map("max_amount")
  paymentMethods  String[]
  terms           String?
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@index([userId])
  @@index([type, isActive])
  @@map("listings")
}

enum ListingType {
  BUY
  SELL
}
```

## 🎭 DIVISÃO DOS 25 AGENTES

### GRUPO 1: Sistema P2P Core (8 agentes)

#### Agente 1: Prisma Schema P2P
**Tarefa**: Criar modelos Listing, ListingType, PaymentMethod
**Arquivo**: prisma/schema.prisma (adicionar aos existentes)

#### Agente 2: API Listings - CREATE
**Tarefa**: POST /api/listings
**Arquivo**: src/app/api/listings/route.ts

#### Agente 3: API Listings - READ
**Tarefa**: GET /api/listings (com filtros)
**Arquivo**: src/app/api/listings/route.ts

#### Agente 4: API Listings - UPDATE/DELETE
**Tarefa**: PUT/DELETE /api/listings/[id]
**Arquivo**: src/app/api/listings/[id]/route.ts

#### Agente 5: UI Criar Anúncio
**Tarefa**: Formulário de criação
**Arquivo**: src/app/(dashboard)/listings/new/page.tsx

#### Agente 6: UI Listar Anúncios
**Tarefa**: Grid com filtros
**Arquivo**: src/app/(dashboard)/listings/page.tsx

#### Agente 7: UI Detalhes Anúncio
**Tarefa**: Página de detalhes
**Arquivo**: src/app/(dashboard)/listings/[id]/page.tsx

#### Agente 8: Componentes P2P
**Tarefa**: ListingCard, ListingFilters, PaymentMethodSelector
**Arquivos**: src/components/listings/*

### GRUPO 2: Sistema de Transações (5 agentes)

#### Agente 9: Prisma Schema Transactions
**Tarefa**: Transaction, TransactionStatus, Escrow
**Arquivo**: prisma/schema.prisma

#### Agente 10: API Transactions
**Tarefa**: Criar, listar, atualizar status
**Arquivo**: src/app/api/transactions/route.ts

#### Agente 11: Serviço Escrow
**Tarefa**: Lógica de retenção e liberação
**Arquivo**: src/services/escrow/escrow.service.ts

#### Agente 12: UI Transações
**Tarefa**: Lista e detalhes de transações
**Arquivo**: src/app/(dashboard)/trades/page.tsx

#### Agente 13: Componentes Transação
**Tarefa**: TransactionCard, StatusBadge, EscrowStatus
**Arquivos**: src/components/transactions/*

### GRUPO 3: Chat em Tempo Real (4 agentes)

#### Agente 14: Prisma Schema Chat
**Tarefa**: Message, Conversation
**Arquivo**: prisma/schema.prisma

#### Agente 15: API Chat
**Tarefa**: Enviar, receber, histórico
**Arquivo**: src/app/api/chat/route.ts

#### Agente 16: WebSocket Service
**Tarefa**: Configurar Pusher/Socket.io
**Arquivo**: src/services/chat/websocket.service.ts

#### Agente 17: UI Chat
**Tarefa**: Interface de chat
**Arquivo**: src/app/(dashboard)/messages/[id]/page.tsx

### GRUPO 4: Integração de Pagamentos (4 agentes)

#### Agente 18: Serviço PIX
**Tarefa**: Integração Mercado Pago PIX
**Arquivo**: src/services/payments/pix.service.ts

#### Agente 19: API Payments
**Tarefa**: Criar PIX, verificar status
**Arquivo**: src/app/api/payments/pix/route.ts

#### Agente 20: Webhook Handler
**Tarefa**: Receber notificações MP
**Arquivo**: src/app/api/payments/webhook/route.ts

#### Agente 21: Componentes Pagamento
**Tarefa**: QRCodeDisplay, PaymentStatus
**Arquivos**: src/components/payments/*

### GRUPO 5: Sistema de Reputação (4 agentes)

#### Agente 22: Prisma Schema Ratings
**Tarefa**: Rating, UserReputation
**Arquivo**: prisma/schema.prisma

#### Agente 23: API Ratings
**Tarefa**: Avaliar, calcular score
**Arquivo**: src/app/api/ratings/route.ts

#### Agente 24: Serviço Reputação
**Tarefa**: Algoritmo de cálculo
**Arquivo**: src/services/reputation/reputation.service.ts

#### Agente 25: Componentes Reputação
**Tarefa**: RatingStars, ReputationBadge
**Arquivos**: src/components/ratings/*

## 🚀 ORDEM DE EXECUÇÃO

1. **FASE 1**: Agentes 1, 9, 14, 22 (Schemas Prisma)
2. **FASE 2**: Agentes 2-4, 10, 15, 19, 23 (APIs)
3. **FASE 3**: Agentes 11, 16, 18, 24 (Serviços)
4. **FASE 4**: Agentes 5-8, 12-13, 17, 20-21, 25 (UI)

## 📝 INSTRUÇÕES PARA TODOS OS AGENTES

1. **SEMPRE** seguir os padrões definidos acima
2. **SEMPRE** usar TypeScript com tipos explícitos
3. **SEMPRE** tratar erros adequadamente
4. **SEMPRE** validar inputs do usuário
5. **SEMPRE** verificar autenticação nas APIs
6. **SEMPRE** usar Tailwind para estilos
7. **NUNCA** adicionar comentários desnecessários
8. **NUNCA** usar any no TypeScript
9. **SEMPRE** testar localmente antes de entregar

## 🎯 RESULTADO ESPERADO

Sistema P2P completo e funcional com:
- ✅ Criação e listagem de anúncios
- ✅ Sistema de transações com escrow
- ✅ Chat em tempo real
- ✅ Pagamentos via PIX
- ✅ Sistema de reputação

Todos os componentes integrados e funcionando em harmonia!