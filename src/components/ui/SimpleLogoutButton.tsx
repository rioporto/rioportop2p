'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface SimpleLogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'danger' | 'ghost';
}

export function SimpleLogoutButton({ 
  className = '', 
  showIcon = true,
  variant = 'danger' 
}: SimpleLogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Chamar a API de logout do Stack Auth
      const response = await fetch('/handler/sign-out', {
        method: 'GET',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        // Limpar cookies e redirecionar
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Tentar redirecionar mesmo com erro
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const variantClasses = {
    default: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    danger: 'bg-vermelho-alerta text-white hover:bg-vermelho-alerta/90',
    ghost: 'text-vermelho-alerta hover:bg-vermelho-alerta/10'
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        flex items-center gap-2
        ${variantClasses[variant]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {showIcon && (
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
      )}
      {isLoading ? 'Saindo...' : 'Sair'}
    </button>
  );
}