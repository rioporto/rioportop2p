import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { DashboardClient } from './dashboard-client';
import { TransactionStatus } from '@prisma/client';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Buscar informações do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reputation: true,
      pixKeys: {
        where: { isActive: true }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Buscar estatísticas
  const [
    activeListings,
    completedTrades,
    pendingTrades,
    totalVolumeBuy,
    totalVolumeSell,
    unreadMessages
  ] = await Promise.all([
    // Anúncios ativos
    prisma.listing.count({
      where: {
        userId: user.id,
        isActive: true
      }
    }),
    
    // Trades completos
    prisma.transaction.count({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id }
        ],
        status: TransactionStatus.COMPLETED
      }
    }),
    
    // Trades pendentes
    prisma.transaction.count({
      where: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id }
        ],
        status: {
          in: [
            TransactionStatus.PENDING,
            TransactionStatus.AWAITING_PAYMENT,
            TransactionStatus.PAYMENT_CONFIRMED,
            TransactionStatus.RELEASING_CRYPTO
          ]
        }
      }
    }),
    
    // Volume total de compras
    prisma.transaction.aggregate({
      where: {
        buyerId: user.id,
        status: TransactionStatus.COMPLETED
      },
      _sum: {
        totalPrice: true
      }
    }),
    
    // Volume total de vendas
    prisma.transaction.aggregate({
      where: {
        sellerId: user.id,
        status: TransactionStatus.COMPLETED
      },
      _sum: {
        totalPrice: true
      }
    }),
    
    // Mensagens não lidas
    prisma.message.count({
      where: {
        conversation: {
          transaction: {
            OR: [
              { buyerId: user.id },
              { sellerId: user.id }
            ]
          }
        },
        senderId: {
          not: user.id
        },
        isRead: false
      }
    })
  ]);

  // Calcular volume total
  const buyVolume = totalVolumeBuy._sum.totalPrice || 0;
  const sellVolume = totalVolumeSell._sum.totalPrice || 0;
  const totalVolume = Number(buyVolume) + Number(sellVolume);

  // Buscar transações recentes
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { buyerId: user.id },
        { sellerId: user.id }
      ]
    },
    include: {
      listing: true,
      buyer: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  // Buscar mensagens recentes
  const conversations = await prisma.conversation.findMany({
    where: {
      transaction: {
        OR: [
          { buyerId: user.id },
          { sellerId: user.id }
        ]
      }
    },
    include: {
      transaction: {
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          listing: true
        }
      },
      messages: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      lastMessageAt: 'desc'
    },
    take: 5
  });

  // Formatar dados para o client
  const formattedTransactions = recentTransactions.map(tx => {
    const isBuyer = tx.buyerId === user.id;
    const statusMap: Record<TransactionStatus, string> = {
      PENDING: 'Pendente',
      AWAITING_PAYMENT: 'Aguardando Pagamento',
      PAYMENT_CONFIRMED: 'Pagamento Confirmado',
      RELEASING_CRYPTO: 'Liberando Crypto',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada',
      DISPUTED: 'Em Disputa'
    };
    
    return {
      id: tx.id,
      type: isBuyer ? 'BUY' : 'SELL',
      cryptocurrency: tx.listing.cryptocurrency,
      amount: tx.amount.toString(),
      totalPrice: tx.totalPrice.toFixed(2),
      status: tx.status,
      statusLabel: statusMap[tx.status],
      counterparty: isBuyer ? tx.seller : tx.buyer,
      createdAt: tx.createdAt
    };
  });

  const formattedMessages = conversations.map(conv => {
    const lastMessage = conv.messages[0];
    const isBuyer = conv.transaction.buyerId === user.id;
    const counterparty = isBuyer ? conv.transaction.seller : conv.transaction.buyer;
    
    const now = new Date();
    const messageDate = lastMessage ? new Date(lastMessage.createdAt) : new Date(conv.createdAt);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let timeAgo = 'agora';
    if (diffDays > 0) {
      timeAgo = `${diffDays}d`;
    } else if (diffHours > 0) {
      timeAgo = `${diffHours}h`;
    } else if (diffMins > 0) {
      timeAgo = `${diffMins}min`;
    }
    
    return {
      id: conv.id,
      transactionId: conv.transactionId,
      senderName: `${counterparty.firstName} ${counterparty.lastName}`,
      senderInitials: `${counterparty.firstName[0]}${counterparty.lastName[0]}`,
      lastMessage: lastMessage?.content || 'Nova conversa',
      timeAgo,
      cryptocurrency: conv.transaction.listing.cryptocurrency,
      amount: conv.transaction.totalPrice.toFixed(2),
      unread: lastMessage && !lastMessage.isRead && lastMessage.senderId !== user.id
    };
  });

  const stats = {
    activeListings,
    completedTrades,
    pendingTrades,
    totalVolume: `R$ ${totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    reputation: user.reputation?.averageScore?.toNumber() || 0,
    unreadMessages,
    pixKeys: user.pixKeys.length
  };

  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailVerified: user.emailVerified,
    kycLevel: user.kycLevel,
    createdAt: user.createdAt
  };

  return (
    <DashboardClient 
      user={userData}
      stats={stats}
      recentTransactions={formattedTransactions}
      recentMessages={formattedMessages}
    />
  );
}