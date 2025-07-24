"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface CaseStudyStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  time: string;
  status: "completed" | "warning" | "success";
}

export const CustomerCaseStudy: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const steps: CaseStudyStep[] = [
    {
      id: "1",
      title: "Solicitação Inicial",
      description: "Cliente iniciou transação de R$ 50.000 para compra de BTC",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      time: "14:32",
      status: "completed"
    },
    {
      id: "2",
      title: "Verificação Aprimorada",
      description: "KYC adicional solicitado devido ao alto valor da transação",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      time: "14:35",
      status: "warning"
    },
    {
      id: "3",
      title: "Suporte Dedicado",
      description: "Especialista designado para acompanhar toda a transação",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      time: "14:40",
      status: "completed"
    },
    {
      id: "4",
      title: "Escrow Seguro",
      description: "Fundos mantidos em custódia até confirmação de ambas as partes",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      time: "14:45",
      status: "completed"
    },
    {
      id: "5",
      title: "Transação Concluída",
      description: "Cliente recebeu BTC com segurança total",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      time: "14:52",
      status: "success"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "warning":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "success":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    }
  };

  return (
    <Card
      variant="glass"
      className="p-8 bg-gray-800/50 backdrop-blur-sm border-gray-700/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-green-500/20 rounded-full">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-400 text-sm font-medium">Caso Real</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Transação de Alto Valor Protegida
          </h3>
          <p className="text-gray-400">
            Como garantimos segurança total em uma transação de R$ 50.000
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Duração Total</p>
          <p className="text-2xl font-bold text-white">20 min</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4 mb-6">
        {steps.slice(0, isExpanded ? steps.length : 3).map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connection line */}
            {index < (isExpanded ? steps.length - 1 : 2) && (
              <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-700" />
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 w-16 h-16 rounded-full border-2 flex items-center justify-center",
                getStatusColor(step.status)
              )}>
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{step.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">{step.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {!isExpanded ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          Ver mais detalhes
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      ) : (
        <>
          {/* Security Details */}
          <Card variant="flat" className="p-4 bg-gray-900/50 border-gray-700/50 mb-6">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Medidas de Segurança Aplicadas
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verificação de identidade em 3 etapas com documentos adicionais
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Confirmação via videochamada com o especialista
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Monitoramento em tempo real de todas as etapas da transação
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Liberação manual dos fundos apenas após confirmação de ambas as partes
              </li>
            </ul>
          </Card>

          {/* Customer Quote */}
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 mb-6">
            <blockquote className="text-gray-300 italic">
              "Fiquei impressionado com o nível de segurança e atenção. O especialista me acompanhou 
              durante todo o processo e me deixou totalmente tranquilo para realizar a transação."
            </blockquote>
            <cite className="text-sm text-gray-400 mt-2 block">- Cliente verificado</cite>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="w-full"
          >
            Ver menos
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </Button>
        </>
      )}
    </Card>
  );
};