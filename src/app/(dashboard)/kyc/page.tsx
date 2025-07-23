import { requireAuth } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { KYCLevel, KYC_LIMITS } from '@/types/auth';

export default async function KYCPage() {
  const user = await requireAuth().catch(() => {
    redirect('/login');
  });

  if (!user) {
    redirect('/login');
  }

  const currentLevel = user.kycLevel;
  const currentLimits = KYC_LIMITS[currentLevel];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Verificação KYC</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Seu nível atual</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg font-medium text-blue-900">Nível {currentLevel}</p>
              <p className="text-sm text-blue-700 mt-2">
                Limite mensal: R$ {currentLimits.monthlyLimit.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm text-blue-700">
                Limite por transação: R$ {currentLimits.transactionLimit.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Níveis de verificação</h2>
            
            {/* Level 0 */}
            <div className={`border rounded-lg p-6 ${currentLevel >= 0 ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nível 0 - Acesso à Plataforma</h3>
                  <p className="text-sm text-gray-600 mt-1">Email verificado + Nome completo</p>
                  <p className="text-sm text-gray-500 mt-2">Permite visualizar mercado e criar conta</p>
                </div>
                {currentLevel >= 0 && (
                  <span className="text-green-600 font-medium">✓ Completo</span>
                )}
              </div>
            </div>

            {/* Level 1 */}
            <div className={`border rounded-lg p-6 ${currentLevel >= 1 ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nível 1 - KYC Básico</h3>
                  <p className="text-sm text-gray-600 mt-1">+ CPF verificado</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Limite: R$ 5.000/mês | Habilita: Trading P2P, Depósito PIX
                  </p>
                </div>
                {currentLevel >= 1 ? (
                  <span className="text-green-600 font-medium">✓ Completo</span>
                ) : currentLevel === 0 ? (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Verificar
                  </button>
                ) : null}
              </div>
            </div>

            {/* Level 2 */}
            <div className={`border rounded-lg p-6 ${currentLevel >= 2 ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nível 2 - KYC Intermediário</h3>
                  <p className="text-sm text-gray-600 mt-1">+ Documento com foto + Comprovante de endereço</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Limite: R$ 30.000/mês | Habilita: Transferência bancária
                  </p>
                </div>
                {currentLevel >= 2 ? (
                  <span className="text-green-600 font-medium">✓ Completo</span>
                ) : currentLevel === 1 ? (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Verificar
                  </button>
                ) : null}
              </div>
            </div>

            {/* Level 3 */}
            <div className={`border rounded-lg p-6 ${currentLevel >= 3 ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Nível 3 - KYC Avançado</h3>
                  <p className="text-sm text-gray-600 mt-1">+ Selfie com documento + Verificação facial</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Limite: R$ 50.000/mês | Habilita: Saque de criptomoedas
                  </p>
                </div>
                {currentLevel >= 3 ? (
                  <span className="text-green-600 font-medium">✓ Completo</span>
                ) : currentLevel === 2 ? (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Verificar
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Voltar ao Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}