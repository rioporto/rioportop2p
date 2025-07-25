import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { 
  createTestUser, 
  deleteTestUser, 
  createTestListing,
  deleteTestListing,
  getAuthHeaders,
  TestUser 
} from '@/test/helpers/auth';

describe('Listings API Route', () => {
  let testUser: TestUser;
  let testListing: any;

  beforeAll(async () => {
    testUser = await createTestUser();
    testListing = await createTestListing(testUser.id);
  });

  afterAll(async () => {
    await deleteTestListing(testListing.id);
    await deleteTestUser(testUser.id);
  });

  describe('GET /api/listings', () => {
    it('should list active listings', async () => {
      const req = new NextRequest('http://localhost:3000/api/listings');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.listings)).toBe(true);
      expect(data.listings.length).toBeGreaterThan(0);

      const listing = data.listings.find((l: any) => l.id === testListing.id);
      expect(listing).toBeDefined();
      expect(listing.cryptoAsset).toBe('BTC');
    });

    it('should filter listings by crypto asset', async () => {
      const req = new NextRequest('http://localhost:3000/api/listings?crypto=BTC');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.listings.every((l: any) => l.cryptoAsset === 'BTC')).toBe(true);
    });

    it('should filter listings by payment method', async () => {
      const req = new NextRequest('http://localhost:3000/api/listings?payment=PIX');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.listings.every((l: any) => l.paymentMethods.includes('PIX'))).toBe(true);
    });

    it('should paginate results', async () => {
      const req = new NextRequest('http://localhost:3000/api/listings?page=1&limit=10');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.listings.length).toBeLessThanOrEqual(10);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.totalPages).toBeDefined();
    });
  });

  describe('POST /api/listings', () => {
    const newListing = {
      type: 'BUY',
      cryptoAsset: 'ETH',
      priceType: 'FIXED',
      price: 5000,
      minAmount: 50,
      maxAmount: 500,
      paymentMethods: ['PIX', 'TED'],
      terms: 'Termos do anúncio de teste',
    };

    it('should require authentication', async () => {
      const req = new NextRequest('http://localhost:3000/api/listings', {
        method: 'POST',
        body: JSON.stringify(newListing),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Não autorizado');
    });

    it('should create new listing', async () => {
      const req = new NextRequest('http://localhost:3000/api/listings', {
        method: 'POST',
        body: JSON.stringify(newListing),
        headers: getAuthHeaders(testUser.token),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.listing).toBeDefined();
      expect(data.listing.cryptoAsset).toBe('ETH');
      expect(data.listing.userId).toBe(testUser.id);

      await deleteTestListing(data.listing.id);
    });

    it('should validate listing data', async () => {
      const invalidListing = {
        ...newListing,
        price: -100, // Preço negativo
        minAmount: 1000,
        maxAmount: 500, // Min > Max
      };

      const req = new NextRequest('http://localhost:3000/api/listings', {
        method: 'POST',
        body: JSON.stringify(invalidListing),
        headers: getAuthHeaders(testUser.token),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
      expect(data.errors).toContain('Preço deve ser positivo');
      expect(data.errors).toContain('Valor mínimo deve ser menor que valor máximo');
    });

    it('should enforce user listing limits', async () => {
      // Criar múltiplos listings até atingir o limite
      const maxListings = 5;
      const listings = [];

      for (let i = 0; i < maxListings; i++) {
        const listing = await createTestListing(testUser.id);
        listings.push(listing);
      }

      // Tentar criar mais um listing
      const req = new NextRequest('http://localhost:3000/api/listings', {
        method: 'POST',
        body: JSON.stringify(newListing),
        headers: getAuthHeaders(testUser.token),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Limite de anúncios atingido');

      // Limpar listings criados
      for (const listing of listings) {
        await deleteTestListing(listing.id);
      }
    });
  });
}); 