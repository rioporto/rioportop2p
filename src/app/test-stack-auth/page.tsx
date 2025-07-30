"use client";

import { useUser, useStackApp } from "@stackframe/stack";
import { SignIn, SignUp, UserButton } from "@stackframe/stack";

export default function TestStackAuth() {
  const user = useUser();
  const app = useStackApp();

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

        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">URLs Configuradas</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify({
              signIn: "/handler/sign-in",
              signUp: "/handler/sign-up",
              afterSignIn: "/dashboard",
              afterSignUp: "/dashboard"
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}