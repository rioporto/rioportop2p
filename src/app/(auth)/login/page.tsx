import { LoginForm } from '@/components/forms/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Rio Porto P2P',
  description: 'Faça login em sua conta Rio Porto P2P',
};

interface ILoginPageProps {
  searchParams: {
    callbackUrl?: string;
  };
}

export default function LoginPage({ searchParams }: ILoginPageProps) {
  const callbackUrl = searchParams.callbackUrl || '/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Rio Porto P2P</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            Entre em sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Acesse sua carteira e comece a negociar
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <LoginForm callbackUrl={callbackUrl} />
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Seus dados estão protegidos com criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  );
}