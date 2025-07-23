import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KYCBadge } from '@/components/ui/KYCBadge';
import { LogoutButton } from '@/components/ui/LogoutButton';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Rio Porto P2P</h1>
              <KYCBadge level={session.user.kycLevel || 'PLATFORM_ACCESS'} />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Saldo */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Saldo Total</h2>
            <p className="text-3xl font-bold text-green-600">R$ 0,00</p>
            <p className="text-sm text-gray-500 mt-1">Disponível para trading</p>
          </Card>

          {/* Status KYC */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Status KYC</h2>
            <div className="space-y-2">
              <KYCBadge level={session.user.kycLevel || 'PLATFORM_ACCESS'} size="lg" />
              <p className="text-sm text-gray-600">
                {session.user.kycLevel === 'ADVANCED' 
                  ? 'Verificação completa'
                  : 'Complete sua verificação para aumentar seus limites'}
              </p>
            </div>
          </Card>

          {/* Ações Rápidas */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                Comprar Crypto
              </Button>
              <Button variant="secondary" className="w-full" size="sm">
                Vender Crypto
              </Button>
            </div>
          </Card>
        </div>

        {/* Menu de Navegação */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <a href="/trading" className="group">
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Trading</h3>
            </Card>
          </a>

          <a href="/wallet" className="group">
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Carteira</h3>
            </Card>
          </a>

          <a href="/history" className="group">
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-2">📜</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Histórico</h3>
            </Card>
          </a>

          <a href="/kyc" className="group">
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">KYC</h3>
            </Card>
          </a>

          <a href="/profile" className="group">
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-2">👤</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Perfil</h3>
            </Card>
          </a>

          <a href="/help" className="group">
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-2">❓</div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Ajuda</h3>
            </Card>
          </a>
        </div>

        {/* Avisos */}
        {session.user.kycLevel === 'PLATFORM_ACCESS' && (
          <Card className="mt-8 p-6 bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Complete seu cadastro
            </h3>
            <p className="text-yellow-700 mb-4">
              Para começar a negociar, você precisa completar a verificação KYC básica.
            </p>
            <Button variant="primary" size="sm">
              Iniciar Verificação
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}