'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifySimplePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Pegar email da URL manualmente
  const email = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('email') 
    : null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        setError(result.error || 'Código inválido');
        return;
      }
      
      alert('Email verificado com sucesso!');
      router.push('/login?verified=true');
      
    } catch (err) {
      setError('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Verificar Email</h1>
        
        {email && (
          <p className="text-center text-gray-600 mb-6">
            Código enviado para: <strong>{email}</strong>
          </p>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            maxLength={6}
            className="w-full text-center text-2xl font-mono tracking-widest border rounded-lg p-4 mb-4"
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          <a href="/login" className="hover:underline">
            Voltar ao login
          </a>
        </p>
      </div>
    </div>
  );
}