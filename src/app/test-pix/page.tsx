'use client';

import { useState } from 'react';
import { PixQRCode } from '@/components/payments/PixQRCode';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Mock de trade ID para teste
const MOCK_TRADE_ID = '550e8400-e29b-41d4-a716-446655440000';

export default function TestPixPage() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const handlePaymentConfirmed = () => {
    setPaymentConfirmed(true);
    alert('Pagamento confirmado! ✅');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Teste de Pagamento PIX - Rio Porto P2P
        </h1>

        {!showQRCode ? (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Simular Compra de Bitcoin
            </h2>
            <p className="text-gray-600 mb-6">
              Clique no botão abaixo para gerar um QR Code PIX de teste
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Modo de Teste:</strong> Este é um ambiente de teste. 
                O QR Code gerado é mockado e não processará pagamentos reais.
              </p>
            </div>
            <Button
              onClick={() => setShowQRCode(true)}
              variant="gradient"
              size="lg"
            >
              Gerar QR Code PIX (R$ 100,00)
            </Button>
          </Card>
        ) : (
          <div>
            {paymentConfirmed ? (
              <Card className="p-8 text-center">
                <div className="text-green-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Pagamento Confirmado!
                </h3>
                <p className="text-gray-600 mb-6">
                  O vendedor foi notificado e liberará o Bitcoin em breve.
                </p>
                <Button
                  onClick={() => {
                    setShowQRCode(false);
                    setPaymentConfirmed(false);
                  }}
                  variant="elevated"
                >
                  Fazer Novo Teste
                </Button>
              </Card>
            ) : (
              <PixQRCode
                tradeId={MOCK_TRADE_ID}
                amount={100}
                onPaymentConfirmed={handlePaymentConfirmed}
              />
            )}
          </div>
        )}

        {/* Instruções de teste */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Como testar a integração:
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>1. Obter credenciais:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Acesse https://www.mercadopago.com.br/developers/panel/app</li>
                  <li>• Crie uma aplicação ou use existente</li>
                  <li>• Copie o Access Token de Produção</li>
                </ul>
              </li>
              <li>
                <strong>2. Configurar variáveis:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Adicione MERCADO_PAGO_ACCESS_TOKEN no .env</li>
                  <li>• Adicione também no Railway</li>
                </ul>
              </li>
              <li>
                <strong>3. Webhook (opcional):</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Configure a URL: https://rioporto.com.br/api/webhooks/mercadopago</li>
                  <li>• Eventos: payment.updated</li>
                </ul>
              </li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Sem as credenciais, o sistema funciona em modo MOCK,
                gerando QR Codes falsos para teste de interface.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}