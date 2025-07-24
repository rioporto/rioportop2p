"use client";

import React, { useState } from "react";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Stats } from "./Stats";
import { CryptoList } from "./CryptoList";
import { PrimaryCTA, UrgentCTA, ValueCTA } from "./CTAButton";
import { FloatingCTA, MiniFloatingCTA } from "./FloatingCTA";
import { ExitIntentPopup } from "./ExitIntentPopup";
import { MultiStepRegistration } from "./MultiStepRegistration";
import { ScrollToTop } from "./ScrollToTop";
import { TrustSignals, TrustBadge, SecurityFeatures, LiveUserCounter } from "./TrustSignals";
import { ConversionAnalytics, HeatmapTracking, useABTest } from "./ConversionAnalytics";
import { cn } from "@/lib/utils/cn";

export const LandingPageDemo: React.FC = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // A/B test for hero CTA text
  const { variant: ctaVariant, trackInteraction, trackConversion } = useABTest(
    "hero_cta_text",
    ["EU QUERO", "COMEÇAR AGORA", "CRIAR CONTA GRÁTIS"]
  );

  const handleCTAClick = () => {
    trackInteraction("click");
    setShowRegistration(true);
    
    // Smooth scroll to registration
    setTimeout(() => {
      const element = document.getElementById("registration-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleRegistrationComplete = (data: any) => {
    console.log("Registration complete:", data);
    setRegistrationComplete(true);
    trackConversion(1);
    
    // Here you would typically send the data to your backend
  };

  return (
    <>
      {/* Analytics Setup */}
      <ConversionAnalytics
        measurementId={process.env.NEXT_PUBLIC_GA_ID}
        debug={process.env.NODE_ENV === "development"}
      />
      <HeatmapTracking />

      {/* Exit Intent Popup */}
      <ExitIntentPopup
        onCTAClick={handleCTAClick}
        headline="Espere! Que tal um curso P2P gratuito?"
        description="Aprenda a negociar criptomoedas com segurança e comece com até R$ 50.000 de limite!"
        showCountdown
        showOnMobile
      />

      {/* Floating CTA for Mobile */}
      <FloatingCTA
        ctaText="QUERO COMEÇAR"
        onCTAClick={handleCTAClick}
        showAfterScroll={500}
        position="bottom"
        showCountdown
        countdownDuration={300}
      />

      {/* Mini Floating CTA Alternative */}
      <MiniFloatingCTA onClick={handleCTAClick} />

      {/* Scroll to Top/Registration */}
      <ScrollToTop targetId="registration-section" showAfterScroll={400} />

      {/* Main Landing Page Content */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section with Optimized CTAs */}
        <section className="relative">
          <Hero />
          
          {/* Overlay optimized CTAs */}
          <div className="absolute bottom-20 left-0 right-0 z-20">
            <div className="container-premium">
              <div className="flex flex-col items-center gap-6">
                {/* Live user counter */}
                <LiveUserCounter baseCount={1532} />
                
                {/* Primary CTA with A/B testing */}
                <PrimaryCTA
                  text={ctaVariant}
                  onClick={handleCTAClick}
                  showTrustSignals
                  enableABTest
                  alternativeText="COMEÇAR AGORA"
                  showUrgency
                  urgencyMessage="Vagas limitadas hoje!"
                />
                
                {/* Trust signals */}
                <TrustSignals variant="horizontal" size="sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Value Props */}
        <section className="py-20">
          <div className="container-premium">
            <div className="text-center mb-12">
              <TrustBadge className="mb-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Por que escolher o Rio Porto?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                A plataforma mais segura do Brasil para negociar criptomoedas P2P
              </p>
            </div>
            
            <Features />
            
            {/* Security features showcase */}
            <div className="mt-16">
              <SecurityFeatures />
            </div>
            
            {/* CTA after features */}
            <div className="mt-12 text-center">
              <UrgentCTA
                onClick={handleCTAClick}
                urgencyMessage="Oferta por tempo limitado!"
              />
            </div>
          </div>
        </section>

        {/* Stats Section with Social Proof */}
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="container-premium">
            <Stats />
            
            {/* Value CTA for free course */}
            <div className="mt-12 text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ganhe um curso P2P completo
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cadastre-se agora e receba acesso gratuito ao nosso curso de R$ 497
                </p>
              </div>
              <ValueCTA onClick={handleCTAClick} />
            </div>
          </div>
        </section>

        {/* Crypto List Section */}
        <section className="py-20">
          <div className="container-premium">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                +50 Criptomoedas Disponíveis
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Negocie as principais moedas com os melhores preços
              </p>
            </div>
            
            <CryptoList />
          </div>
        </section>

        {/* Registration Section */}
        <section id="registration-section" className="py-20 bg-gray-100 dark:bg-gray-800">
          <div className="container-premium">
            {!registrationComplete ? (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {showRegistration ? "Complete seu cadastro" : "Comece agora mesmo"}
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    {showRegistration 
                      ? "Falta pouco para você começar a negociar com segurança"
                      : "Cadastre-se em menos de 2 minutos e comece a negociar"
                    }
                  </p>
                </div>

                {showRegistration ? (
                  <MultiStepRegistration onComplete={handleRegistrationComplete} />
                ) : (
                  <div className="max-w-md mx-auto text-center">
                    <PrimaryCTA
                      text="CRIAR MINHA CONTA"
                      onClick={() => setShowRegistration(true)}
                      size="xl"
                      showTrustSignals
                      fullWidthMobile
                    />
                    
                    <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                      Ao se cadastrar, você concorda com nossos{" "}
                      <a href="/terms" className="text-primary-600 hover:underline">
                        termos de uso
                      </a>{" "}
                      e{" "}
                      <a href="/privacy" className="text-primary-600 hover:underline">
                        política de privacidade
                      </a>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8">
                  <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Parabéns! Sua conta foi criada
                  </h3>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Enviamos um email de confirmação. Verifique sua caixa de entrada para ativar sua conta.
                  </p>
                  
                  <div className="space-y-4">
                    <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                      Ir para o Dashboard
                    </button>
                    
                    <button className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                      Verificar Email Depois
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Final CTA Section */}
        {!showRegistration && !registrationComplete && (
          <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
            <div className="container-premium text-center">
              <h2 className="text-4xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Junte-se a mais de 100.000 usuários que já negociam com segurança
              </p>
              
              <PrimaryCTA
                onClick={handleCTAClick}
                className="!bg-white !text-primary-600 hover:!bg-gray-100"
                showTrustSignals={false}
              />
              
              <div className="mt-8">
                <TrustSignals
                  variant="horizontal"
                  className="justify-center !text-white/80"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};