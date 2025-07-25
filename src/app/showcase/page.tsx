"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge, BadgeGroup } from "@/components/ui/Badge";
import { Alert, ToastAlert } from "@/components/ui/Alert";

export default function ShowcasePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [cofreModalOpen, setCofreModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [moneyValue, setMoneyValue] = useState("");
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display text-text-primary mb-2">
            Rio Porto P2P - Design System Skeumórfico
          </h1>
          <p className="text-text-secondary">
            Componentes com design realista e tátil
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Botões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="gradient">Botão Primário</Button>
                <Button variant="flat">Botão Secundário</Button>
                <Button variant="danger">Botão Perigo</Button>
                <Button variant="metal">Botão Metálico</Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="gradient" size="sm">Pequeno</Button>
                <Button variant="gradient" size="md">Médio</Button>
                <Button variant="gradient" size="lg">Grande</Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="gradient" loading>Carregando...</Button>
                <Button variant="gradient" disabled>Desabilitado</Button>
                <Button
                  variant="metal"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Com Ícone
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" elevation={1}>
            <CardHeader>
              <CardTitle>Card Padrão</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card com elevação nível 1 e estilo padrão.</p>
            </CardContent>
          </Card>

          <Card variant="bancario" chip securityTexture>
            <div className="h-40 flex flex-col justify-end">
              <p className="font-money text-lg">**** **** **** 1234</p>
              <p className="text-sm opacity-80">Validade: 12/25</p>
            </div>
          </Card>

          <Card variant="metal" interactive>
            <CardHeader>
              <CardTitle>Card Metálico</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card interativo com acabamento metálico.</p>
            </CardContent>
          </Card>
        </div>

        {/* Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle>Campos de Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <Input
                label="Input Padrão"
                placeholder="Digite algo..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                hint="Texto de ajuda"
              />

              <Input
                variant="cofre"
                label="Input Cofre"
                placeholder="****"
                type="password"
              />

              <Input
                variant="money"
                label="Valor em Reais"
                placeholder="0,00"
                value={moneyValue}
                onChange={(e) => setMoneyValue(e.target.value)}
                suffix="R$"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              <Input
                label="Input com Erro"
                placeholder="Digite algo..."
                error="Este campo é obrigatório"
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <BadgeGroup>
                <Badge variant="default">Padrão</Badge>
                <Badge variant="gradient">Primário</Badge>
                <Badge variant="success">Sucesso</Badge>
                <Badge variant="warning">Aviso</Badge>
                <Badge variant="danger">Perigo</Badge>
                <Badge variant="metal">Metálico</Badge>
              </BadgeGroup>

              <BadgeGroup>
                <Badge size="sm" dot>Pequeno</Badge>
                <Badge size="md" dot animated>Médio Animado</Badge>
                <Badge size="lg" icon="🚀">Grande com Ícone</Badge>
              </BadgeGroup>

              <div>
                <h4 className="font-semibold mb-2">Níveis KYC</h4>
                <BadgeGroup>
                  <Badge kycLevel={0} />
                  <Badge kycLevel={1} />
                  <Badge kycLevel={2} />
                  <Badge kycLevel={3} />
                </BadgeGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <div className="space-y-4">
          <Alert variant="info" title="Informação" closable>
            Esta é uma mensagem informativa sobre o sistema.
          </Alert>

          <Alert variant="success" title="Sucesso!" closable>
            Sua transação foi realizada com sucesso.
          </Alert>

          <Alert variant="warning" title="Atenção" closable>
            Você precisa completar seu KYC para aumentar seus limites.
          </Alert>

          <Alert
            variant="error"
            title="Erro na Transação"
            closable
            action={
              <Button size="sm" variant="danger">
                Tentar Novamente
              </Button>
            }
          >
            Ocorreu um erro ao processar sua transação. Por favor, tente novamente.
          </Alert>
        </div>

        {/* Modal Triggers */}
        <Card>
          <CardHeader>
            <CardTitle>Modais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => setModalOpen(true)}>
                Abrir Modal Padrão
              </Button>
              <Button variant="metal" onClick={() => setCofreModalOpen(true)}>
                Abrir Modal Cofre
              </Button>
              <Button variant="flat" onClick={() => setShowToast(true)}>
                Mostrar Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Modal Padrão"
          size="md"
          footer={
            <>
              <Button variant="flat" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="gradient" onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </>
          }
        >
          <p className="text-text-secondary mb-4">
            Este é um modal padrão com design skeumórfico.
          </p>
          <Input
            label="Campo de exemplo"
            placeholder="Digite algo..."
          />
        </Modal>

        <Modal
          isOpen={cofreModalOpen}
          onClose={() => setCofreModalOpen(false)}
          title="Cofre Digital"
          size="lg"
          variant="cofre"
          footer={
            <Button
              variant="metal"
              fullWidth
              onClick={() => setCofreModalOpen(false)}
            >
              Desbloquear Cofre
            </Button>
          }
        >
          <div className="space-y-4">
            <p className="opacity-90">
              Digite sua senha para acessar o cofre digital.
            </p>
            <Input
              variant="cofre"
              placeholder="Senha do cofre"
              type="password"
            />
          </div>
        </Modal>

        {/* Toast Alert */}
        {showToast && (
          <ToastAlert
            variant="success"
            title="Operação Realizada!"
            onClose={() => setShowToast(false)}
            duration={5000}
          >
            Sua operação foi concluída com sucesso.
          </ToastAlert>
        )}
      </div>
    </div>
  );
}