'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface StackLogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'danger' | 'ghost';
}

export function StackLogoutButton({ 
  className = '', 
  showIcon = true,
  variant = 'danger' 
}: StackLogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Import Stack Auth dynamically to avoid build errors
    import('@stackframe/stack').then((stackModule) => {
      if (stackModule && stackModule.useUser) {
        try {
          const stackUser = stackModule.useUser();
          setUser(stackUser);
        } catch (error) {
          console.error('Stack Auth not available:', error);
        }
      }
    });
  }, []);

  const handleLogout = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await user.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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