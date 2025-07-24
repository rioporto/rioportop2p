/**
 * Utilidades de validação para o formulário de registro
 */

/**
 * Regex para validação de número de WhatsApp brasileiro
 */
const whatsAppRegex = /^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/;

/**
 * Lista de domínios de email confiáveis e comuns no Brasil
 */
const trustedEmailDomains = [
  // Internacionais
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'aol.com',
  
  // Brasileiros
  'yahoo.com.br',
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'globo.com',
  'ig.com.br',
  'r7.com',
  'zipmail.com.br',
  'oi.com.br',
  'vivo.com.br',
  
  // Corporativos/Educacionais comuns
  'hotmail.com.br',
  'outlook.com.br',
  'live.com',
  'msn.com'
];

/**
 * Valida se o número de WhatsApp está no formato brasileiro correto
 * @param phone - Número de telefone a ser validado
 * @returns true se o número é válido, false caso contrário
 */
export function isValidWhatsApp(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remove espaços extras e normaliza
  const cleanPhone = phone.trim();
  
  return whatsAppRegex.test(cleanPhone);
}

/**
 * Valida se o domínio do email é de um provedor conhecido e confiável
 * @param email - Email a ser validado
 * @returns true se o domínio é válido, false caso contrário
 */
export function isValidEmailDomain(email: string): boolean {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return false;
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return false;
  }
  
  return trustedEmailDomains.includes(domain);
}

/**
 * Interface para o resultado da análise de força de senha
 */
interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: string[];
}

/**
 * Avalia a força de uma senha e fornece feedback
 * @param password - Senha a ser avaliada
 * @returns Objeto com score (0-4) e array de feedback
 */
export function getPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return { score: 0, feedback: ['Senha é obrigatória'] };
  }
  
  // Comprimento
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use pelo menos 8 caracteres');
  }
  
  if (password.length >= 12) {
    score += 0.5;
  }
  
  // Letra maiúscula
  if (/[A-Z]/.test(password)) {
    score += 0.5;
  } else {
    feedback.push('Adicione pelo menos uma letra maiúscula');
  }
  
  // Letra minúscula
  if (/[a-z]/.test(password)) {
    score += 0.5;
  } else {
    feedback.push('Adicione pelo menos uma letra minúscula');
  }
  
  // Número
  if (/[0-9]/.test(password)) {
    score += 0.5;
  } else {
    feedback.push('Adicione pelo menos um número');
  }
  
  // Caractere especial
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Adicione pelo menos um caractere especial (!@#$%^&*...)');
  }
  
  // Penalidades
  // Sequências comuns
  const commonSequences = ['123456', 'abcdef', 'qwerty', '123abc', 'senha', 'password'];
  if (commonSequences.some(seq => password.toLowerCase().includes(seq))) {
    score -= 1;
    feedback.push('Evite sequências comuns como "123456" ou "abcdef"');
  }
  
  // Repetições excessivas
  if (/(.)\1{2,}/.test(password)) {
    score -= 0.5;
    feedback.push('Evite repetir o mesmo caractere várias vezes');
  }
  
  // Normalizar score
  score = Math.max(0, Math.min(4, Math.round(score)));
  
  // Adicionar feedback baseado no score final
  if (score === 4 && feedback.length === 0) {
    feedback.push('Senha muito forte!');
  } else if (score === 3 && feedback.length === 0) {
    feedback.push('Senha forte');
  } else if (score === 2 && feedback.length === 0) {
    feedback.push('Senha moderada');
  } else if (score === 1) {
    feedback.unshift('Senha fraca');
  } else if (score === 0) {
    feedback.unshift('Senha muito fraca');
  }
  
  return {
    score: score as 0 | 1 | 2 | 3 | 4,
    feedback
  };
}

/**
 * Formata um número de WhatsApp para o padrão brasileiro
 * @param phone - Número de telefone a ser formatado
 * @returns Número formatado no padrão (XX) 9XXXX-XXXX ou string vazia se inválido
 */
export function formatWhatsApp(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Remove código do país se presente
  const cleanNumbers = numbers.replace(/^(?:55)?/, '');
  
  // Valida o comprimento
  if (cleanNumbers.length !== 10 && cleanNumbers.length !== 11) {
    return phone; // Retorna o original se não puder formatar
  }
  
  // Extrai as partes
  const ddd = cleanNumbers.substring(0, 2);
  const firstPart = cleanNumbers.length === 11 
    ? cleanNumbers.substring(2, 7) 
    : cleanNumbers.substring(2, 6);
  const secondPart = cleanNumbers.length === 11 
    ? cleanNumbers.substring(7) 
    : cleanNumbers.substring(6);
  
  // Formata
  return `(${ddd}) ${firstPart}-${secondPart}`;
}

/**
 * Remove formatação de um número de WhatsApp
 * @param phone - Número formatado
 * @returns Apenas os números
 */
export function unformatWhatsApp(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  return phone.replace(/\D/g, '');
}

/**
 * Valida um CPF brasileiro
 * @param cpf - CPF a ser validado
 * @returns true se válido, false caso contrário
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
}

/**
 * Formata um CPF
 * @param cpf - CPF a ser formatado
 * @returns CPF formatado (XXX.XXX.XXX-XX) ou string vazia se inválido
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return cpf;
  
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}