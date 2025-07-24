/**
 * Exemplos de uso das validações de registro
 * Este arquivo demonstra como usar as validações criadas
 */

import { registerFormSchema } from '../register';
import { 
  isValidWhatsApp, 
  isValidEmailDomain, 
  getPasswordStrength, 
  formatWhatsApp 
} from '../../utils/validators';

// Exemplo 1: Validação completa do formulário
const exampleFormData = {
  name: 'João da Silva',
  email: 'joao@gmail.com',
  whatsapp: '(11) 98765-4321',
  password: 'SenhaForte123!',
  confirmPassword: 'SenhaForte123!',
  acceptTerms: true
};

// Validar dados do formulário
try {
  const validatedData = registerFormSchema.parse(exampleFormData);
  console.log('Dados válidos:', validatedData);
} catch (error) {
  console.error('Erro de validação:', error);
}

// Exemplo 2: Validação individual de WhatsApp
const phoneNumbers = [
  '+55 11 98765-4321',    // Válido
  '(11) 98765-4321',      // Válido
  '11987654321',          // Válido
  '(11) 8765-4321',       // Válido (fixo)
  '987654321',            // Inválido (sem DDD)
  '(11) 12345-6789'       // Inválido (formato incorreto)
];

phoneNumbers.forEach(phone => {
  console.log(`${phone}: ${isValidWhatsApp(phone) ? 'Válido' : 'Inválido'}`);
});

// Exemplo 3: Formatação de WhatsApp
const unformattedPhone = '11987654321';
console.log('Formatado:', formatWhatsApp(unformattedPhone)); // (11) 98765-4321

// Exemplo 4: Validação de domínio de email
const emails = [
  'user@gmail.com',       // Válido
  'user@hotmail.com',     // Válido
  'user@empresa.com.br',  // Inválido (domínio não reconhecido)
  'user@tempmail.com'     // Inválido (domínio não confiável)
];

emails.forEach(email => {
  console.log(`${email}: ${isValidEmailDomain(email) ? 'Domínio válido' : 'Domínio inválido'}`);
});

// Exemplo 5: Análise de força de senha
const passwords = [
  'abc',                  // Muito fraca
  'abcd1234',            // Fraca
  'Abcd1234',            // Moderada
  'Abcd1234!',           // Forte
  'MyStr0ng!P@ssw0rd'    // Muito forte
];

passwords.forEach(password => {
  const strength = getPasswordStrength(password);
  console.log(`${password}:`);
  console.log(`  Score: ${strength.score}/4`);
  console.log(`  Feedback: ${strength.feedback.join(', ')}`);
});

// Exemplo 6: Validação assíncrona com react-hook-form
// Este é um exemplo de como integrar com react-hook-form
/*
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterFormData } from '../register';

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Processar dados do formulário
    console.log('Dados validados:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Nome completo" />
      {errors.name && <span>{errors.name.message}</span>}
      
      // ... outros campos
    </form>
  );
}
*/