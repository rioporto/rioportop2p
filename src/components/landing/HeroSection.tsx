"use client";

import React, { useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { Button } from "@/components/ui/Button";

/**
 * HeroSection Component
 * 
 * A fully responsive, animated hero section for the Rio Porto P2P landing page.
 * Features include animated headline appearance, prominent CTA button with hover states,
 * trust indicators, background patterns/gradients, and smooth scroll functionality.
 * 
 * @example
 * <HeroSection 
 *   headline="APRENDA COMPRAR OU VENDER BITCOIN VIA P2P"
 *   subheadline="Domine tudo sobre P2P + treinamento grátis"
 *   ctaText="EU QUERO"
 *   onCtaClick={() => console.log('CTA clicked')}
 * />
 */

// TypeScript Interfaces
interface IHeroSectionProps {
  /** Main headline text */
  headline?: string;
  /** Subheadline text */
  subheadline?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button click handler */
  onCtaClick?: () => void;
  /** Background variant */
  backgroundVariant?: "gradient" | "pattern" | "animated" | "minimal";
  /** Custom class name */
  className?: string;
}

interface IGuaranteeItem {
  text: string;
  icon?: React.ReactNode;
}

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(10px) rotate(-5deg);
  }
`;

// Styled Components
const HeroContainer = styled.section<{ $variant: string }>`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-gray-900);
  
  /* Mobile-first approach */
  padding: var(--spacing-16) var(--spacing-4);
  
  @media (min-width: 768px) {
    padding: var(--spacing-20) var(--spacing-8);
  }
  
  @media (min-width: 1024px) {
    padding: var(--spacing-24) var(--spacing-16);
  }
`;

const BackgroundLayer = styled.div<{ $variant: string }>`
  position: absolute;
  inset: 0;
  z-index: 0;
  
  ${({ $variant }) => {
    switch ($variant) {
      case "gradient":
        return css`
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 25%,
            #f093fb 50%,
            #f5576c 75%,
            #667eea 100%
          );
          background-size: 400% 400%;
          animation: ${gradientShift} 15s ease infinite;
          opacity: 0.1;
        `;
      case "pattern":
        return css`
          background-image: 
            radial-gradient(circle at 25% 25%, var(--color-primary) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, var(--color-secondary) 0%, transparent 50%);
          opacity: 0.05;
          
          &::after {
            content: '';
            position: absolute;
            inset: 0;
            background-image: radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `;
      case "animated":
        return css`
          background: var(--dark-gradient);
          
          &::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, var(--color-primary) 0%, transparent 70%);
            opacity: 0.1;
            animation: ${floatAnimation} 20s ease-in-out infinite;
          }
          
          &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(-45deg, var(--color-secondary) 0%, transparent 70%);
            opacity: 0.1;
            animation: ${floatAnimation} 20s ease-in-out infinite reverse;
          }
        `;
      default:
        return css`
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%);
        `;
    }
  }}
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  width: 100%;
`;

const Headline = styled.h1`
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: var(--font-black);
  line-height: var(--leading-tight);
  color: var(--color-white);
  margin-bottom: var(--spacing-6);
  animation: ${fadeInUp} 0.8s ease-out;
  
  /* Text gradient effect */
  background: linear-gradient(
    to right,
    var(--color-white) 0%,
    var(--color-gray-100) 50%,
    var(--color-white) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% auto;
  animation: ${gradientShift} 3s ease-in-out infinite;
  
  @media (min-width: 768px) {
    margin-bottom: var(--spacing-8);
  }
`;

const Subheadline = styled.p`
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-10);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
  
  @media (min-width: 768px) {
    margin-bottom: var(--spacing-12);
  }
`;

const CTAWrapper = styled.div`
  margin-bottom: var(--spacing-12);
  animation: ${fadeInScale} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
  
  @media (min-width: 768px) {
    margin-bottom: var(--spacing-16);
  }
`;

const StyledCTAButton = styled(Button)`
  min-width: 200px;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  padding: var(--spacing-4) var(--spacing-8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Glow effect */
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: var(--primary-gradient);
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
    filter: blur(10px);
    z-index: -1;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
    
    &::before {
      opacity: 0.5;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  /* Pulse animation on load */
  animation: ${pulse} 2s ease-in-out infinite;
  animation-delay: 1s;
  
  @media (min-width: 768px) {
    min-width: 250px;
    font-size: var(--text-xl);
    padding: var(--spacing-5) var(--spacing-10);
  }
`;

const GuaranteesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const GuaranteeItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--color-gray-400);
  
  @media (min-width: 768px) {
    font-size: var(--text-base);
  }
  
  &::before {
    content: '✓';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--success-gradient);
    color: var(--color-white);
    border-radius: 50%;
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
  }
`;

const ScrollIndicator = styled.button`
  position: absolute;
  bottom: var(--spacing-8);
  left: 50%;
  transform: translateX(-50%);
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: var(--spacing-2);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.8s;
  animation-fill-mode: both;
  
  &:hover {
    color: var(--color-gray-300);
    transform: translateX(-50%) translateY(5px);
  }
  
  svg {
    width: 24px;
    height: 24px;
    animation: ${floatAnimation} 2s ease-in-out infinite;
  }
`;

const FloatingElement = styled.div<{ $delay: number; $size: number; $left: string }>`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: var(--luxury-gradient);
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(40px);
  left: ${props => props.$left};
  top: 50%;
  transform: translateY(-50%);
  animation: ${floatAnimation} 20s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  pointer-events: none;
`;

export const HeroSection: React.FC<IHeroSectionProps> = ({
  headline = "APRENDA COMPRAR OU VENDER BITCOIN VIA P2P",
  subheadline = "Domine tudo sobre P2P + treinamento grátis",
  ctaText = "EU QUERO",
  onCtaClick,
  backgroundVariant = "animated",
  className,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const guarantees: IGuaranteeItem[] = [
    { text: "Sem pegadinhas" },
    { text: "Comece Agora" },
    { text: "2 minutos para começar" },
  ];
  
  const handleScrollToNext = () => {
    if (sectionRef.current) {
      const nextSection = sectionRef.current.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };
  
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      // Default behavior: smooth scroll to next section
      handleScrollToNext();
    }
  };
  
  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const scrolled = window.scrollY;
        const rate = scrolled * -0.5;
        sectionRef.current.style.transform = `translateY(${rate}px)`;
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <HeroContainer
      ref={sectionRef}
      $variant={backgroundVariant}
      className={className}
      role="banner"
      aria-labelledby="hero-headline"
    >
      {/* Background Layer */}
      <BackgroundLayer $variant={backgroundVariant} aria-hidden="true" />
      
      {/* Floating Elements */}
      {backgroundVariant === "animated" && (
        <>
          <FloatingElement $delay={0} $size={300} $left="10%" />
          <FloatingElement $delay={5} $size={400} $left="70%" />
          <FloatingElement $delay={10} $size={200} $left="50%" />
        </>
      )}
      
      {/* Main Content */}
      <ContentWrapper>
        <Headline id="hero-headline">
          {headline}
        </Headline>
        
        <Subheadline>
          {subheadline}
        </Subheadline>
        
        <CTAWrapper>
          <StyledCTAButton
            variant="gradient"
            gradient="primary"
            size="xl"
            onClick={handleCtaClick}
            aria-label={`${ctaText} - Iniciar jornada no P2P`}
            glow
            glowColor="primary"
          >
            {ctaText}
            <span aria-hidden="true" style={{ marginLeft: "8px" }}>→</span>
          </StyledCTAButton>
        </CTAWrapper>
        
        <GuaranteesContainer role="list" aria-label="Garantias">
          {guarantees.map((guarantee, index) => (
            <GuaranteeItem 
              key={index} 
              role="listitem"
              style={{ animationDelay: `${0.7 + index * 0.1}s` }}
            >
              {guarantee.text}
            </GuaranteeItem>
          ))}
        </GuaranteesContainer>
      </ContentWrapper>
      
      {/* Scroll Indicator */}
      <ScrollIndicator
        onClick={handleScrollToNext}
        aria-label="Rolar para a próxima seção"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </ScrollIndicator>
    </HeroContainer>
  );
};

// Display name for debugging
HeroSection.displayName = "HeroSection";

// Export default for lazy loading
export default HeroSection;