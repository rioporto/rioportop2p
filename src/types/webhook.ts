// Webhook event types
export enum WebhookEventType {
  // Payment events
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  
  // KYC events
  KYC_DOCUMENT_UPLOADED = 'kyc.document.uploaded',
  KYC_DOCUMENT_APPROVED = 'kyc.document.approved',
  KYC_DOCUMENT_REJECTED = 'kyc.document.rejected',
  KYC_LEVEL_UPDATED = 'kyc.level.updated',
  
  // Transaction events
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_CANCELLED = 'transaction.cancelled',
  
  // User events
  USER_REGISTERED = 'user.registered',
  USER_VERIFIED = 'user.verified',
  USER_SUSPENDED = 'user.suspended',
  
  // Security events
  SECURITY_LOGIN_SUSPICIOUS = 'security.login.suspicious',
  SECURITY_ACCOUNT_LOCKED = 'security.account.locked',
}