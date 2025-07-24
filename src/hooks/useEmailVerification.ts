'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface EmailVerificationState {
  isVerified: boolean;
  isLoading: boolean;
  email: string | null;
  resendEmail: () => Promise<void>;
  resendSuccess: boolean;
  resendError: string | null;
  isResending: boolean;
}

export function useEmailVerification(): EmailVerificationState {
  const { data: session, status } = useSession();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Check user verification status
      checkVerificationStatus();
    } else {
      setIsLoading(false);
    }
  }, [session, status]);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.data?.emailVerified || false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async () => {
    if (!session?.user?.email) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 5000);
      } else {
        setResendError(data.error?.message || 'Erro ao reenviar email');
        setTimeout(() => setResendError(null), 5000);
      }
    } catch (error) {
      setResendError('Erro ao conectar com o servidor');
      setTimeout(() => setResendError(null), 5000);
    } finally {
      setIsResending(false);
    }
  };

  return {
    isVerified,
    isLoading,
    email: session?.user?.email || null,
    resendEmail,
    resendSuccess,
    resendError,
    isResending,
  };
}