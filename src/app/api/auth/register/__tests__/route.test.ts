import { POST } from '../route';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/utils';
import { ApiResponse } from '@/lib/api/response';
import { leadApi } from '@/lib/api/lead';
import { newsletterApi } from '@/lib/api/newsletter';
import { smsService } from '@/services/sms.service';
import { emailService } from '@/services/email.service';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth/utils', () => ({
  hashPassword: jest.fn(),
  generateVerificationToken: jest.fn(() => 'test-token-123'),
}));

jest.mock('@/lib/api/response', () => ({
  ApiResponse: {
    created: jest.fn(),
    conflict: jest.fn(),
    badRequest: jest.fn(),
    internalError: jest.fn(),
  },
}));

jest.mock('@/lib/api/lead', () => ({
  leadApi: {
    capture: jest.fn(),
  },
  LeadSource: {
    LANDING_PAGE: 'LANDING_PAGE',
    REGISTRATION_FORM: 'REGISTRATION_FORM',
  },
  LeadInterest: {
    P2P_TRADING: 'P2P_TRADING',
  },
}));

jest.mock('@/lib/api/newsletter', () => ({
  newsletterApi: {
    subscribe: jest.fn(),
  },
}));

jest.mock('@/services/sms.service', () => ({
  smsService: {
    sendVerificationSMS: jest.fn(),
  },
}));

jest.mock('@/services/email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn(),
  },
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  describe('Casos de Sucesso', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const requestData = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        whatsapp: '(11) 98765-4321',
        password: 'SenhaForte123!',
        acceptTerms: true,
        newsletter: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'joao@gmail.com',
        firstName: 'João',
        lastName: 'Silva',
        phone: '11987654321',
        kycLevel: 'PLATFORM_ACCESS',
        termsAcceptedAt: new Date(),
        marketingConsent: true,
      });

      const mockResponse = { status: 201, data: {} };
      (ApiResponse.created as jest.Mock).mockReturnValue(mockResponse);

      const request = createRequest(requestData);
      const response = await POST(request);

      // Verificar que o usuário foi criado corretamente
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'joao@gmail.com',
          passwordHash: 'hashed-password',
          firstName: 'João',
          lastName: 'Silva',
          phone: '11987654321',
          kycLevel: 'PLATFORM_ACCESS',
          termsAcceptedAt: expect.any(Date),
          marketingConsent: true,
        },
      });

      // Verificar que as notificações foram enviadas
      expect(smsService.sendVerificationSMS).toHaveBeenCalledWith(
        '(11) 98765-4321',
        'test-token-123'
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        'joao@gmail.com',
        'test-token-123'
      );

      // Verificar que o lead foi capturado
      expect(leadApi.capture).toHaveBeenCalled();

      // Verificar que a inscrição na newsletter foi feita
      expect(newsletterApi.subscribe).toHaveBeenCalledWith({
        email: 'joao@gmail.com',
        name: 'João Silva',
        language: 'pt',
      });

      expect(response).toBe(mockResponse);
    });

    it('deve registrar usuário sem WhatsApp', async () => {
      const requestData = {
        name: 'Maria Santos',
        email: 'maria@gmail.com',
        password: 'SenhaForte123!',
        acceptTerms: true,
        newsletter: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-456',
        email: 'maria@gmail.com',
        firstName: 'Maria',
        lastName: 'Santos',
        kycLevel: 'PLATFORM_ACCESS',
      });

      const mockResponse = { status: 201, data: {} };
      (ApiResponse.created as jest.Mock).mockReturnValue(mockResponse);

      const request = createRequest(requestData);
      await POST(request);

      // Verificar que SMS não foi enviado
      expect(smsService.sendVerificationSMS).not.toHaveBeenCalled();

      // Verificar que email foi enviado
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();

      // Verificar que newsletter não foi assinada
      expect(newsletterApi.subscribe).not.toHaveBeenCalled();
    });
  });

  describe('Casos de Erro', () => {
    it('deve retornar erro de validação para dados inválidos', async () => {
      const requestData = {
        name: 'Jo', // Nome muito curto
        email: 'email-invalido',
        password: '123', // Senha fraca
        acceptTerms: false,
      };

      const mockResponse = { status: 400, error: 'Validation error' };
      (ApiResponse.badRequest as jest.Mock).mockReturnValue(mockResponse);

      const request = createRequest(requestData);
      const response = await POST(request);

      expect(ApiResponse.badRequest).toHaveBeenCalledWith(
        'Dados de registro inválidos',
        'VALIDATION_ERROR',
        expect.any(Array)
      );
      expect(response).toBe(mockResponse);
    });

    it('deve retornar erro de conflito para email já existente', async () => {
      const requestData = {
        name: 'João Silva',
        email: 'existente@gmail.com',
        password: 'SenhaForte123!',
        acceptTerms: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'existente@gmail.com',
      });

      const mockResponse = { status: 409, error: 'User already exists' };
      (ApiResponse.conflict as jest.Mock).mockReturnValue(mockResponse);

      const request = createRequest(requestData);
      const response = await POST(request);

      expect(ApiResponse.conflict).toHaveBeenCalledWith(
        'Este email já está cadastrado',
        'USER_ALREADY_EXISTS'
      );
      expect(response).toBe(mockResponse);
    });

    it('deve retornar erro de conflito para WhatsApp já existente', async () => {
      const requestData = {
        name: 'João Silva',
        email: 'novo@gmail.com',
        whatsapp: '(11) 98765-4321',
        password: 'SenhaForte123!',
        acceptTerms: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        phone: '11987654321',
      });

      const mockResponse = { status: 409, error: 'Phone already exists' };
      (ApiResponse.conflict as jest.Mock).mockReturnValue(mockResponse);

      const request = createRequest(requestData);
      const response = await POST(request);

      expect(ApiResponse.conflict).toHaveBeenCalledWith(
        'Este WhatsApp já está cadastrado',
        'PHONE_ALREADY_EXISTS'
      );
      expect(response).toBe(mockResponse);
    });

    it('deve retornar erro interno em caso de falha no banco de dados', async () => {
      const requestData = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'SenhaForte123!',
        acceptTerms: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const mockResponse = { status: 500, error: 'Internal error' };
      (ApiResponse.internalError as jest.Mock).mockReturnValue(mockResponse);

      const request = createRequest(requestData);
      const response = await POST(request);

      expect(ApiResponse.internalError).toHaveBeenCalledWith(
        'Erro ao criar conta'
      );
      expect(response).toBe(mockResponse);
    });
  });

  describe('Tarefas Assíncronas', () => {
    it('deve continuar o registro mesmo se o envio de SMS falhar', async () => {
      const requestData = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        whatsapp: '(11) 98765-4321',
        password: 'SenhaForte123!',
        acceptTerms: true,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'joao@gmail.com',
        firstName: 'João',
        lastName: 'Silva',
        kycLevel: 'PLATFORM_ACCESS',
      });

      // Simular falha no envio de SMS
      (smsService.sendVerificationSMS as jest.Mock).mockRejectedValue(
        new Error('SMS service unavailable')
      );

      const mockResponse = { status: 201, data: {} };
      (ApiResponse.created as jest.Mock).mockReturnValue(mockResponse);

      const request = createRequest(requestData);
      const response = await POST(request);

      // O registro deve ter sido concluído com sucesso
      expect(response).toBe(mockResponse);
      expect(ApiResponse.created).toHaveBeenCalled();
    });

    it('deve processar UTM parameters quando fornecidos', async () => {
      const requestData = {
        name: 'João Silva',
        email: 'joao@gmail.com',
        password: 'SenhaForte123!',
        acceptTerms: true,
        source: 'landing_page',
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'crypto-trading',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'joao@gmail.com',
        firstName: 'João',
        lastName: 'Silva',
        kycLevel: 'PLATFORM_ACCESS',
      });

      const mockResponse = { status: 201, data: {} };
      (ApiResponse.created as jest.Mock).mockReturnValue(mockResponse);

      const request = createRequest(requestData);
      await POST(request);

      // Verificar que os parâmetros UTM foram passados para o leadApi
      expect(leadApi.capture).toHaveBeenCalledWith(
        expect.objectContaining({
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'crypto-trading',
        })
      );
    });
  });
});