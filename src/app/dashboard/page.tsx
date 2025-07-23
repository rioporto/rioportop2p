import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { Header } from '@/components/layouts/Header';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { PortfolioChart, BarChart } from '@/components/dashboard/PortfolioChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { KYCLevel } from '@/types/kyc';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Buscar informações completas do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          buyTransactions: true,
          sellTransactions: true,
          listings: {
            where: { isActive: true }
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  // Buscar reputação do usuário
  const reputation = await prisma.userReputation.findUnique({
    where: { userId: session.user.id },
  });

  // Buscar transações recentes para atividade
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { buyerId: session.user.id },
        { sellerId: session.user.id }
      ]
    },
    include: {
      buyer: true,
      seller: true,
      listing: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Buscar mensagens não lidas
  const unreadMessages = await prisma.message.count({
    where: {
      recipientId: session.user.id,
      isRead: false,
    },
  });

  // Buscar dados do portfolio (simulado por enquanto)
  const portfolioData = [
    { label: 'Bitcoin', value: 45000, percentage: 45, color: '#F7931A' },
    { label: 'Ethereum', value: 25000, percentage: 25, color: '#627EEA' },
    { label: 'USDT', value: 20000, percentage: 20, color: '#26A17B' },
    { label: 'BNB', value: 10000, percentage: 10, color: '#F3BA2F' },
  ];

  // Dados de performance mensal (simulado)
  const monthlyPerformance = [
    { label: 'Janeiro', value: 12500, color: '#10B981' },
    { label: 'Fevereiro', value: 15300, color: '#10B981' },
    { label: 'Março', value: 11200, color: '#EF4444' },
    { label: 'Abril', value: 18700, color: '#10B981' },
  ];

  // Preparar dados de estatísticas
  const stats = {
    balance: user.balance?.toNumber() || 0,
    totalTransactions: (user._count.buyTransactions || 0) + (user._count.sellTransactions || 0),
    buyTransactions: user._count.buyTransactions || 0,
    sellTransactions: user._count.sellTransactions || 0,
    reputation: reputation?.averageScore?.toNumber() || 0,
    totalRatings: reputation?.totalRatings || 0,
    successRate: reputation?.successRate?.toNumber() || 0,
    activeListings: user._count.listings || 0,
    monthlyProfit: 2340, // Simulado
  };

  // Preparar atividades recentes
  const activities = recentTransactions.map(tx => ({
    id: tx.id,
    type: tx.buyerId === session.user.id ? 'buy' as const : 'sell' as const,
    title: tx.buyerId === session.user.id 
      ? `Compra de ${tx.listing.currency}` 
      : `Venda de ${tx.listing.currency}`,
    description: tx.buyerId === session.user.id
      ? `Comprado de ${tx.seller.name}`
      : `Vendido para ${tx.buyer.name}`,
    amount: tx.amount.toNumber().toFixed(2),
    currency: tx.listing.currency,
    user: {
      name: tx.buyerId === session.user.id ? tx.seller.name : tx.buyer.name,
    },
    status: tx.status === 'COMPLETED' ? 'completed' as const : 
            tx.status === 'CANCELLED' ? 'cancelled' as const : 
            'pending' as const,
    timestamp: tx.createdAt,
    link: `/trades/${tx.id}`,
  }));

  // Preparar dados do usuário para o Header
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    kycLevel: (user.kycLevel || 'PLATFORM_ACCESS') as KYCLevel,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Premium */}
      <Header user={userData} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Olá, {user.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aqui está um resumo da sua atividade no Rio Porto P2P
          </p>
        </div>

        {/* KYC Alert */}
        {user.kycLevel === 'PLATFORM_ACCESS' && (
          <Card variant="gradient" gradient="warning" className="mb-8">
            <CardContent className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Complete sua verificação KYC
                </h3>
                <p className="text-white/90">
                  Desbloqueie limites maiores e acesse todos os recursos da plataforma
                </p>
              </div>
              <Link 
                href="/kyc"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors backdrop-blur-sm"
              >
                Iniciar Verificação →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="mb-8">
          <StatsGrid stats={stats} />
        </div>

        {/* Quick Actions e Portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QuickActions unreadMessages={unreadMessages} />
          <PortfolioChart 
            data={portfolioData} 
            totalValue={portfolioData.reduce((sum, item) => sum + item.value, 0)}
          />
        </div>

        {/* Recent Activity e Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <RecentActivity activities={activities} />
          </div>
          <div>
            <BarChart data={monthlyPerformance} />
          </div>
        </div>

        {/* Navigation Grid */}
        <Card variant="glass" className="animate-fadeIn">
          <CardHeader>
            <CardTitle variant="gradient" size="lg">
              Navegação Rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { href: '/trades', icon: '💱', label: 'Transações', color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
                { href: '/wallet', icon: '💰', label: 'Carteira', color: 'hover:bg-green-50 dark:hover:bg-green-900/20' },
                { href: '/kyc', icon: '🔐', label: 'Verificação', color: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
                { href: '/profile', icon: '👤', label: 'Perfil', color: 'hover:bg-amber-50 dark:hover:bg-amber-900/20' },
                { href: '/settings', icon: '⚙️', label: 'Configurações', color: 'hover:bg-gray-50 dark:hover:bg-gray-900/20' },
                { href: '/help', icon: '❓', label: 'Ajuda', color: 'hover:bg-pink-50 dark:hover:bg-pink-900/20' },
              ].map((item, index) => (
                <Link key={index} href={item.href}>
                  <div className={`
                    group p-4 rounded-lg text-center transition-all duration-200
                    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                    hover:shadow-md hover:scale-105 cursor-pointer
                    ${item.color}
                  `}>
                    <div className="text-3xl mb-2 transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                      {item.icon}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.label}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card variant="glass" className="mt-8 animate-fadeIn">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle size="lg">Dicas de Segurança</CardTitle>
              <Badge variant="success" size="sm" dot animated>
                Ativo
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Use 2FA
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ative a autenticação de dois fatores para maior segurança
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                  Verifique Reputação
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Sempre cheque a reputação antes de negociar
                </p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="text-2xl mb-2">⚠️</div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Use o Escrow
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Utilize sempre o sistema de escrow da plataforma
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}