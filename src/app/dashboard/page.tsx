import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Buscar informações do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          buyTransactions: true,
          sellTransactions: true,
          listings: true,
        },
      },
    },
  });

  // Buscar reputação do usuário
  const reputation = await prisma.userReputation.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Rio Porto P2P</h1>
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {user?.kycLevel || 'PLATFORM_ACCESS'}
              </span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total de Transações */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Transações</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(user?._count.buyTransactions || 0) + (user?._count.sellTransactions || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {user?._count.buyTransactions || 0} compras, {user?._count.sellTransactions || 0} vendas
            </p>
          </div>

          {/* Reputação */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Reputação</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {reputation?.averageScore?.toNumber().toFixed(1) || '0.0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {reputation?.totalRatings || 0} avaliações
            </p>
          </div>

          {/* Anúncios Ativos */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Anúncios</h3>
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {user?._count.listings || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Anúncios publicados</p>
          </div>

          {/* Taxa de Sucesso */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Taxa de Sucesso</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {reputation?.successRate?.toNumber().toFixed(0) || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Transações concluídas</p>
          </div>
        </div>

        {/* Ações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Criar Anúncio */}
          <Link href="/listings/new" className="block">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
              <h2 className="text-2xl font-bold mb-2">Publicar Anúncio</h2>
              <p className="text-blue-100 mb-4">Crie um anúncio para comprar ou vender criptomoedas</p>
              <span className="inline-flex items-center text-white font-medium">
                Criar agora →
              </span>
            </div>
          </Link>

          {/* Ver Marketplace */}
          <Link href="/listings" className="block">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
              <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
              <p className="text-green-100 mb-4">Explore anúncios de compra e venda disponíveis</p>
              <span className="inline-flex items-center text-white font-medium">
                Explorar →
              </span>
            </div>
          </Link>
        </div>

        {/* Menu de Navegação */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Link href="/trades" className="group">
            <div className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-all cursor-pointer border border-gray-200 group-hover:border-blue-300">
              <div className="text-3xl mb-2">💱</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Minhas Transações</h3>
            </div>
          </Link>

          <Link href="/messages" className="group">
            <div className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-all cursor-pointer border border-gray-200 group-hover:border-blue-300">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Mensagens</h3>
            </div>
          </Link>

          <Link href="/wallet" className="group">
            <div className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-all cursor-pointer border border-gray-200 group-hover:border-blue-300">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Carteira</h3>
            </div>
          </Link>

          <Link href="/kyc" className="group">
            <div className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-all cursor-pointer border border-gray-200 group-hover:border-blue-300">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Verificação</h3>
            </div>
          </Link>

          <Link href="/profile" className="group">
            <div className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-all cursor-pointer border border-gray-200 group-hover:border-blue-300">
              <div className="text-3xl mb-2">👤</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Perfil</h3>
            </div>
          </Link>

          <Link href="/help" className="group">
            <div className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-all cursor-pointer border border-gray-200 group-hover:border-blue-300">
              <div className="text-3xl mb-2">❓</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Ajuda</h3>
            </div>
          </Link>
        </div>

        {/* Aviso KYC */}
        {user?.kycLevel === 'PLATFORM_ACCESS' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Complete sua verificação
            </h3>
            <p className="text-yellow-700 mb-4">
              Para começar a negociar, você precisa completar a verificação KYC básica.
            </p>
            <Link 
              href="/kyc"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Iniciar Verificação
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}