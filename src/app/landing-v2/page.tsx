'use client'

import React from 'react'
import { HeroSection } from '@/components/landing/HeroSection'
import { BenefitsSection } from '@/components/landing/BenefitsSection'
import { SocialProofSection } from '@/components/landing/SocialProofSection'
import { FloatingCTA } from '@/components/landing/FloatingCTA'
import { ExitIntentPopup } from '@/components/landing/ExitIntentPopup'
import { ConversionAnalytics } from '@/components/analytics/ConversionAnalytics'
import { useRouter } from 'next/navigation'
import { styled } from 'styled-components'

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--color-background);
`

const HowItWorksSection = styled.section`
  padding: var(--spacing-16) var(--spacing-4);
  background: var(--color-surface);
  
  @media (min-width: 768px) {
    padding: var(--spacing-24) var(--spacing-8);
  }
`

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-12);
`

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
`

const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
`

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-8);
  margin-top: var(--spacing-8);
`

const StepCard = styled.div`
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
  text-align: center;
  position: relative;
  
  &::before {
    content: attr(data-step);
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.25rem;
  }
`

const StepTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: var(--spacing-4) 0;
`

const StepDescription = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
`

const SecuritySection = styled.section`
  padding: var(--spacing-16) var(--spacing-4);
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  color: white;
  
  @media (min-width: 768px) {
    padding: var(--spacing-24) var(--spacing-8);
  }
`

const SecurityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
  margin-top: var(--spacing-8);
`

const SecurityItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  
  svg {
    font-size: 1.5rem;
    flex-shrink: 0;
  }
`

const FAQSection = styled.section`
  padding: var(--spacing-16) var(--spacing-4);
  background: var(--color-surface);
  
  @media (min-width: 768px) {
    padding: var(--spacing-24) var(--spacing-8);
  }
`

const FAQGrid = styled.div`
  display: grid;
  gap: var(--spacing-4);
  margin-top: var(--spacing-8);
`

const FAQItem = styled.details`
  background: var(--color-background);
  border-radius: var(--radius-md);
  padding: var(--spacing-6);
  cursor: pointer;
  
  summary {
    font-weight: 600;
    color: var(--color-text-primary);
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &::after {
      content: '+';
      font-size: 1.5rem;
      color: var(--color-primary);
      transition: transform 0.3s ease;
    }
  }
  
  &[open] summary::after {
    transform: rotate(45deg);
  }
  
  p {
    margin-top: var(--spacing-4);
    color: var(--color-text-secondary);
    line-height: 1.6;
  }
`

const FinalCTASection = styled.section`
  padding: var(--spacing-16) var(--spacing-4);
  background: var(--color-background);
  text-align: center;
  
  @media (min-width: 768px) {
    padding: var(--spacing-24) var(--spacing-8);
  }
`

const CTAButton = styled.button`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  padding: var(--spacing-4) var(--spacing-8);
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: var(--spacing-6);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`

export default function LandingPageV2() {
  const router = useRouter()
  
  const handleCTAClick = () => {
    router.push('/register')
  }

  return (
    <PageContainer>
      <ConversionAnalytics />
      
      <HeroSection
        onCtaClick={handleCTAClick}
        backgroundVariant="animated"
      />
      
      <HowItWorksSection id="how-it-works">
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Como Funciona</SectionTitle>
            <SectionSubtitle>
              Três passos simples para começar sua jornada no P2P com segurança
            </SectionSubtitle>
          </SectionHeader>
          
          <StepsGrid>
            <StepCard data-step="1">
              <StepTitle>Aprenda em 30 minutos</StepTitle>
              <StepDescription>
                Acesse nosso treinamento gratuito e domine os conceitos essenciais do P2P. 
                Material didático criado especialmente para iniciantes.
              </StepDescription>
            </StepCard>
            
            <StepCard data-step="2">
              <StepTitle>Configure com nosso suporte</StepTitle>
              <StepDescription>
                Nossa equipe te ajuda a configurar sua carteira e fazer as primeiras operações. 
                Suporte personalizado via WhatsApp.
              </StepDescription>
            </StepCard>
            
            <StepCard data-step="3">
              <StepTitle>Opere com confiança</StepTitle>
              <StepDescription>
                Compre e venda Bitcoin com segurança. Você no controle total dos seus fundos, 
                com nossa comunidade sempre disponível.
              </StepDescription>
            </StepCard>
          </StepsGrid>
        </SectionContainer>
      </HowItWorksSection>
      
      <BenefitsSection />
      
      <SecuritySection>
        <SectionContainer>
          <SectionHeader>
            <SectionTitle style={{ color: 'white' }}>Segurança e Conformidade</SectionTitle>
            <SectionSubtitle style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Opere com tranquilidade em uma plataforma 100% regulamentada
            </SectionSubtitle>
          </SectionHeader>
          
          <SecurityGrid>
            <SecurityItem>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Conformidade com legislação brasileira</span>
            </SecurityItem>
            <SecurityItem>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Relatórios automáticos para Imposto de Renda</span>
            </SecurityItem>
            <SecurityItem>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Sistema anti-fraude com IA</span>
            </SecurityItem>
            <SecurityItem>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Verificação KYC em níveis</span>
            </SecurityItem>
            <SecurityItem>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Custódia 100% do usuário</span>
            </SecurityItem>
            <SecurityItem>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Transparência total nas operações</span>
            </SecurityItem>
          </SecurityGrid>
        </SectionContainer>
      </SecuritySection>
      
      <SocialProofSection />
      
      <FAQSection>
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Perguntas Frequentes</SectionTitle>
            <SectionSubtitle>
              Tire suas dúvidas sobre P2P e nossa plataforma
            </SectionSubtitle>
          </SectionHeader>
          
          <FAQGrid>
            <FAQItem>
              <summary>Preciso ter experiência para começar?</summary>
              <p>
                Não! Nossa plataforma foi criada pensando em iniciantes. 
                Com nosso treinamento gratuito e suporte personalizado, 
                você aprende tudo do zero em menos de 30 minutos.
              </p>
            </FAQItem>
            
            <FAQItem>
              <summary>Qual o valor mínimo para começar?</summary>
              <p>
                Você pode começar com apenas R$ 50. Não existe valor máximo - 
                atendemos desde pequenos investidores até operações OTC de alto valor, 
                como clientes que vendem imóveis para comprar Bitcoin.
              </p>
            </FAQItem>
            
            <FAQItem>
              <summary>É realmente seguro?</summary>
              <p>
                Sim! Utilizamos um sistema de reputação transparente, verificação de identidade 
                em níveis e, o mais importante: seus fundos ficam sempre sob seu controle, 
                nunca em nossa custódia. Além disso, temos suporte 24/7 para qualquer necessidade.
              </p>
            </FAQItem>
            
            <FAQItem>
              <summary>Como funciona o suporte?</summary>
              <p>
                Oferecemos múltiplos canais: chat com IA para dúvidas rápidas, 
                comunidade ativa no WhatsApp/Telegram para trocar experiências, 
                e consultoria personalizada para operações complexas ou aprendizado avançado.
              </p>
            </FAQItem>
            
            <FAQItem>
              <summary>Quais as vantagens sobre exchanges tradicionais?</summary>
              <p>
                No P2P você tem: menores taxas (economia de até 70%), privacidade aumentada, 
                múltiplas formas de pagamento (PIX, TED, dinheiro), sem limites artificiais 
                de saque, e principalmente - você possui suas chaves privadas.
              </p>
            </FAQItem>
          </FAQGrid>
        </SectionContainer>
      </FAQSection>
      
      <FinalCTASection>
        <SectionContainer>
          <SectionTitle>Pronto para começar sua jornada P2P?</SectionTitle>
          <SectionSubtitle>
            Junte-se aos brasileiros que já descobriram a liberdade financeira através do P2P. 
            Cadastro gratuito, sem pegadinhas.
          </SectionSubtitle>
          <CTAButton onClick={handleCTAClick}>
            QUERO COMEÇAR AGORA
          </CTAButton>
          <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
            🔒 Cadastro seguro • 📚 Curso grátis incluso • ⚡ Comece em 2 minutos
          </p>
        </SectionContainer>
      </FinalCTASection>
      
      <FloatingCTA />
      <ExitIntentPopup />
    </PageContainer>
  )
}