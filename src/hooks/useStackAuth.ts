"use client";

import { useState, useEffect } from 'react';

interface StackUser {
  id: string;
  primaryEmail?: string;
  displayName?: string;
  signOut: () => Promise<void>;
}

export function useStackAuth() {
  const [user, setUser] = useState<StackUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Tentar carregar Stack Auth dinamicamente
    import('@stackframe/stack')
      .then((stackModule) => {
        try {
          // Verificar se o módulo tem o que precisamos
          if (stackModule && stackModule.useUser) {
            const stackUser = stackModule.useUser();
            setUser(stackUser);
          }
        } catch (err) {
          console.error('Erro ao usar Stack Auth:', err);
          setError('Stack Auth não está disponível');
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar Stack Auth:', err);
        setError('Erro ao carregar módulo de autenticação');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading, error };
}