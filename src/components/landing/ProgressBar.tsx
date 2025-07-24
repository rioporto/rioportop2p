"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface IProgressStep {
  /** Step identifier */
  id: string;
  /** Step label */
  label: string;
  /** Step description (optional) */
  description?: string;
  /** Icon for the step */
  icon?: React.ReactNode;
}

interface IProgressBarProps {
  /** Array of steps */
  steps: IProgressStep[];
  /** Current active step (0-indexed) */
  currentStep: number;
  /** Style variant */
  variant?: "linear" | "circular" | "dots";
  /** Show step labels */
  showLabels?: boolean;
  /** Show step numbers */
  showNumbers?: boolean;
  /** Allow clicking on previous steps */
  allowStepClick?: boolean;
  /** Callback when step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Custom class name */
  className?: string;
  /** Animate progress changes */
  animated?: boolean;
  /** Show completion checkmark */
  showCheckmark?: boolean;
}

export const ProgressBar: React.FC<IProgressBarProps> = ({
  steps,
  currentStep,
  variant = "linear",
  showLabels = true,
  showNumbers = true,
  allowStepClick = false,
  onStepClick,
  className,
  animated = true,
  showCheckmark = true,
}) => {
  const [progress, setProgress] = useState(0);

  // Calculate progress percentage
  useEffect(() => {
    const percentage = steps.length > 1 
      ? (currentStep / (steps.length - 1)) * 100 
      : currentStep > 0 ? 100 : 0;
    
    if (animated) {
      // Animate progress change
      const timer = setTimeout(() => {
        setProgress(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setProgress(percentage);
    }
  }, [currentStep, steps.length, animated]);

  const handleStepClick = (index: number) => {
    if (allowStepClick && index <= currentStep && onStepClick) {
      onStepClick(index);
      
      // Track step navigation
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "progress_step_click", {
          from_step: currentStep,
          to_step: index,
          step_label: steps[index].label,
        });
      }
    }
  };

  if (variant === "circular") {
    return <CircularProgress steps={steps} currentStep={currentStep} progress={progress} />;
  }

  if (variant === "dots") {
    return <DotsProgress steps={steps} currentStep={currentStep} className={className} />;
  }

  // Default linear variant
  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        
        {/* Active progress line */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shimmer effect */}
          {animated && progress > 0 && progress < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isClickable = allowStepClick && index <= currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center",
                  isClickable && "cursor-pointer"
                )}
                onClick={() => handleStepClick(index)}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    "ring-4 ring-white dark:ring-gray-900",
                    isCompleted && "bg-primary-500 text-white",
                    isActive && "bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/30",
                    !isCompleted && !isActive && "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}
                >
                  {isCompleted && showCheckmark ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.icon ? (
                    <span className="w-5 h-5">{step.icon}</span>
                  ) : showNumbers ? (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  ) : null}

                  {/* Active step pulse */}
                  {isActive && animated && (
                    <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-75" />
                  )}
                </div>

                {/* Step label and description */}
                {showLabels && (
                  <div className="mt-3 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isActive && "text-primary-600 dark:text-primary-400",
                        isCompleted && "text-gray-700 dark:text-gray-300",
                        !isCompleted && !isActive && "text-gray-400 dark:text-gray-500"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[100px]">
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress percentage for screen readers */}
      <div className="sr-only" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        {Math.round(progress)}% completo
      </div>
    </div>
  );
};

// Circular progress variant
const CircularProgress: React.FC<{
  steps: IProgressStep[];
  currentStep: number;
  progress: number;
}> = ({ steps, currentStep, progress }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {currentStep + 1}/{steps.length}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {steps[currentStep]?.label}
        </span>
      </div>
    </div>
  );
};

// Dots progress variant
const DotsProgress: React.FC<{
  steps: IProgressStep[];
  currentStep: number;
  className?: string;
}> = ({ steps, currentStep, className }) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {steps.map((_, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div
            key={index}
            className={cn(
              "transition-all duration-300",
              isActive && "scale-125",
              isCompleted || isActive ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600",
              isActive ? "w-8 h-3 rounded-full" : "w-3 h-3 rounded-full"
            )}
          />
        );
      })}
    </div>
  );
};

// Step indicator component for forms
export const FormStepIndicator: React.FC<{
  currentStep: number;
  totalSteps: number;
  className?: string;
}> = ({ currentStep, totalSteps, className }) => {
  return (
    <div className={cn("text-center", className)}>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Passo {currentStep} de {totalSteps}
      </span>
      <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Completion celebration component
export const CompletionCelebration: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="text-center animate-scaleUp">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Parabéns!
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Cadastro concluído com sucesso
        </p>
      </div>

      {/* Confetti animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary-500 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes scaleUp {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-scaleUp {
          animation: scaleUp 0.5s ease-out;
        }
        
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};