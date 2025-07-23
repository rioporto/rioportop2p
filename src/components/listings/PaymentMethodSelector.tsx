'use client';

import { useState } from 'react';
import { PaymentMethod } from '@/types/listings';

interface IPaymentMethodSelectorProps {
  selectedMethods: PaymentMethod[];
  onChange: (methods: PaymentMethod[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}

interface IPaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}

const paymentMethodOptions: IPaymentMethodOption[] = [
  {
    value: 'PIX',
    label: 'PIX',
    description: 'Transferência instantânea 24/7',
    icon: '⚡'
  },
  {
    value: 'TED',
    label: 'TED',
    description: 'Transferência em dias úteis',
    icon: '🏦'
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Transferência Bancária',
    description: 'Entre contas do mesmo banco',
    icon: '💳'
  }
];

export function PaymentMethodSelector({ 
  selectedMethods, 
  onChange, 
  multiple = true,
  disabled = false 
}: IPaymentMethodSelectorProps) {
  const [hoveredMethod, setHoveredMethod] = useState<PaymentMethod | null>(null);

  const handleMethodToggle = (method: PaymentMethod) => {
    if (disabled) return;

    if (multiple) {
      if (selectedMethods.includes(method)) {
        onChange(selectedMethods.filter(m => m !== method));
      } else {
        onChange([...selectedMethods, method]);
      }
    } else {
      onChange([method]);
    }
  };

  const isSelected = (method: PaymentMethod) => selectedMethods.includes(method);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Métodos de Pagamento
        </label>
        {multiple && (
          <span className="text-xs text-gray-500">
            Selecione um ou mais
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paymentMethodOptions.map((option) => {
          const selected = isSelected(option.value);
          const hovered = hoveredMethod === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => handleMethodToggle(option.value)}
              onMouseEnter={() => setHoveredMethod(option.value)}
              onMouseLeave={() => setHoveredMethod(null)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${selected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${hovered && !disabled ? 'shadow-md transform -translate-y-0.5' : ''}
              `}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="text-2xl">{option.icon}</div>
                <div className={`font-medium ${selected ? 'text-blue-700' : 'text-gray-900'}`}>
                  {option.label}
                </div>
                <div className={`text-xs ${selected ? 'text-blue-600' : 'text-gray-500'}`}>
                  {option.description}
                </div>
              </div>

              {selected && (
                <div className="absolute top-2 right-2">
                  <svg 
                    className="w-5 h-5 text-blue-500" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedMethods.length === 0 && !disabled && (
        <p className="text-sm text-red-500 mt-2">
          Selecione pelo menos um método de pagamento
        </p>
      )}
    </div>
  );
}