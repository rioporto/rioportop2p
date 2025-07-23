'use client';

import { signOut } from 'next-auth/react';

interface ILogoutButtonProps {
  className?: string;
}

export const LogoutButton: React.FC<ILogoutButtonProps> = ({ className = '' }) => {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <button
      onClick={handleLogout}
      className={`text-red-600 hover:text-red-700 font-medium transition-colors ${className}`}
    >
      Sair
    </button>
  );
};