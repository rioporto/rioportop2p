import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rio Porto P2P
          </h1>
          <p className="text-xl text-gray-600">
            Exchange de Criptomoedas Brasileiro
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Bem-vindo!
            </h2>
            <p className="text-gray-600">
              Faça login ou crie sua conta para começar
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full" size="lg">
                Fazer Login
              </Button>
            </Link>
            
            <Link href="/register" className="block">
              <Button variant="secondary" className="w-full" size="lg">
                Criar Conta
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link href="/showcase" className="block text-center">
              <Button variant="ghost" className="w-full">
                Ver Design System
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Ambiente de Desenvolvimento</p>
          <p className="mt-1">Neon PostgreSQL + Next.js 14</p>
        </div>
      </div>
    </div>
  );
}