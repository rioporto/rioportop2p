import { z } from 'zod';

// Validação de CPF brasileiro
const cpfSchema = z.string().regex(
  /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
  'CPF inválido. Use o formato XXX.XXX.XXX-XX ou apenas números'
);

// Validação de telefone brasileiro
const phoneSchema = z.string().regex(
  /^(\+55\s?)?(\d{2}\s?)?(\d{4,5}-?\d{4})$/,
  'Telefone inválido. Use o formato (XX) XXXXX-XXXX'
);

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Senha deve conter maiúsculas, minúsculas, números e caracteres especiais'
    ),
  confirmPassword: z.string(),
  cpf: cpfSchema.optional(),
  phone: phoneSchema.optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de uso',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Senha deve conter maiúsculas, minúsculas, números e caracteres especiais'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;