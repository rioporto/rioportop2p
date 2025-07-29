'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

export default function TestPixPage() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeText: string;
    amount: number;
    expiresAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateTestPix = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/test-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100 })
      });

      const data = await response.json();
      console.log('Test PIX response:', data);

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Erro ao gerar PIX de teste');
      }

      if (!data.data?.pixTransaction) {
        throw new Error('Resposta inválida do servidor');
      }

      const pixTransaction = data.data.pixTransaction;
      console.log('PIX Transaction:', {
        hasQrCode: !!pixTransaction.qrCode,
        qrCodeLength: pixTransaction.qrCode?.length,
        qrCodePreview: pixTransaction.qrCode?.substring(0, 50) + '...',
        isReal: pixTransaction.isReal
      });

      setPixData(pixTransaction);
      setShowQRCode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!pixData?.qrCodeText) return;

    try {
      await navigator.clipboard.writeText(pixData.qrCodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const handlePaymentConfirmed = () => {
    setPaymentConfirmed(true);
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
                O QR Code gerado é para teste e não processará pagamentos reais.
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <Button
              onClick={generateTestPix}
              variant="gradient"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Gerando...' : 'Gerar QR Code PIX (R$ 100,00)'}
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
                    setPixData(null);
                  }}
                  variant="elevated"
                >
                  Fazer Novo Teste
                </Button>
              </Card>
            ) : pixData ? (
              <Card className="p-8">
                <div className="flex flex-col items-center gap-6">
                  {/* Valor */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Valor a pagar</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(pixData.amount)}
                    </p>
                    {pixData.isReal !== undefined && (
                      <p className={`text-xs mt-2 ${pixData.isReal ? 'text-green-600' : 'text-yellow-600'}`}>
                        {pixData.isReal ? '✅ PIX Real (Mercado Pago)' : '⚠️ Modo Mock'}
                      </p>
                    )}
                    {pixData.mockReason && (
                      <p className="text-xs text-gray-500 mt-1">
                        Motivo: {pixData.mockReason}
                      </p>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="relative">
                    <img
                      src={
                        pixData.qrCode.startsWith('data:image')
                          ? pixData.qrCode
                          : `data:image/png;base64,${pixData.qrCode}`
                      }
                      alt="QR Code PIX"
                      className="w-64 h-64 rounded-lg bg-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center';
                        fallback.innerHTML = '<p class="text-gray-500 text-center p-4">QR Code não pôde ser carregado</p>';
                        target.parentElement?.appendChild(fallback);
                      }}
                    />
                  </div>

                  {/* PIX Copia e Cola */}
                  <div className="w-full max-w-md">
                    <p className="text-sm text-gray-600 mb-2 text-center">PIX Copia e Cola</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pixData.qrCodeText}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-900"
                      />
                      <Button
                        onClick={copyToClipboard}
                        variant="elevated"
                        size="sm"
                        className="shrink-0"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Tempo de expiração */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Expira em 30 minutos</span>
                  </div>

                  {/* Instruções */}
                  <div className="bg-blue-50 rounded-lg p-4 w-full max-w-md">
                    <h4 className="font-semibold text-blue-900 mb-2">Como pagar:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Abra o app do seu banco</li>
                      <li>2. Escolha pagar com PIX</li>
                      <li>3. Escaneie o QR Code ou use o código copia e cola</li>
                      <li>4. Confirme o pagamento</li>
                    </ol>
                  </div>

                  {/* Simulação de confirmação */}
                  <Button
                    onClick={handlePaymentConfirmed}
                    variant="gradient"
                    className="mt-4"
                  >
                    Simular Pagamento Confirmado
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        )}

        {/* Instruções de configuração */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Como configurar Mercado Pago:
            </h3>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <ol className="space-y-1 text-gray-600 text-sm">
                <li>1. Acesse https://www.mercadopago.com.br/developers/panel/app</li>
                <li>2. Crie uma aplicação com nome "rioporto2p-api"</li>
                <li>3. Selecione "Pagamentos on-line" e "Não" para e-commerce</li>
                <li>4. Copie o Access Token de Produção</li>
                <li>5. Adicione no Railway: MERCADO_PAGO_ACCESS_TOKEN</li>
              </ol>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Nota:</strong> Após configurar as credenciais no Railway,
                o sistema gerará QR Codes PIX reais do Mercado Pago.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}