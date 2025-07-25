import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { createTestUser, deleteTestUser, TestUser } from '@/test/helpers/auth';

describe('Auth API Route', () => {
  let testUser: TestUser;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(testUser.id);
  });

  it('should authenticate with valid credentials', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'Test@1234!',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
  });

  it('should reject invalid password', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrong-password',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Credenciais inválidas');
  });

  it('should reject non-existent user', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'Test@1234!',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Usuário não encontrado');
  });

  it('should require email verification', async () => {
    // Criar usuário sem email verificado
    const unverifiedUser = await createTestUser(
      `unverified-${Date.now()}@example.com`,
      'Unverified User'
    );

    const req = new NextRequest('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      body: JSON.stringify({
        email: unverifiedUser.email,
        password: 'Test@1234!',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email não verificado');

    await deleteTestUser(unverifiedUser.id);
  });

  it('should handle rate limiting', async () => {
    // Tentar login múltiplas vezes
    for (let i = 0; i < 6; i++) {
      const req = new NextRequest('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
          password: 'wrong-password',
        }),
      });

      await POST(req);
    }

    // Tentar mais uma vez deve ser bloqueado
    const req = new NextRequest('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'Test@1234!',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Too Many Requests');
  });
}); 