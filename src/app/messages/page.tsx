import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Buscar todas as transações do usuário com mensagens
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        { sellerId: session.user.id },
      ],
    },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      listing: {
        select: {
          cryptocurrency: true,
          type: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Voltar
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Mensagens</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <Link 
                href="/api/auth/signout"
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma conversa ainda
            </h2>
            <p className="text-gray-600 mb-4">
              Suas conversas aparecerão aqui quando você iniciar uma transação
            </p>
            <Link
              href="/listings"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Marketplace
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => {
                const otherUser = transaction.buyerId === session.user.id 
                  ? transaction.seller 
                  : transaction.buyer;
                const lastMessage = transaction.messages[0];
                const isBuyer = transaction.buyerId === session.user.id;

                return (
                  <Link
                    key={transaction.id}
                    href={`/messages/${transaction.id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            {otherUser.image ? (
                              <img
                                src={otherUser.image}
                                alt={otherUser.name || ''}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <span className="text-xl text-gray-600">
                                {(otherUser.name || otherUser.email || '?')[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {otherUser.name || otherUser.email}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {lastMessage && new Date(lastMessage.createdAt).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="mt-1">
                            <p className="text-sm text-gray-600">
                              {transaction.listing.cryptocurrency} • 
                              {isBuyer ? ' Compra' : ' Venda'} • 
                              <span className={`ml-1 font-medium ${
                                transaction.status === 'COMPLETED' ? 'text-green-600' :
                                transaction.status === 'CANCELLED' ? 'text-red-600' :
                                transaction.status === 'DISPUTED' ? 'text-orange-600' :
                                'text-blue-600'
                              }`}>
                                {transaction.status === 'PENDING' ? 'Pendente' :
                                 transaction.status === 'AWAITING_PAYMENT' ? 'Aguardando Pagamento' :
                                 transaction.status === 'PAYMENT_CONFIRMED' ? 'Pagamento Confirmado' :
                                 transaction.status === 'COMPLETED' ? 'Concluída' :
                                 transaction.status === 'CANCELLED' ? 'Cancelada' :
                                 transaction.status === 'DISPUTED' ? 'Em Disputa' :
                                 transaction.status}
                              </span>
                            </p>
                          </div>

                          {lastMessage && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {lastMessage.senderId === session.user.id ? 'Você: ' : ''}
                              {lastMessage.content}
                            </p>
                          )}

                          {transaction._count.messages > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {transaction._count.messages} mensagem{transaction._count.messages !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}