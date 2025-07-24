import React, { useEffect, useRef, useState } from 'react';
import { FaUserTie, FaGraduationCap, FaKey, FaHeadset, FaHandshake, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import type { IconType } from 'react-icons';

interface Benefit {
  id: string;
  icon: IconType;
  title: string;
  description: string;
  learnMoreLink?: string;
}

interface BenefitCardProps {
  benefit: Benefit;
  index: number;
  isVisible: boolean;
}

const benefits: Benefit[] = [
  {
    id: 'personalized-service',
    icon: FaUserTie,
    title: 'Atendimento VIP Personalizado',
    description: 'Como ter um gerente de banco só seu, disponível 24/7. Suporte humanizado que entende suas necessidades.',
    learnMoreLink: '#atendimento'
  },
  {
    id: 'free-education',
    icon: FaGraduationCap,
    title: 'Educação P2P 100% Gratuita',
    description: 'Curso completo do básico ao avançado. Domine P2P em 30 dias com nosso método exclusivo.',
    learnMoreLink: '#curso'
  },
  {
    id: 'your-control',
    icon: FaKey,
    title: 'Seus Fundos, Seu Controle',
    description: 'Nunca custodiamos seu dinheiro. Você mantém total controle com segurança de instituição financeira.',
    learnMoreLink: '#seguranca'
  },
  {
    id: 'multiple-support',
    icon: FaHeadset,
    title: 'Suporte Por Todos os Canais',
    description: 'Chat com IA, comunidade ativa, consultoria 1:1. Escolha como prefere ser atendido.',
    learnMoreLink: '#suporte'
  },
  {
    id: 'direct-negotiation',
    icon: FaHandshake,
    title: 'Negociação Direta e Segura',
    description: 'P2P, B2P ou OTC para grandes volumes. Flexibilidade total com proteção garantida.',
    learnMoreLink: '#negociacao'
  },
  {
    id: 'compliance',
    icon: FaShieldAlt,
    title: '100% Regulamentado',
    description: 'Conformidade total com legislação brasileira. Opere com tranquilidade e segurança jurídica.',
    learnMoreLink: '#compliance'
  }
];

function BenefitCard({ benefit, index, isVisible }: BenefitCardProps) {
  const Icon = benefit.icon;
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-700 transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-orange-600" />
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-gray-900">
        {benefit.title}
      </h3>
      
      <p className="text-gray-600 mb-4 leading-relaxed">
        {benefit.description}
      </p>
      
      {benefit.learnMoreLink && (
        <a
          href={benefit.learnMoreLink}
          className="inline-flex items-center text-orange-600 hover:text-orange-700 
                   font-medium transition-colors duration-200"
          aria-label={`Saiba mais sobre ${benefit.title}`}
        >
          Saiba mais
          <FaArrowRight className="ml-2 w-4 h-4" />
        </a>
      )}
    </div>
  );
}

export function BenefitsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeaderVisible(true);
          setTimeout(() => setIsVisible(true), 300);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 bg-gray-50"
      aria-labelledby="benefits-heading"
    >
      <div className="container mx-auto px-4">
        <div 
          className={`text-center mb-12 transition-all duration-700 ${
            isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 
            id="benefits-heading"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Por que a Rio Porto P2P é diferente?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Combinamos a segurança de uma instituição financeira com a liberdade do P2P. 
            Conheça nossos diferenciais:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={benefit.id}
              benefit={benefit}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        <div 
          className={`text-center mt-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <p className="text-lg text-gray-600 mb-6">
            Junte-se a mais de <strong className="text-gray-900">9 clientes satisfeitos</strong> que 
            já descobriram a forma mais segura de comprar e vender Bitcoin
          </p>
          <a
            href="#cadastro"
            className="inline-flex items-center justify-center px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label="Comece agora com a Rio Porto P2P"
          >
            Comece Agora Gratuitamente
          </a>
        </div>
      </div>
    </section>
  );
}