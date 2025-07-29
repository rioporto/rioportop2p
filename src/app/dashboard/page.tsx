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
  });

  if (!user) {
    redirect('/login');
  }

  const userName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Simples */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Rio Porto P2P</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{userName}</span>
              <Link href="/api/auth/signout" className="text-red-600 hover:text-red-700">
                Sair
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {userName}! 👋
          </h2>
          <p className="text-gray-600">
            Bem-vindo ao Rio Porto P2P
          </p>
        </div>

        {/* Status do Usuário */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Seu Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-green-600">{user.emailVerified ? '✓ Verificado' : '⚠️ Não verificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nível KYC</p>
              <p className="font-medium">{user.kycLevel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Membro desde</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* KYC Alert */}
        {user.kycLevel === 'PLATFORM_ACCESS' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Complete sua verificação KYC
            </h3>
            <p className="text-yellow-700 mb-4">
              Desbloqueie limites maiores e acesse todos os recursos da plataforma
            </p>
            <Link 
              href="/kyc"
              className="inline-block px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Iniciar Verificação →
            </Link>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Menu Rápido</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/listings" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-3xl mb-2">💱</div>
              <p className="font-medium">Marketplace</p>
            </Link>
            <Link href="/listings/new" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-3xl mb-2">➕</div>
              <p className="font-medium">Criar Anúncio</p>
            </Link>
            <Link href="/trades" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="font-medium">Minhas Transações</p>
            </Link>
            <Link href="/wallet" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="font-medium">Carteira</p>
            </Link>
            <Link href="/profile" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-3xl mb-2">👤</div>
              <p className="font-medium">Perfil</p>
            </Link>
            <Link href="/kyc" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <div className="text-3xl mb-2">🔐</div>
              <p className="font-medium">KYC</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}