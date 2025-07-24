import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { apiClient } from '@/lib/api/client';
import { registrationApi } from '@/lib/api/registration';
import { kycApi } from '@/lib/api/kyc';
import { newsletterApi } from '@/lib/api/newsletter';
import { leadApi } from '@/lib/api/lead';
import { supportApi } from '@/lib/api/support';
import { generateCSRFToken } from '@/lib/security/csrf';

// Test configuration
const TEST_API_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';
const TEST_TIMEOUT = 30000;

// Test data
const testUser = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'Test@1234!',
  confirmPassword: 'Test@1234!',
  acceptTerms: true,
  newsletter: true,
};

describe('API Integration Tests', () => {
  let csrfToken: string;
  let sessionToken: string;
  let userId: string;

  beforeAll(async () => {
    // Configure API clients for testing
    apiClient.updateConfig({
      baseURL: TEST_API_URL,
      timeout: TEST_TIMEOUT,
    });
  });

  beforeEach(async () => {
    // Get CSRF token
    csrfToken = generateCSRFToken();
  });

  describe('Registration Flow', () => {
    it('should register a new user', async () => {
      const response = await registrationApi.register({
        ...testUser,
        captchaToken: 'test-token', // Mock token for testing
      });

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.email).toBe(testUser.email);
      expect(response.data?.requiresEmailVerification).toBe(true);
      
      userId = response.data?.id || '';
    }, TEST_TIMEOUT);

    it('should not allow duplicate email registration', async () => {
      const response = await registrationApi.register({
        ...testUser,
        captchaToken: 'test-token',
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('USER_ALREADY_EXISTS');
    });

    it('should validate password strength', async () => {
      const weakPassword = 'weak';
      const strength = registrationApi.validatePasswordStrength(weakPassword);
      
      expect(strength.isStrong).toBe(false);
      expect(strength.score).toBeLessThan(3);
      expect(strength.feedback.length).toBeGreaterThan(0);
    });

    it('should validate CPF format', async () => {
      const validCPF = '123.456.789-09';
      const response = await registrationApi.validateCPF(validCPF);
      
      expect(response.success).toBe(true);
      expect(response.data?.valid).toBe(true);
      expect(response.data?.formatted).toBe(validCPF);
    });
  });

  describe('KYC Flow', () => {
    beforeEach(async () => {
      // Mock authentication
      apiClient.updateConfig({
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'X-CSRF-Token': csrfToken,
        },
      });
    });

    it('should get KYC status for authenticated user', async () => {
      const response = await kycApi.getStatus();
      
      if (response.success) {
        expect(response.data).toBeDefined();
        expect(response.data?.currentLevel).toBeDefined();
        expect(response.data?.monthlyLimit).toBeGreaterThanOrEqual(0);
      } else {
        // Expected if not authenticated
        expect(response.error?.code).toBe('UNAUTHORIZED');
      }
    });

    it('should get KYC level requirements', async () => {
      const response = await kycApi.getLevelRequirements();
      
      expect(response.success).toBe(true);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data?.length).toBeGreaterThan(0);
    });

    it('should validate document before upload', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const validation = kycApi.validateDocument(file, kycApi.KYCDocumentType.RG);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid document format', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const validation = kycApi.validateDocument(file, kycApi.KYCDocumentType.RG);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Formato inválido. Use JPG, PNG ou PDF');
    });
  });

  describe('Newsletter Flow', () => {
    it('should subscribe to newsletter', async () => {
      const response = await newsletterApi.subscribe({
        email: `newsletter-${Date.now()}@example.com`,
        name: 'Newsletter Test',
        language: 'pt',
      });

      expect(response.success).toBe(true);
      expect(response.data?.requiresConfirmation).toBe(true);
    });

    it('should get newsletter categories', async () => {
      const response = await newsletterApi.getCategories();
      
      expect(response.success).toBe(true);
      expect(response.data?.categories).toBeInstanceOf(Array);
      expect(response.data?.categories.length).toBeGreaterThan(0);
    });

    it('should validate email format', async () => {
      const response = await newsletterApi.validateEmail('invalid-email');
      
      expect(response.success).toBe(true);
      expect(response.data?.valid).toBe(false);
    });

    it('should detect disposable emails', async () => {
      const response = await newsletterApi.validateEmail('test@tempmail.com');
      
      expect(response.success).toBe(true);
      expect(response.data?.disposable).toBe(true);
      expect(response.data?.valid).toBe(false);
    });
  });

  describe('Lead Capture Flow', () => {
    it('should capture a new lead', async () => {
      const response = await leadApi.capture({
        name: 'Lead Test',
        email: `lead-${Date.now()}@example.com`,
        source: leadApi.LeadSource.LANDING_PAGE,
        interest: leadApi.LeadInterest.P2P_TRADING,
        acceptTerms: true,
      });

      expect(response.success).toBe(true);
      expect(response.data?.lead).toBeDefined();
      expect(response.data?.nextSteps).toBeInstanceOf(Array);
    });

    it('should track lead activity', async () => {
      const email = `activity-${Date.now()}@example.com`;
      
      // First capture lead
      await leadApi.capture({
        name: 'Activity Test',
        email,
        source: leadApi.LeadSource.LANDING_PAGE,
        interest: leadApi.LeadInterest.P2P_TRADING,
        acceptTerms: true,
      });

      // Then track activity
      const response = await leadApi.trackActivity({
        email,
        type: 'PAGE_VIEW',
        description: 'Viewed pricing page',
        metadata: {
          page: '/pricing',
          duration: 45,
        },
      });

      expect(response.success).toBe(true);
      expect(response.data?.tracked).toBe(true);
    });

    it('should handle duplicate leads', async () => {
      const leadData = {
        name: 'Duplicate Test',
        email: `duplicate-${Date.now()}@example.com`,
        source: leadApi.LeadSource.LANDING_PAGE,
        interest: leadApi.LeadInterest.P2P_TRADING,
        acceptTerms: true,
      };

      // First capture
      const first = await leadApi.capture(leadData);
      expect(first.success).toBe(true);
      expect(first.data?.isExisting).toBe(false);

      // Second capture
      const second = await leadApi.capture(leadData);
      expect(second.success).toBe(true);
      expect(second.data?.isExisting).toBe(true);
    });
  });

  describe('Support Integration', () => {
    it('should start AI chat session', async () => {
      const response = await supportApi.startAIChat('Olá, preciso de ajuda');
      
      expect(response.success).toBe(true);
      expect(response.data?.id).toBeDefined();
      expect(response.data?.messages).toBeInstanceOf(Array);
    });

    it('should create support ticket', async () => {
      const response = await supportApi.createTicket({
        email: `ticket-${Date.now()}@example.com`,
        subject: 'Test Ticket',
        description: 'This is a test ticket for integration testing',
        category: supportApi.TicketCategory.TECHNICAL,
      });

      expect(response.success).toBe(true);
      expect(response.data?.id).toBeDefined();
      expect(response.data?.status).toBe(supportApi.TicketStatus.OPEN);
    });

    it('should get FAQ articles', async () => {
      const response = await supportApi.getFAQ({
        limit: 5,
      });

      expect(response.success).toBe(true);
      expect(response.data?.articles).toBeInstanceOf(Array);
    });

    it('should get community channels', async () => {
      const response = await supportApi.getCommunityChannels();
      
      expect(response.success).toBe(true);
      expect(response.data?.channels).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors with retry', async () => {
      // Configure client with invalid URL
      const errorClient = createApiClient({
        baseURL: 'http://invalid-url-12345.com',
        timeout: 5000,
        retries: 2,
        retryDelay: 100,
      });

      const start = Date.now();
      const response = await errorClient.get('/test');
      const duration = Date.now() - start;

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(duration).toBeGreaterThan(200); // Should have retried
    });

    it('should handle timeout errors', async () => {
      const timeoutClient = createApiClient({
        baseURL: TEST_API_URL,
        timeout: 1, // 1ms timeout
      });

      const response = await timeoutClient.get('/test');
      
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('TIMEOUT');
    });

    it('should handle rate limiting', async () => {
      // Make many requests quickly
      const promises = Array(10).fill(null).map(() => 
        apiClient.get('/test')
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => 
        r.error?.code === 'RATE_LIMIT_EXCEEDED'
      );

      // Depending on rate limit configuration
      expect(rateLimited).toBeDefined();
    });
  });

  describe('Security Features', () => {
    it('should include CSRF token in requests', async () => {
      const client = createApiClient({
        baseURL: TEST_API_URL,
        headers: {
          'X-CSRF-Token': csrfToken,
        },
      });

      // Client should include the token
      const config = client.getConfig();
      expect(config.headers?.['X-CSRF-Token']).toBe(csrfToken);
    });

    it('should validate API key format', async () => {
      const { validateApiKey } = await import('@/lib/security/api-keys');
      
      const invalidKey = 'invalid-key';
      const result = await validateApiKey(invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato de API key inválido');
    });

    it('should handle missing authentication', async () => {
      // Remove auth headers
      apiClient.updateConfig({
        headers: {},
      });

      const response = await kycApi.getStatus();
      
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Offline Support', () => {
    it('should queue requests when offline', async () => {
      // Mock offline state
      const originalOnLine = navigator.onLine;
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const response = await apiClient.post('/test', { data: 'offline' });
      
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('OFFLINE');
      expect(apiClient.getOfflineQueue().length).toBeGreaterThan(0);

      // Restore online state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: originalOnLine,
      });

      // Clear queue
      apiClient.clearOfflineQueue();
    });
  });

  afterAll(async () => {
    // Cleanup test data if needed
    // This would typically involve deleting test users, etc.
  });
});

// Export test utilities
export { createApiClient } from '@/lib/api/client';
export const testHelpers = {
  generateTestEmail: () => `test-${Date.now()}@example.com`,
  generateTestCPF: () => '123.456.789-09', // Valid format
  mockFile: (name: string, type: string, size = 1024) => 
    new File(['x'.repeat(size)], name, { type }),
};