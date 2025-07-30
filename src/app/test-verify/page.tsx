'use client';

import { useRouter } from 'next/navigation';

export default function TestVerifyPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Teste de Redirecionamento para Verificação</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/verify?email=teste@exemplo.com')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
          >
            Testar Redirecionamento para /verify
          </button>
          
          <button
            onClick={() => window.location.href = '/verify?email=teste@exemplo.com'}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700"
          >
            Testar com window.location
          </button>
          
          <a
            href="/verify?email=teste@exemplo.com"
            className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 text-center"
          >
            Testar com Link Direto
          </a>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            Se a página de verificação estiver em branco, pode ser um problema de:
          </p>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
            <li>Erro no carregamento do JavaScript</li>
            <li>Problema com Suspense/Loading</li>
            <li>Erro no searchParams</li>
          </ul>
        </div>
      </div>
    </div>
  );
}