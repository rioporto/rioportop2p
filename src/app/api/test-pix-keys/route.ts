import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api/response';

// GET /api/test-pix-keys - Página de teste do sistema de chaves PIX
export async function GET() {
  return apiResponse.success({
    message: 'Sistema de Chaves PIX - Endpoints de Teste',
    endpoints: {
      validate: {
        method: 'POST',
        url: '/api/user/pix-keys/validate',
        description: 'Valida uma chave PIX antes de cadastrar',
        example: {
          body: {
            pixKey: '12345678901'
          },
          response: {
            valid: true,
            keyType: 'CPF',
            accountHolderName: 'NOME DO TITULAR',
            bankName: 'Banco Exemplo'
          }
        }
      },
      create: {
        method: 'POST',
        url: '/api/user/pix-keys',
        description: 'Cadastra uma nova chave PIX',
        example: {
          body: {
            pixKey: '12345678901',
            setAsDefault: true
          }
        }
      },
      list: {
        method: 'GET',
        url: '/api/user/pix-keys',
        description: 'Lista todas as chaves PIX do usuário'
      },
      update: {
        method: 'PATCH',
        url: '/api/user/pix-keys/{id}',
        description: 'Define uma chave como padrão',
        example: {
          body: {
            setAsDefault: true
          }
        }
      },
      remove: {
        method: 'DELETE',
        url: '/api/user/pix-keys/{id}',
        description: 'Remove (desativa) uma chave PIX'
      }
    },
    testKeys: {
      cpf: '12345678901',
      cnpj: '12345678901234',
      email: 'teste@example.com',
      phone: '+5511999999999',
      evp: '3225bbc6-d62b-4b36-add1-a92f8bec433f'
    },
    notes: [
      '⚠️ Validação atualmente usa dados mockados',
      '🔐 Requer autenticação (Bearer token)',
      '✅ CPF do usuário deve estar verificado',
      '🎯 Chave PIX deve pertencer ao CPF do usuário'
    ]
  });
}