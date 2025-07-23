# API Documentation - Rio Porto P2P Exchange

## Base URL
```
http://localhost:3000/api
```

## Response Format
All API responses follow this structure:
```typescript
{
  success: boolean;
  data?: any;        // Present on success
  error?: {          // Present on error
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}
```

## Authentication
Most endpoints require authentication via Bearer token:
```
Authorization: Bearer <token>
```

## Rate Limiting
- Default: 60 requests per minute per IP
- Payments: 10 requests per minute
- Transactions: 20 requests per minute

## Endpoints

### Users

#### List Users (Admin Only)
```
GET /api/users
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - sortBy: string (createdAt|name|email)
  - sortOrder: string (asc|desc)
```

#### Create User
```
POST /api/users
Body:
{
  "email": "string",
  "name": "string",
  "password": "string"
}
```

#### Update User
```
PATCH /api/users/:id
Body:
{
  "name": "string",
  "cpf": "string"
}
```

#### Delete User (Admin Only)
```
DELETE /api/users/:id
```

### KYC (Know Your Customer)

#### Get User's Documents
```
GET /api/kyc
Headers: Authorization required
```

#### Upload Document
```
POST /api/kyc
Headers: Authorization required
Content-Type: multipart/form-data
Body:
  - file: File (JPEG, PNG, PDF - max 5MB)
  - type: string (RG|CNH|PASSPORT|SELFIE|PROOF_OF_ADDRESS)
```

#### Update Document Status (Admin Only)
```
PATCH /api/kyc/:id
Body:
{
  "status": "APPROVED|REJECTED",
  "reason": "string" // Required for rejection
}
```

### Cryptocurrency Prices

#### Get Prices
```
GET /api/crypto/prices
Query Parameters:
  - ids: string (comma-separated crypto IDs)
  - currency: string (default: brl)
  - detailed: boolean (include market data)

Supported Cryptocurrencies:
  - bitcoin
  - ethereum
  - tether
  - usd-coin
  - binance-coin
```

#### Get Quote
```
POST /api/crypto/prices
Body:
{
  "from": "bitcoin|ethereum|...",
  "to": "brl",
  "amount": number
}

Response includes:
  - price: Current price
  - subtotal: Amount * price
  - fee: Exchange fee (2.5%)
  - total: Final amount after fee
  - expiresAt: Quote expiration time
```

#### Get Price History
```
GET /api/crypto/prices/history
Query Parameters:
  - id: string (cryptocurrency ID)
  - days: number (1-365)
  - currency: string (default: brl)
```

### PIX Payments

#### List User's Payments
```
GET /api/payments/pix
Headers: Authorization required
```

#### Create PIX Payment
```
POST /api/payments/pix
Headers: Authorization required
Body:
{
  "amount": number (min: 10),
  "description": "string",
  "transactionId": "string"
}

KYC Requirements:
  - Level 1 (Basic): Up to R$ 1,000
  - Level 2 (Intermediate): Up to R$ 5,000
  - Level 3 (Advanced): Up to R$ 50,000
```

#### Get Payment Status
```
GET /api/payments/pix/:id
Headers: Authorization required
```

#### Webhook (MercadoPago)
```
POST /api/payments/pix/webhook
Headers:
  - x-signature: string
  - x-request-id: string
```

### Transactions

#### List Transactions
```
GET /api/transactions
Headers: Authorization required
Query Parameters:
  - page: number
  - limit: number
  - type: BUY|SELL
  - status: PENDING|PROCESSING|COMPLETED|CANCELLED|FAILED
  - startDate: ISO datetime
  - endDate: ISO datetime
```

#### Create Transaction
```
POST /api/transactions
Headers: Authorization required
Body:
{
  "type": "BUY|SELL",
  "cryptocurrency": "bitcoin|ethereum|...",
  "cryptoAmount": number,
  "fiatAmount": number,
  "paymentMethod": "PIX"
}

Daily Limits by KYC Level:
  - Level 1: R$ 5,000 / 10 transactions
  - Level 2: R$ 25,000 / 50 transactions
  - Level 3: R$ 250,000 / 200 transactions
```

#### Get Transaction
```
GET /api/transactions/:id
Headers: Authorization required
```

#### Update Transaction Status
```
PATCH /api/transactions/:id
Headers: Authorization required
Body:
{
  "status": "PROCESSING|COMPLETED|CANCELLED|FAILED",
  "paymentId": "string"
}
```

## Error Codes

### General Errors
- `INTERNAL_ERROR`: Internal server error
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests

### User Errors
- `USER_ALREADY_EXISTS`: Email already registered
- `INVALID_CREDENTIALS`: Invalid login credentials
- `INSUFFICIENT_KYC_LEVEL`: Higher KYC level required

### KYC Errors
- `INVALID_DOCUMENT_TYPE`: Invalid document type
- `DOCUMENT_ALREADY_SUBMITTED`: Document pending review
- `INVALID_FILE_FORMAT`: File type not supported
- `FILE_TOO_LARGE`: File exceeds size limit

### Crypto Errors
- `INVALID_CRYPTOCURRENCY`: Unsupported cryptocurrency
- `PRICE_UNAVAILABLE`: Price data unavailable
- `QUOTE_EXPIRED`: Price quote has expired

### Payment Errors
- `PAYMENT_FAILED`: Payment processing failed
- `INVALID_PIX_KEY`: Invalid PIX key format

### Transaction Errors
- `INSUFFICIENT_BALANCE`: Insufficient balance
- `TRANSACTION_LIMIT_EXCEEDED`: Limit exceeded
- `INVALID_AMOUNT`: Invalid transaction amount

## Security Notes

1. **Authentication**: All user-specific endpoints require authentication
2. **Rate Limiting**: Implemented to prevent abuse
3. **Input Validation**: All inputs are validated using Zod schemas
4. **KYC Levels**: Transaction limits based on verification level
5. **HTTPS**: Always use HTTPS in production

## Development

### Environment Variables
```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_public_key
MERCADOPAGO_ACCESS_TOKEN=your_access_token
```

### Testing
Use tools like Postman or curl to test endpoints:

```bash
# Get crypto prices
curl http://localhost:3000/api/crypto/prices?ids=bitcoin,ethereum

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
```