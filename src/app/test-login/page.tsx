'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function TestLogin() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testando login...');
    
    try {
      const response = await fetch('/api/test-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'basico@rioporto.com',
          password: 'senha123'
        })
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Erro: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Teste de Login</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <p className="mb-4">Credenciais de teste:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
            <li>basico@rioporto.com / senha123</li>
            <li>intermediario@rioporto.com / senha123</li>
            <li>avancado@rioporto.com / senha123</li>
          </ul>
          
          <Button 
            onClick={testLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testando...' : 'Testar Login'}
          </Button>
        </div>
        
        {result && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
            <pre className="text-xs overflow-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}