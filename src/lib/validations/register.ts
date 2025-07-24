import { z } from 'zod';

/**
 * Regex para validação de número de WhatsApp brasileiro
 * Aceita formatos:
 * - +55 11 91234-5678
 * - 55 11 91234-5678
 * - (11) 91234-5678
 * - 11 91234-5678
 * - 11912345678
 */
const whatsAppRegex = /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/;

/**
 * Validação de email sem restrição de domínio
 * Aceita qualquer email válido (corporativo, educacional, pessoal, etc.)
 */
const emailValidation = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(254, 'Email muito longo'); // RFC 5321

/**
 * Schema de validação para o formulário de registro
 */
export const registerFormSchema = z.object({
  // Nome completo com validação de comprimento
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome deve conter apenas letras, espaços, hífens e apóstrofos'),

  // Email com validação básica (aceita qualquer domínio válido)
  email: emailValidation,

  // WhatsApp com validação completa
  whatsapp: z
    .string()
    .regex(whatsAppRegex, 'Número de WhatsApp inválido. Use o formato (XX) 9XXXX-XXXX'),

  // Senha com requisitos de segurança
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial'),

  // Confirmação de senha
  confirmPassword: z.string(),

  // Aceite dos termos
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso para continuar'
    })
})
// Validação de match de senha
.refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

/**
 * Tipo inferido do schema de registro
 */
export type RegisterFormData = z.infer<typeof registerFormSchema>;

/**
 * Schema para validação parcial (útil para validação em tempo real)
 */
export const partialRegisterSchema = registerFormSchema.partial();

/**
 * Schema apenas para validação de email (útil para verificação de disponibilidade)
 */
export const emailValidationSchema = z.object({
  email: emailValidation
});

/**
 * Schema apenas para validação de WhatsApp
 */
export const whatsAppValidationSchema = z.object({
  whatsapp: z.string().regex(whatsAppRegex, 'Número de WhatsApp inválido')
});

/**
 * Schema para validação de força de senha
 */
export const passwordStrengthSchema = z.object({
  password: z.string()
});