import { prisma } from '@/lib/db/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface IReputationCalculation {
  userId: string;
  totalRatings: number;
  averageScore: number;
  completedTransactions: number;
  successRate: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

interface IUserStats {
  userId: string;
  transactionsByType: {
    purchases: number;
    sales: number;
  };
  volumeByCrypto: {
    crypto: string;
    totalVolume: number;
    transactionCount: number;
  }[];
  averageResponseTime: number;
  completionRate: number;
  badges: string[];
}

interface ITopTrader {
  userId: string;
  name: string;
  image: string | null;
  averageScore: number;
  completedTransactions: number;
  successRate: number;
  level: string;
  totalVolume: number;
}

export class ReputationService {
  /**
   * Recalcula a reputação de um usuário baseado em suas avaliações
   */
  static async recalculateUserReputation(userId: string): Promise<IReputationCalculation> {
    // Buscar todas as avaliações recebidas pelo usuário
    const ratings = await prisma.rating.findMany({
      where: {
        ratedUserId: userId,
      },
      include: {
        transaction: true,
      },
    });

    // Buscar todas as transações concluídas do usuário
    const completedTransactions = await prisma.transaction.count({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
        status: 'COMPLETED',
      },
    });

    // Buscar total de transações (para calcular taxa de sucesso)
    const totalTransactions = await prisma.transaction.count({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
        status: {
          in: ['COMPLETED', 'CANCELLED', 'DISPUTED'],
        },
      },
    });

    // Calcular média das avaliações
    const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const averageScore = ratings.length > 0 ? totalScore / ratings.length : 0;

    // Calcular taxa de sucesso
    const successRate = totalTransactions > 0 
      ? (completedTransactions / totalTransactions) * 100 
      : 0;

    // Determinar nível baseado em critérios
    const level = this.calculateLevel(
      completedTransactions,
      averageScore,
      successRate
    );

    // Atualizar ou criar registro de reputação
    await prisma.userReputation.upsert({
      where: { userId },
      update: {
        totalRatings: ratings.length,
        averageScore: new Decimal(averageScore),
        completedTransactions,
        successRate: new Decimal(successRate),
        level,
        updatedAt: new Date(),
      },
      create: {
        userId,
        totalRatings: ratings.length,
        averageScore: new Decimal(averageScore),
        completedTransactions,
        successRate: new Decimal(successRate),
        level,
      },
    });

    return {
      userId,
      totalRatings: ratings.length,
      averageScore,
      completedTransactions,
      successRate,
      level,
    };
  }

  /**
   * Calcula o nível do usuário baseado em critérios
   */
  private static calculateLevel(
    completedTransactions: number,
    averageScore: number,
    successRate: number
  ): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' {
    // EXPERT: 50+ transações, média >= 4.5, taxa >= 95%
    if (
      completedTransactions >= 50 &&
      averageScore >= 4.5 &&
      successRate >= 95
    ) {
      return 'EXPERT';
    }

    // ADVANCED: 20+ transações, média >= 4.0, taxa >= 90%
    if (
      completedTransactions >= 20 &&
      averageScore >= 4.0 &&
      successRate >= 90
    ) {
      return 'ADVANCED';
    }

    // INTERMEDIATE: 5+ transações, média >= 3.5, taxa >= 80%
    if (
      completedTransactions >= 5 &&
      averageScore >= 3.5 &&
      successRate >= 80
    ) {
      return 'INTERMEDIATE';
    }

    // BEGINNER: padrão para novos usuários
    return 'BEGINNER';
  }

  /**
   * Busca a reputação de um usuário
   */
  static async getUserReputation(userId: string) {
    const reputation = await prisma.userReputation.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Se não existe, criar um registro inicial
    if (!reputation) {
      return this.recalculateUserReputation(userId);
    }

    return reputation;
  }

  /**
   * Retorna estatísticas detalhadas de um usuário
   */
  static async getUserStats(userId: string): Promise<IUserStats> {
    // Buscar transações por tipo
    const [purchases, sales] = await Promise.all([
      prisma.transaction.count({
        where: {
          buyerId: userId,
          status: 'COMPLETED',
        },
      }),
      prisma.transaction.count({
        where: {
          sellerId: userId,
          status: 'COMPLETED',
        },
      }),
    ]);

    // Buscar volume por criptomoeda
    const volumeByCrypto = await prisma.transaction.groupBy({
      by: ['cryptocurrency'],
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Calcular tempo médio de resposta
    const averageResponseTime = await this.calculateResponseTime(userId);

    // Calcular taxa de conclusão
    const completedCount = await prisma.transaction.count({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
        status: 'COMPLETED',
      },
    });

    const totalCount = await prisma.transaction.count({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
        status: {
          notIn: ['PENDING'],
        },
      },
    });

    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Buscar badges do usuário
    const badges = await this.assignBadges(userId);

    return {
      userId,
      transactionsByType: {
        purchases,
        sales,
      },
      volumeByCrypto: volumeByCrypto.map(item => ({
        crypto: item.cryptocurrency,
        totalVolume: item._sum.amount?.toNumber() || 0,
        transactionCount: item._count.id,
      })),
      averageResponseTime,
      completionRate,
      badges,
    };
  }

  /**
   * Retorna o ranking dos melhores traders
   */
  static async getTopTraders(limit: number = 10): Promise<ITopTrader[]> {
    const topTraders = await prisma.userReputation.findMany({
      take: limit,
      orderBy: [
        { averageScore: 'desc' },
        { completedTransactions: 'desc' },
      ],
      where: {
        completedTransactions: {
          gt: 0,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Calcular volume total para cada trader
    const tradersWithVolume = await Promise.all(
      topTraders.map(async (trader) => {
        const volumeResult = await prisma.transaction.aggregate({
          where: {
            OR: [
              { buyerId: trader.userId },
              { sellerId: trader.userId },
            ],
            status: 'COMPLETED',
          },
          _sum: {
            amount: true,
          },
        });

        return {
          userId: trader.userId,
          name: trader.user.name || 'Usuário',
          image: trader.user.image,
          averageScore: trader.averageScore.toNumber(),
          completedTransactions: trader.completedTransactions,
          successRate: trader.successRate.toNumber(),
          level: trader.level,
          totalVolume: volumeResult._sum.amount?.toNumber() || 0,
        };
      })
    );

    return tradersWithVolume;
  }

  /**
   * Calcula o tempo médio de resposta de um usuário no chat
   */
  static async calculateResponseTime(userId: string): Promise<number> {
    // Buscar mensagens onde o usuário respondeu
    const messages = await prisma.message.findMany({
      where: {
        senderId: userId,
      },
      include: {
        transaction: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (messages.length === 0) return 0;

    const responseTimes: number[] = [];

    // Para cada mensagem, verificar se é uma resposta
    messages.forEach((message) => {
      const transactionMessages = message.transaction.messages;
      const messageIndex = transactionMessages.findIndex(m => m.id === message.id);

      // Se não é a primeira mensagem e a mensagem anterior é de outro usuário
      if (messageIndex > 0) {
        const previousMessage = transactionMessages[messageIndex - 1];
        if (previousMessage.senderId !== userId) {
          const responseTime = message.createdAt.getTime() - previousMessage.createdAt.getTime();
          responseTimes.push(responseTime);
        }
      }
    });

    if (responseTimes.length === 0) return 0;

    // Calcular média em minutos
    const averageMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(averageMs / 1000 / 60); // Retornar em minutos
  }

  /**
   * Atribui badges ao usuário baseado em suas conquistas
   */
  static async assignBadges(userId: string): Promise<string[]> {
    const badges: string[] = [];

    // Buscar informações do usuário
    const [transactionCount, reputation, volumeData] = await Promise.all([
      prisma.transaction.count({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId },
          ],
          status: 'COMPLETED',
        },
      }),
      prisma.userReputation.findUnique({
        where: { userId },
      }),
      prisma.transaction.aggregate({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId },
          ],
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Badge: Primeira Transação
    if (transactionCount >= 1) {
      badges.push('Primeira Transação');
    }

    // Badge: Trader Verificado (10+ transações)
    if (transactionCount >= 10) {
      badges.push('Trader Verificado');
    }

    // Badge: Alta Reputação (4.5+ score)
    if (reputation && reputation.averageScore.toNumber() >= 4.5) {
      badges.push('Alta Reputação');
    }

    // Badge: Volume Alto (R$ 10k+)
    const totalVolume = volumeData._sum.amount?.toNumber() || 0;
    if (totalVolume >= 10000) {
      badges.push('Volume Alto');
    }

    // Atualizar badges no banco (se você tiver um campo para isso)
    // Caso queira persistir os badges, você precisaria adicionar um campo no schema

    return badges;
  }
}