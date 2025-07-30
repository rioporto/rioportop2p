"use client";

import { useStackAuth } from '@/hooks/useStackAuth';

export default function TestStackSimple() {
  const { user, loading, error } = useStackAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Teste Stack Auth (Versão Simples)</h1>
        
        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Status</h2>
          
          {loading && <p>Carregando...</p>}
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
              Erro: {error}
            </div>
          )}
          
          {!loading && !error && (
            <div className="space-y-2">
              <p>Usuário logado: {user ? "Sim" : "Não"}</p>
              {user && (
                <>
                  <p>ID: {user.id}</p>
                  <p>Email: {user.primaryEmail || "Não definido"}</p>
                  <p>Nome: {user.displayName || "Não definido"}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Informações de Debug</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify({
              nodeEnv: process.env.NODE_ENV,
              hasStackProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
              hasStackPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
              isClient: typeof window !== 'undefined',
              userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
            }, null, 2)}
          </pre>
        </div>

        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Alternativa: Use NextAuth</h2>
          <p className="text-muted-foreground">
            Por enquanto, o sistema ainda usa NextAuth.js para autenticação.
            Stack Auth está em processo de migração.
          </p>
          <div className="space-x-4">
            <a 
              href="/login" 
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login (NextAuth)
            </a>
            <a 
              href="/register" 
              className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Registro (NextAuth)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}