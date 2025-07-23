import { PrismaClient } from '@prisma/client';

// Evita múltiplas instâncias do Prisma em desenvolvimento
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Função helper para tratamento de erros do Prisma
export const handlePrismaError = (error: any): string => {
  if (error.code === 'P2002') {
    const target = error.meta?.target;
    return `Registro duplicado: ${target}`;
  }
  
  if (error.code === 'P2025') {
    return 'Registro não encontrado';
  }
  
  if (error.code === 'P2003') {
    return 'Violação de chave estrangeira';
  }
  
  if (error.code === 'P2021') {
    return 'Tabela não existe no banco de dados';
  }
  
  return 'Erro no banco de dados';
};

// Middleware para soft delete
prisma.$use(async (params, next) => {
  // Intercepta queries de delete para models com soft delete
  const modelsWithSoftDelete = ['User'];
  
  if (modelsWithSoftDelete.includes(params.model || '')) {
    if (params.action === 'delete') {
      // Muda a ação para update
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }
    
    if (params.action === 'deleteMany') {
      // Muda a ação para updateMany
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }
    
    // Filtra registros deletados em queries de busca
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where['deletedAt'] = null;
    }
    
    if (params.action === 'findMany') {
      if (params.args.where) {
        if (params.args.where.deletedAt === undefined) {
          params.args.where['deletedAt'] = null;
        }
      } else {
        params.args['where'] = { deletedAt: null };
      }
    }
  }
  
  return next(params);
});

export default prisma;