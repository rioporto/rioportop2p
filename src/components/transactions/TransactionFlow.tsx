'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { 
  Check, 
  CreditCard, 
  FileText, 
  Clock, 
  Gift,
  ChevronRight,
  ChevronLeft,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TransactionStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
}

interface ITransactionFlowProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const defaultSteps: TransactionStep[] = [
  {
    id: 1,
    title: 'Confirmação',
    description: 'Confirme os detalhes da transação',
    icon: <FileText className="w-5 h-5" />,
    status: 'active'
  },
  {
    id: 2,
    title: 'Pagamento',
    description: 'Selecione o método de pagamento',
    icon: <CreditCard className="w-5 h-5" />,
    status: 'pending'
  },
  {
    id: 3,
    title: 'Instruções',
    description: 'Siga as instruções de pagamento',
    icon: <Shield className="w-5 h-5" />,
    status: 'pending'
  },
  {
    id: 4,
    title: 'Confirmação',
    description: 'Aguardando confirmação',
    icon: <Clock className="w-5 h-5" />,
    status: 'pending'
  },
  {
    id: 5,
    title: 'Conclusão',
    description: 'Transação concluída',
    icon: <Gift className="w-5 h-5" />,
    status: 'pending'
  }
];

export function TransactionFlow({
  currentStep = 1,
  onStepChange,
  onComplete,
  children,
  className
}: ITransactionFlowProps) {
  const [steps, setSteps] = useState<TransactionStep[]>(defaultSteps);
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);

  useEffect(() => {
    const updatedSteps = steps.map(step => ({
      ...step,
      status: step.id < currentStep ? 'completed' :
              step.id === currentStep ? 'active' : 'pending'
    } as TransactionStep));
    setSteps(updatedSteps);
  }, [currentStep]);

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep && onStepChange) {
      setAnimatingStep(stepId);
      setTimeout(() => {
        onStepChange(stepId);
        setAnimatingStep(null);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      onStepChange?.(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange?.(currentStep - 1);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Stepper Header */}
      <div className="relative mb-8">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={cn(
                'flex flex-col items-center cursor-pointer group',
                step.id <= currentStep && 'cursor-pointer',
                step.id > currentStep && 'cursor-not-allowed opacity-50'
              )}
              onClick={() => handleStepClick(step.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step Circle */}
              <motion.div
                className={cn(
                  'relative z-10 w-12 h-12 rounded-full flex items-center justify-center',
                  'transition-all duration-300 group-hover:scale-110',
                  'border-2 shadow-lg',
                  step.status === 'completed' && 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-600 text-white',
                  step.status === 'active' && 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600 text-white animate-pulse',
                  step.status === 'pending' && 'bg-white border-gray-300 text-gray-400'
                )}
                whileHover={{ scale: step.id <= currentStep ? 1.1 : 1 }}
                whileTap={{ scale: step.id <= currentStep ? 0.95 : 1 }}
              >
                <AnimatePresence mode="wait">
                  {step.status === 'completed' ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      {step.icon}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <p className={cn(
                  'text-sm font-semibold transition-colors',
                  step.status === 'active' && 'text-blue-600',
                  step.status === 'completed' && 'text-green-600',
                  step.status === 'pending' && 'text-gray-400'
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-[100px]">
                  {step.description}
                </p>
              </div>

              {/* Active Step Indicator */}
              {step.status === 'active' && (
                <motion.div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-600" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px] bg-white rounded-xl shadow-xl p-6 border border-gray-100"
        >
          {/* Security Badge */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">
              Transação protegida pelo escrow seguro do Rio Porto
            </span>
          </div>

          {/* Dynamic Content */}
          {children}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="group"
            >
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    step.id === currentStep ? 'w-8 bg-blue-600' : 'bg-gray-300'
                  )}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {currentStep === steps.length ? 'Concluir' : 'Próximo'}
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile Step Indicator */}
      <div className="mt-4 flex justify-center lg:hidden">
        <div className="bg-gray-100 rounded-full px-4 py-2">
          <span className="text-sm font-medium text-gray-700">
            Etapa {currentStep} de {steps.length}
          </span>
        </div>
      </div>
    </div>
  );
}