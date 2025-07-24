export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Página de Teste Simples</h1>
        <p className="text-xl mb-8">Se você está vendo isso, o problema não é com rotas!</p>
        <div className="space-y-4">
          <a href="/" className="block text-blue-400 hover:text-blue-300 underline">
            Home
          </a>
          <a href="/register" className="block text-blue-400 hover:text-blue-300 underline">
            Register
          </a>
          <a href="/login" className="block text-blue-400 hover:text-blue-300 underline">
            Login
          </a>
        </div>
      </div>
    </div>
  )
}