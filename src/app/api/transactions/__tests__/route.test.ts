import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { 
  createTestUser, 
  deleteTestUser, 
  createTestListing,
  deleteTestListing,
  createTestTransaction,
  deleteTestTransaction,
  getAuthHeaders,
  TestUser 
} from '@/test/helpers/auth';

describe('Transactions API Route', () => {
  let buyer: TestUser;
  let seller: TestUser;
  let listing: any;
  let transaction: any;

  beforeAll(async () => {
    buyer = await createTestUser();
    seller = await createTestUser();
    listing = await createTestListing(seller.id);
    transaction = await createTestTransaction(buyer.id, seller.id, listing.id);
  });

  afterAll(async () => {
    await deleteTestTransaction(transaction.id);
    await deleteTestListing(listing.id);
    await deleteTestUser(buyer.id);
    await deleteTestUser(seller.id);
  });

  describe('POST /api/transactions', () => {
    it('should require authentication', async () => {
      const req = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          listingId: listing.id,
          amount: 500,
          paymentMethod: 'PIX',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Não autorizado');
    });

    it('should create new transaction', async () => {
      const req = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          listingId: listing.id,
          amount: 500,
          paymentMethod: 'PIX',
        }),
        headers: getAuthHeaders(buyer.token),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.transaction).toBeDefined();
      expect(data.transaction.buyerId).toBe(buyer.id);
      expect(data.transaction.sellerId).toBe(seller.id);
      expect(data.transaction.status).toBe('PENDING');

      await deleteTestTransaction(data.transaction.id);
    });

    it('should validate transaction amount', async () => {
      const req = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          listingId: listing.id,
          amount: 50, // Abaixo do mínimo
          paymentMethod: 'PIX',
        }),
        headers: getAuthHeaders(buyer.token),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Valor abaixo do mínimo');
    });

    it('should validate payment method', async () => {
      const req = new NextRequest('http://localhost:3000/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          listingId: listing.id,
          amount: 500,
          paymentMethod: 'INVALID',
        }),
        headers: getAuthHeaders(buyer.token),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Método de pagamento inválido');
    });
  });

  describe('GET /api/transactions', () => {
    it('should list user transactions', async () => {
      const req = new NextRequest('http://localhost:3000/api/transactions', {
        headers: getAuthHeaders(buyer.token),
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.transactions)).toBe(true);
      
      const userTransaction = data.transactions.find((t: any) => t.id === transaction.id);
      expect(userTransaction).toBeDefined();
      expect(userTransaction.amount).toBe(500);
    });

    it('should filter transactions by status', async () => {
      const req = new NextRequest('http://localhost:3000/api/transactions?status=PENDING', {
        headers: getAuthHeaders(buyer.token),
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.transactions.every((t: any) => t.status === 'PENDING')).toBe(true);
    });

    it('should filter transactions by role', async () => {
      const req = new NextRequest('http://localhost:3000/api/transactions?role=BUYER', {
        headers: getAuthHeaders(buyer.token),
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.transactions.every((t: any) => t.buyerId === buyer.id)).toBe(true);
    });

    it('should paginate results', async () => {
      const req = new NextRequest('http://localhost:3000/api/transactions?page=1&limit=10', {
        headers: getAuthHeaders(buyer.token),
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.transactions.length).toBeLessThanOrEqual(10);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.totalPages).toBeDefined();
    });
  });
}); 