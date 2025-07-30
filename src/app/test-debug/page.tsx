'use client';

import { useState } from 'react';

export default function TestDebugPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const testData = {
    name: "João Silva",
    email: "cetewov199@ikanteri.com",
    whatsapp: "(11) 99999-9999",
    password: "Senha123!",
    acceptTerms: true,
    newsletter: false
  };
  
  const runTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-specific-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      setResult({
        status: response.status,
        data: data
      });
    } catch (error) {
      setResult({
        error: 'Erro ao executar teste',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };
  
  const testRegister = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/register-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: data
      });
    } catch (error) {
      setResult({
        error: 'Erro ao testar registro',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Registro</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Dados de Teste:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Criação Específica'}
          </button>
          
          <button
            onClick={testRegister}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Registro Completo'}
          </button>
        </div>
        
        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Resultado:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}