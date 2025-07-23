import { RegisterForm } from '@/components/forms/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criar Conta - Rio Porto P2P',
  description: 'Crie sua conta na Rio Porto P2P Exchange',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Rio Porto P2P</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Junte-se à maior exchange P2P do Brasil
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <RegisterForm />
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Seguro</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Rápido</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600">Confiável</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos termos e condições
          </p>
        </div>
      </div>
    </div>
  );
}