"use client";

export default function TestStackAuth() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Teste Stack Auth</h1>
        
        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Status</h2>
          <p>Stack Auth temporariamente desabilitado para debug.</p>
          <p className="text-sm text-muted-foreground">
            Aguardando correção do erro de build.
          </p>
        </div>

        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Variáveis de Ambiente</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify({
              projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID ? "✅ Configurado" : "❌ Faltando",
              publishableKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ? "✅ Configurado" : "❌ Faltando",
              serverKey: process.env.STACK_SECRET_SERVER_KEY ? "✅ Configurado" : "❌ Faltando"
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}