import { POST } from '../route';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    verificationToken: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, init, json: true })),
  },
}));

describe('POST /api/auth/verify-email', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any): Request => {
    return {
      json: async () => body,
    } as Request;
  };

  describe('Casos de Sucesso', () => {
    it('deve verificar email com token válido', async () => {
      const mockToken = {
        token: 'valid-token-123',
        identifier: 'user@gmail.com',
        expires: new Date(Date.now() + 3600000), // 1 hora no futuro
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@gmail.com',
        emailVerified: new Date(),
      };

      (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (prisma.verificationToken.delete as jest.Mock).mockResolvedValue(mockToken);

      const request = createRequest({ token: 'valid-token-123' });
      const response = await POST(request);

      // Verificar que o token foi buscado
      expect(prisma.verificationToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'valid-token-123' },
      });

      // Verificar que o usuário foi atualizado
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'user@gmail.com' },
        data: { emailVerified: expect.any(Date) },
      });

      // Verificar que o token foi deletado
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { token: 'valid-token-123' },
      });

      // Verificar resposta de sucesso
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: {
            message: 'Email verificado com sucesso',
            user: {
              id: 'user-123',
              email: 'user@gmail.com',
              emailVerified: mockUser.emailVerified,
            },
          },
        }
      );
    });
  });

  describe('Casos de Erro', () => {
    it('deve retornar erro para token inválido', async () => {
      (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createRequest({ token: 'invalid-token' });
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token de verificação inválido',
          },
        },
        { status: 400 }
      );

      // Não deve tentar atualizar usuário ou deletar token
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.verificationToken.delete).not.toHaveBeenCalled();
    });

    it('deve retornar erro para token expirado', async () => {
      const expiredToken = {
        token: 'expired-token-123',
        identifier: 'user@gmail.com',
        expires: new Date(Date.now() - 3600000), // 1 hora no passado
      };

      (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(expiredToken);
      (prisma.verificationToken.delete as jest.Mock).mockResolvedValue(expiredToken);

      const request = createRequest({ token: 'expired-token-123' });
      await POST(request);

      // Verificar que o token expirado foi deletado
      expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { token: 'expired-token-123' },
      });

      // Verificar resposta de erro
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'EXPIRED_TOKEN',
            message: 'Token de verificação expirado',
          },
        },
        { status: 400 }
      );

      // Não deve atualizar o usuário
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('deve retornar erro de validação para dados inválidos', async () => {
      const request = createRequest({ invalidField: 'value' }); // Sem campo 'token'
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: expect.any(Array),
          },
        },
        { status: 400 }
      );
    });

    it('deve retornar erro interno em caso de falha no banco de dados', async () => {
      const mockToken = {
        token: 'valid-token-123',
        identifier: 'user@gmail.com',
        expires: new Date(Date.now() + 3600000),
      };

      (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
      (prisma.user.update as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createRequest({ token: 'valid-token-123' });
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao verificar email',
          },
        },
        { status: 500 }
      );
    });
  });

  describe('Casos Extremos', () => {
    it('deve lidar com token vazio', async () => {
      const request = createRequest({ token: '' });
      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: expect.any(Array),
          },
        },
        { status: 400 }
      );
    });

    it('deve garantir que token não seja reutilizado após verificação', async () => {
      const mockToken = {
        token: 'single-use-token',
        identifier: 'user@gmail.com',
        expires: new Date(Date.now() + 3600000),
      };

      const mockUser = {
        id: 'user-123',
        email: 'user@gmail.com',
        emailVerified: new Date(),
      };

      // Primeira tentativa - sucesso
      (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(mockToken);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (prisma.verificationToken.delete as jest.Mock).mockResolvedValue(mockToken);

      const request1 = createRequest({ token: 'single-use-token' });
      await POST(request1);

      // Segunda tentativa - token não existe mais
      (prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(null);

      const request2 = createRequest({ token: 'single-use-token' });
      await POST(request2);

      // Verificar que a segunda tentativa retorna erro de token inválido
      expect(NextResponse.json).toHaveBeenLastCalledWith(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token de verificação inválido',
          },
        },
        { status: 400 }
      );
    });
  });
});