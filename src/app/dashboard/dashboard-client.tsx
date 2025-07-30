"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const StackLogoutButton = dynamic(
  () => import('@/components/ui/StackLogoutButton').then(mod => mod.StackLogoutButton),
  { ssr: false }
);
import { 
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  KeyIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/cn';

interface DashboardClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    kycLevel: string;
    createdAt: Date;
  };
  stats: {
    activeListings: number;
    completedTrades: number;
    pendingTrades: number;
    totalVolume: string;
    reputation: number;
    unreadMessages: number;
    pixKeys: number;
  };
  recentTransactions: any[];
  recentMessages: any[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function DashboardClient({ user, stats, recentTransactions, recentMessages }: DashboardClientProps) {
  const router = useRouter();
  const [greeting, setGreeting] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const kycStatusInfo = {
    PLATFORM_ACCESS: { label: 'Acesso Básico', color: 'warning', icon: ExclamationCircleIcon },
    BASIC: { label: 'Básico', color: 'secondary', icon: ShieldCheckIcon },
    INTERMEDIATE: { label: 'Intermediário', color: 'primary', icon: ShieldCheckIcon },
    ADVANCED: { label: 'Avançado', color: 'success', icon: ShieldCheckIcon }
  };

  const kycStatus = kycStatusInfo[user.kycLevel as keyof typeof kycStatusInfo] || kycStatusInfo.PLATFORM_ACCESS;

  const quickActions = [
    {
      title: 'Comprar Crypto',
      icon: ArrowTrendingUpIcon,
      href: '/listings?type=SELL',
      color: 'from-verde-sucesso/20 to-verde-sucesso/5',
      iconColor: 'text-verde-sucesso'
    },
    {
      title: 'Vender Crypto',
      icon: ArrowTrendingDownIcon,
      href: '/listings?type=BUY',
      color: 'from-vermelho-alerta/20 to-vermelho-alerta/5',
      iconColor: 'text-vermelho-alerta'
    },
    {
      title: 'Criar Anúncio',
      icon: PlusIcon,
      href: '/listings/new',
      color: 'from-azul-bancario/20 to-azul-bancario/5',
      iconColor: 'text-azul-bancario'
    },
    {
      title: 'Minhas Chaves PIX',
      icon: KeyIcon,
      href: '/pix-keys',
      color: 'from-amarelo-ouro/20 to-amarelo-ouro/5',
      iconColor: 'text-amarelo-ouro'
    }
  ];

  const statsCards = [
    {
      title: 'Volume Total',
      value: stats.totalVolume,
      icon: CurrencyDollarIcon,
      trend: '+12.5%',
      trendUp: true,
      color: 'from-azul-bancario/10 to-transparent'
    },
    {
      title: 'Trades Completos',
      value: stats.completedTrades.toString(),
      icon: CheckCircleIcon,
      subtitle: `${stats.pendingTrades} em andamento`,
      color: 'from-verde-sucesso/10 to-transparent'
    },
    {
      title: 'Anúncios Ativos',
      value: stats.activeListings.toString(),
      icon: BanknotesIcon,
      subtitle: 'No marketplace',
      color: 'from-amarelo-ouro/10 to-transparent'
    },
    {
      title: 'Reputação',
      value: `${stats.reputation}/5.0`,
      icon: SparklesIcon,
      subtitle: '⭐'.repeat(Math.floor(stats.reputation)),
      color: 'from-roxo-profundo/10 to-transparent'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-azul-bancario to-amarelo-ouro bg-clip-text text-transparent">
                Rio Porto P2P
              </h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Beta
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-vermelho-alerta text-white text-xs rounded-full flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
              
              {/* Settings */}
              <Link href="/profile" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Link>
              
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-azul-bancario to-amarelo-ouro flex items-center justify-center text-white font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <Link 
                        href="/profile"
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Meu Perfil</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gerenciar informações e KYC</p>
                      </Link>
                      
                      <Link 
                        href="/pix-keys"
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Chaves PIX</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stats.pixKeys} chaves cadastradas</p>
                      </Link>
                      
                      <Link 
                        href="/wallet"
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Carteira</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Saldos e endereços</p>
                      </Link>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <div className="p-3">
                          <StackLogoutButton variant="ghost" className="w-full" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={item}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {greeting}, {user.firstName}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Aqui está um resumo da sua atividade na plataforma
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center gap-2">
                <Badge 
                  variant={kycStatus.color as any}
                  className="gap-1.5 px-3 py-1.5"
                >
                  <kycStatus.icon className="w-4 h-4" />
                  KYC: {kycStatus.label}
                </Badge>
                {user.kycLevel === 'PLATFORM_ACCESS' && (
                  <Button
                    size="sm"
                    variant="gradient"
                    gradient="primary"
                    onClick={() => router.push('/kyc')}
                    className="gap-1.5"
                  >
                    <ShieldCheckIcon className="w-4 h-4" />
                    Verificar Agora
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={item}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card 
                  key={index}
                  className="p-6 bg-gradient-to-br hover:shadow-lg transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${stat.color})`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      stat.color.includes('azul') && "bg-azul-bancario/10",
                      stat.color.includes('verde') && "bg-verde-sucesso/10",
                      stat.color.includes('amarelo') && "bg-amarelo-ouro/10",
                      stat.color.includes('roxo') && "bg-roxo-profundo/10"
                    )}>
                      <stat.icon className={cn(
                        "w-6 h-6",
                        stat.color.includes('azul') && "text-azul-bancario",
                        stat.color.includes('verde') && "text-verde-sucesso",
                        stat.color.includes('amarelo') && "text-amarelo-ouro",
                        stat.color.includes('roxo') && "text-roxo-profundo"
                      )} />
                    </div>
                    {stat.trend && (
                      <Badge 
                        variant={stat.trendUp ? "success" : "danger"}
                        className="text-xs"
                      >
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="group"
                >
                  <Card className={cn(
                    "p-6 text-center hover:shadow-lg transition-all duration-300",
                    "bg-gradient-to-br hover:scale-105",
                    action.color
                  )}>
                    <action.icon className={cn(
                      "w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform",
                      action.iconColor
                    )} />
                    <p className="font-medium text-gray-700 dark:text-gray-200">
                      {action.title}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <motion.div variants={item}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Transações Recentes
                  </h3>
                  <Link 
                    href="/trades"
                    className="text-sm text-azul-bancario hover:underline"
                  >
                    Ver todas →
                  </Link>
                </div>
                
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((tx) => (
                      <div 
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => router.push(`/trades/${tx.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            tx.type === 'BUY' ? "bg-verde-sucesso/10" : "bg-vermelho-alerta/10"
                          )}>
                            {tx.type === 'BUY' ? 
                              <ArrowTrendingUpIcon className="w-5 h-5 text-verde-sucesso" /> :
                              <ArrowTrendingDownIcon className="w-5 h-5 text-vermelho-alerta" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {tx.type === 'BUY' ? 'Compra' : 'Venda'} de {tx.cryptocurrency}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {tx.amount} {tx.cryptocurrency} • R$ {tx.totalPrice}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          tx.status === 'COMPLETED' ? 'success' :
                          tx.status === 'PENDING' ? 'warning' : 'secondary'
                        }>
                          {tx.statusLabel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma transação ainda
                    </p>
                    <Button
                      variant="gradient"
                      gradient="primary"
                      size="sm"
                      className="mt-4"
                      onClick={() => router.push('/listings')}
                    >
                      Explorar Marketplace
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Recent Messages */}
            <motion.div variants={item}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Mensagens Recentes
                  </h3>
                  <Link 
                    href="/messages"
                    className="text-sm text-azul-bancario hover:underline"
                  >
                    Ver todas →
                  </Link>
                </div>
                
                {recentMessages.length > 0 ? (
                  <div className="space-y-4">
                    {recentMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => router.push(`/messages/${msg.transactionId}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-azul-bancario to-amarelo-ouro flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {msg.senderInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {msg.senderName}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {msg.timeAgo}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {msg.lastMessage}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {msg.cryptocurrency} • R$ {msg.amount}
                          </p>
                        </div>
                        {msg.unread && (
                          <div className="w-2 h-2 bg-azul-bancario rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhuma mensagem ainda
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      As mensagens aparecerão aqui quando você iniciar uma negociação
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Bottom Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PIX Keys Status */}
            <motion.div variants={item}>
              <Card className="p-6 bg-gradient-to-br from-amarelo-ouro/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chaves PIX
                  </h3>
                  <KeyIcon className="w-6 h-6 text-amarelo-ouro" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Cadastradas</span>
                    <span className="font-bold text-gray-900 dark:text-white">{stats.pixKeys}</span>
                  </div>
                  {stats.pixKeys === 0 ? (
                    <Button
                      variant="gradient"
                      gradient="warning"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => router.push('/pix-keys/new')}
                    >
                      Adicionar Primeira Chave
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => router.push('/pix-keys')}
                    >
                      Gerenciar Chaves
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Help Center */}
            <motion.div variants={item}>
              <Card className="p-6 bg-gradient-to-br from-azul-bancario/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Central de Ajuda
                  </h3>
                  <QuestionMarkCircleIcon className="w-6 h-6 text-azul-bancario" />
                </div>
                <div className="space-y-3">
                  <Link href="/help/how-to-trade" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-azul-bancario">
                    Como fazer sua primeira negociação →
                  </Link>
                  <Link href="/help/security" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-azul-bancario">
                    Dicas de segurança →
                  </Link>
                  <Link href="/help/fees" className="block text-sm text-gray-600 dark:text-gray-300 hover:text-azul-bancario">
                    Taxas e limites →
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Invite Friends */}
            <motion.div variants={item}>
              <Card className="p-6 bg-gradient-to-br from-roxo-profundo/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Indique Amigos
                  </h3>
                  <UserGroupIcon className="w-6 h-6 text-roxo-profundo" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Ganhe R$ 10 para cada amigo que completar o primeiro trade
                </p>
                <Button
                  variant="gradient"
                  gradient="secondary"
                  size="sm"
                  className="w-full"
                >
                  Convidar Amigos
                </Button>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}