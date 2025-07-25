// Configuração de rotas da API
export const API_ROUTES = {
  // Rotas públicas que não requerem autenticação
  public: [
    '/api/auth/[...nextauth]',
    '/api/auth/verify-email',
    '/api/auth/register',
    '/api/ping',
    '/api/health',
    '/api/listings', // Apenas GET é público
    '/api/crypto/prices',
    '/api/newsletter',
    '/api/lead'
  ],

  // Rotas que requerem autenticação
  protected: [
    '/api/users',
    '/api/users/me',
    '/api/transactions',
    '/api/kyc',
    '/api/chat',
    '/api/payments',
    '/api/ratings',
    '/api/listings/[id]', // Operações específicas em listings requerem auth
  ],

  // Rotas que requerem autenticação e nível específico de KYC
  kycRequired: {
    level1: [
      '/api/transactions/create',
      '/api/listings/create'
    ],
    level2: [
      '/api/transactions/high-value',
      '/api/listings/high-value'
    ]
  },

  // Rotas que requerem permissões de admin
  adminOnly: [
    '/api/admin',
    '/api/users/manage',
    '/api/kyc/review'
  ]
}; 