"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Importações dinâmicas para componentes Stack Auth
const SignIn = dynamic(
  () => import('@stackframe/stack').then(mod => mod.SignIn),
  { 
    ssr: false,
    loading: () => <div>Carregando login...</div>
  }
);

const SignUp = dynamic(
  () => import('@stackframe/stack').then(mod => mod.SignUp),
  { 
    ssr: false,
    loading: () => <div>Carregando registro...</div>
  }
);

const UserButton = dynamic(
  () => import('@stackframe/stack').then(mod => mod.UserButton),
  { 
    ssr: false,
    loading: () => <div>...</div>
  }
);

// Hook para usar o user (também dinâmico)
let useUser: any = () => null;
if (typeof window !== 'undefined') {
  import('@stackframe/stack').then(mod => {
    useUser = mod.useUser;
  });
}

export default function TestStackAuth() {
  const [mounted, setMounted] = useState(false);
  const user = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">Carregando Stack Auth...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Teste Stack Auth</h1>
        
        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Status da Autenticação</h2>
          <div className="space-y-2">
            <p>Usuário logado: {user ? "Sim" : "Não"}</p>
            {user && (
              <>
                <p>ID: {user.id}</p>
                <p>Email: {user.primaryEmail}</p>
                <p>Nome: {user.displayName || "Não definido"}</p>
              </>
            )}
          </div>
        </div>

        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Componentes Stack Auth</h2>
          
          {!user ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Login</h3>
                <SignIn />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Registro</h3>
                <SignUp />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Você está logado!</p>
              <UserButton />
              <button
                onClick={() => user.signOut()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}