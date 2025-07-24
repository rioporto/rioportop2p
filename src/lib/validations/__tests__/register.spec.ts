import {
  registerFormSchema,
  partialRegisterSchema,
  emailValidationSchema,
  whatsAppValidationSchema,
  passwordStrengthSchema,
} from '../register';

describe('Validações de Registro', () => {
  describe('registerFormSchema', () => {
    describe('Validação de Nome', () => {
      it('deve aceitar nomes válidos', () => {
        const validNames = [
          'João Silva',
          'Maria dos Santos',
          'José D\'Angelo',
          'Ana-Paula Costa',
          'Luís Ângelo',
          'François Müller',
        ];

        validNames.forEach((name) => {
          const result = registerFormSchema.safeParse({
            name,
            email: 'test@gmail.com',
            whatsapp: '(11) 98765-4321',
            password: 'SenhaForte123!',
            confirmPassword: 'SenhaForte123!',
            acceptTerms: true,
          });
          expect(result.success).toBe(true);
        });
      });

      it('deve rejeitar nomes inválidos', () => {
        const invalidNames = [
          'Jo', // Muito curto
          'A'.repeat(101), // Muito longo
          'João123', // Contém números
          'João@Silva', // Caracteres especiais não permitidos
          '', // Vazio
        ];

        invalidNames.forEach((name) => {
          const result = registerFormSchema.safeParse({
            name,
            email: 'test@gmail.com',
            whatsapp: '(11) 98765-4321',
            password: 'SenhaForte123!',
            confirmPassword: 'SenhaForte123!',
            acceptTerms: true,
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].path[0]).toBe('name');
          }
        });
      });
    });

    describe('Validação de Email', () => {
      it('deve aceitar emails de domínios conhecidos', () => {
        const validEmails = [
          'user@gmail.com',
          'user@hotmail.com',
          'user@outlook.com',
          'user@yahoo.com',
          'user@yahoo.com.br',
          'user@icloud.com',
          'user@protonmail.com',
        ];

        validEmails.forEach((email) => {
          const result = registerFormSchema.safeParse({
            name: 'João Silva',
            email,
            whatsapp: '(11) 98765-4321',
            password: 'SenhaForte123!',
            confirmPassword: 'SenhaForte123!',
            acceptTerms: true,
          });
          expect(result.success).toBe(true);
        });
      });

      it('deve rejeitar emails de domínios desconhecidos', () => {
        const invalidEmails = [
          'user@tempmail.com',
          'user@empresa.com',
          'user@10minutemail.com',
          'invalid-email',
          '@gmail.com',
          'user@',
        ];

        invalidEmails.forEach((email) => {
          const result = registerFormSchema.safeParse({
            name: 'João Silva',
            email,
            whatsapp: '(11) 98765-4321',
            password: 'SenhaForte123!',
            confirmPassword: 'SenhaForte123!',
            acceptTerms: true,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Validação de WhatsApp', () => {
      it('deve aceitar números de WhatsApp válidos', () => {
        const validNumbers = [
          '+55 11 91234-5678',
          '55 11 91234-5678',
          '(11) 91234-5678',
          '11 91234-5678',
          '11912345678',
          '(11) 3123-4567', // Fixo
          '(21) 98765-4321', // Outro DDD
        ];

        validNumbers.forEach((whatsapp) => {
          const result = registerFormSchema.safeParse({
            name: 'João Silva',
            email: 'test@gmail.com',
            whatsapp,
            password: 'SenhaForte123!',
            confirmPassword: 'SenhaForte123!',
            acceptTerms: true,
          });
          expect(result.success).toBe(true);
        });
      });

      it('deve rejeitar números de WhatsApp inválidos', () => {
        const invalidNumbers = [
          '912345678', // Sem DDD
          '(11) 1234-5678', // Formato incorreto
          '(00) 91234-5678', // DDD inválido
          '+1 555 1234567', // Número internacional
          'abcd1234', // Letras
          '', // Vazio
        ];

        invalidNumbers.forEach((whatsapp) => {
          const result = registerFormSchema.safeParse({
            name: 'João Silva',
            email: 'test@gmail.com',
            whatsapp,
            password: 'SenhaForte123!',
            confirmPassword: 'SenhaForte123!',
            acceptTerms: true,
          });
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].path[0]).toBe('whatsapp');
          }
        });
      });
    });

    describe('Validação de Senha', () => {
      it('deve aceitar senhas fortes', () => {
        const validPasswords = [
          'SenhaForte123!',
          'MyP@ssw0rd',
          'Complex!ty8',
          'Test#2023Pass',
        ];

        validPasswords.forEach((password) => {
          const result = registerFormSchema.safeParse({
            name: 'João Silva',
            email: 'test@gmail.com',
            whatsapp: '(11) 98765-4321',
            password,
            confirmPassword: password,
            acceptTerms: true,
          });
          expect(result.success).toBe(true);
        });
      });

      it('deve rejeitar senhas fracas', () => {
        const invalidPasswords = [
          'short', // Muito curta
          'nouppercase123!', // Sem maiúscula
          'NOLOWERCASE123!', // Sem minúscula
          'NoNumbers!', // Sem números
          'NoSpecial123', // Sem caracteres especiais
          '', // Vazia
        ];

        invalidPasswords.forEach((password) => {
          const result = registerFormSchema.safeParse({
            name: 'João Silva',
            email: 'test@gmail.com',
            whatsapp: '(11) 98765-4321',
            password,
            confirmPassword: password,
            acceptTerms: true,
          });
          expect(result.success).toBe(false);
        });
      });

      it('deve validar confirmação de senha', () => {
        const result = registerFormSchema.safeParse({
          name: 'João Silva',
          email: 'test@gmail.com',
          whatsapp: '(11) 98765-4321',
          password: 'SenhaForte123!',
          confirmPassword: 'SenhaDiferente123!',
          acceptTerms: true,
        });
        
        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find(
            (issue) => issue.path[0] === 'confirmPassword'
          );
          expect(error?.message).toBe('As senhas não coincidem');
        }
      });
    });

    describe('Validação de Termos', () => {
      it('deve exigir aceitação dos termos', () => {
        const result = registerFormSchema.safeParse({
          name: 'João Silva',
          email: 'test@gmail.com',
          whatsapp: '(11) 98765-4321',
          password: 'SenhaForte123!',
          confirmPassword: 'SenhaForte123!',
          acceptTerms: false,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find(
            (issue) => issue.path[0] === 'acceptTerms'
          );
          expect(error?.message).toBe(
            'Você deve aceitar os termos de uso para continuar'
          );
        }
      });
    });

    describe('Validação Completa', () => {
      it('deve aceitar dados válidos completos', () => {
        const validData = {
          name: 'João da Silva Santos',
          email: 'joao.santos@gmail.com',
          whatsapp: '(11) 98765-4321',
          password: 'SenhaForte123!',
          confirmPassword: 'SenhaForte123!',
          acceptTerms: true,
        };

        const result = registerFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      it('deve retornar múltiplos erros quando aplicável', () => {
        const invalidData = {
          name: 'Jo', // Muito curto
          email: 'invalid', // Email inválido
          whatsapp: '123', // WhatsApp inválido
          password: '123', // Senha fraca
          confirmPassword: '456', // Não coincide
          acceptTerms: false, // Não aceito
        };

        const result = registerFormSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(1);
        }
      });
    });
  });

  describe('partialRegisterSchema', () => {
    it('deve aceitar validação parcial de campos', () => {
      const partialData = {
        name: 'João Silva',
        email: 'joao@gmail.com',
      };

      const result = partialRegisterSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('deve validar apenas campos fornecidos', () => {
      const partialData = {
        email: 'invalid-email',
      };

      const result = partialRegisterSchema.safeParse(partialData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('email');
      }
    });
  });

  describe('emailValidationSchema', () => {
    it('deve validar apenas email', () => {
      const validResult = emailValidationSchema.safeParse({
        email: 'test@gmail.com',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = emailValidationSchema.safeParse({
        email: 'test@unknown.com',
      });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('whatsAppValidationSchema', () => {
    it('deve validar apenas WhatsApp', () => {
      const validResult = whatsAppValidationSchema.safeParse({
        whatsapp: '(11) 98765-4321',
      });
      expect(validResult.success).toBe(true);

      const invalidResult = whatsAppValidationSchema.safeParse({
        whatsapp: '12345',
      });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('passwordStrengthSchema', () => {
    it('deve aceitar qualquer string como senha para análise', () => {
      const passwords = ['weak', 'STRONG123!', ''];
      
      passwords.forEach((password) => {
        const result = passwordStrengthSchema.safeParse({ password });
        expect(result.success).toBe(true);
      });
    });
  });
});