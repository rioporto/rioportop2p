'use server';

import { signIn } from '@/lib/auth/auth';
import { AuthError } from 'next-auth';

export async function loginAction(email: string, password: string) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Credenciais inválidas.' };
        default:
          return { error: 'Algo deu errado.' };
      }
    }
    throw error;
  }
}