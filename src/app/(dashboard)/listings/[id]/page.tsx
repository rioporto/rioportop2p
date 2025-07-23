import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KYCLevel } from '@/types/kyc';

interface PageProps {
  params: {
    id: string;
  };
}

async function getListingDetails(id: string) {
  const listing = await prisma.listing.findUnique({
    where: {
      id: id,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          kycLevel: true,
        },
      },
      paymentMethods: {
        include: {
          paymentMethod: true,
        },
      },
    },
  });

  if (!listing) {
    return null;
  }

  return {
    id: listing.id,
    userId: listing.userId,
    type: listing.type,
    cryptocurrency: listing.cryptocurrency,
    fiatCurrency: listing.fiatCurrency,
    pricePerUnit: listing.pricePerUnit.toNumber(),
    minAmount: listing.minAmount.toNumber(),
    maxAmount: listing.maxAmount.toNumber(),
    terms: listing.terms,
    isActive: listing.isActive,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
    user: {
      id: listing.user.id,
      name: `${listing.user.firstName} ${listing.user.lastName}`,
      email: listing.user.email,
      kycLevel: listing.user.kycLevel as KYCLevel,
    },
    paymentMethods: listing.paymentMethods.map((pm) => pm.paymentMethod),
  };
}

function getKYCBadge(level: KYCLevel) {
  const badges = {
    [KYCLevel.BASIC]: { text: 'KYC Básico', className: 'bg-gray-100 text-gray-700' },
    [KYCLevel.INTERMEDIARY]: { text: 'KYC Intermediário', className: 'bg-blue-100 text-blue-700' },
    [KYCLevel.ADVANCED]: { text: 'KYC Avançado', className: 'bg-green-100 text-green-700' }
  };
  return badges[level] || badges[KYCLevel.BASIC];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export default async function ListingDetailsPage({ params }: PageProps) {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const listing = await getListingDetails(params.id);

  if (!listing) {
    notFound();
  }

  const isOwner = listing.userId === session.user.id;
  const kycBadge = getKYCBadge(listing.user.kycLevel);

  // Mock de reputação
  const mockReputation = {
    totalTrades: 42,
    successRate: 98.5,
    avgResponseTime: '< 5 min',
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-primary hover:text-opacity-80 transition-colors">
              Dashboard
            </Link>
          </li>
          <li className="text-text-secondary">
            <span className="mx-2">/</span>
            <Link href="/listings" className="text-primary hover:text-opacity-80 transition-colors">
              Anúncios
            </Link>
          </li>
          <li className="text-text-secondary">
            <span className="mx-2">/</span>
            Detalhes
          </li>
        </ol>
      </nav>

      {/* Header com ações */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">
              {listing.type === 'BUY' ? 'Compra' : 'Venda'} de {listing.cryptocurrency}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              listing.type === 'BUY' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {listing.type === 'BUY' ? 'Compra' : 'Venda'}
            </span>
            {!listing.isActive && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                Inativo
              </span>
            )}
          </div>
          <p className="text-text-secondary">
            Criado em {new Date(listing.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="flex gap-4">
          {isOwner ? (
            <>
              <Button
                variant="secondary"
                onClick={() => window.location.href = `/listings/${listing.id}/edit`}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Implementar lógica de desativar
                  console.log('Desativar anúncio');
                }}
              >
                {listing.isActive ? 'Desativar' : 'Ativar'}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                // Implementar lógica de negociação
                console.log('Iniciar negociação');
              }}
            >
              Negociar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detalhes do Anúncio */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações de Preço */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Preço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-1">Preço por unidade</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(listing.pricePerUnit)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Limite mínimo</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formatCurrency(listing.minAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Limite máximo</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {formatCurrency(listing.maxAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento Aceitos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {listing.paymentMethods.map((method) => (
                  <span
                    key={method.id}
                    className="px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-lg font-medium"
                  >
                    {method.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Termos do Anúncio */}
          {listing.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Termos do Anúncio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary whitespace-pre-wrap">
                  {listing.terms}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Card do Vendedor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {listing.type === 'BUY' ? 'Comprador' : 'Vendedor'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome e KYC */}
              <div>
                <p className="text-lg font-semibold text-text-primary mb-2">
                  {listing.user.name}
                </p>
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${kycBadge.className}`}>
                  {kycBadge.text}
                </span>
              </div>

              {/* Estatísticas de Reputação */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Total de negociações</span>
                  <span className="font-semibold text-text-primary">
                    {mockReputation.totalTrades}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Taxa de sucesso</span>
                  <span className="font-semibold text-green-600">
                    {mockReputation.successRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Tempo de resposta</span>
                  <span className="font-semibold text-text-primary">
                    {mockReputation.avgResponseTime}
                  </span>
                </div>
              </div>

              {/* Ações */}
              {!isOwner && (
                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Implementar visualização de perfil
                      console.log('Ver perfil completo');
                    }}
                  >
                    Ver Perfil Completo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary">Criptomoeda</p>
                <p className="font-semibold text-text-primary">{listing.cryptocurrency}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Moeda Fiat</p>
                <p className="font-semibold text-text-primary">{listing.fiatCurrency}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Última atualização</p>
                <p className="font-semibold text-text-primary">
                  {new Date(listing.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}