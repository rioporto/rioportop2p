/**
 * Rate Limiter Utility
 * Implementa controle de taxa de requisições para evitar erros 529
 */

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  delayAfter?: number;
  delayMs?: number;
}

interface QueueItem<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class RateLimiter {
  private queue: Array<QueueItem<any>> = [];
  private processing = false;
  private requests: Map<string, number[]> = new Map();
  
  public readonly maxRequests: number;
  public readonly windowMs: number;
  private readonly delayAfter: number;
  private readonly delayMs: number;
  
  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
    this.delayAfter = options.delayAfter || Math.floor(options.maxRequests * 0.8);
    this.delayMs = options.delayMs || 100;
  }
  
  /**
   * Executa uma função com rate limiting
   */
  async execute<T>(fn: () => Promise<T>, identifier: string = 'default'): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      
      if (!this.processing) {
        this.processQueue(identifier);
      }
    });
  }
  
  /**
   * Verifica se uma requisição pode ser feita
   */
  async check(identifier: string = 'default'): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove requisições antigas
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      throw new Error(`Rate limit exceeded: ${validRequests.length}/${this.maxRequests} requests in ${this.windowMs}ms`);
    }
    
    // Adiciona a requisição atual
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  /**
   * Processa a fila de requisições
   */
  private async processQueue(identifier: string) {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) continue;
      
      try {
        // Verifica rate limit
        await this.check(identifier);
        
        // Calcula delay se necessário
        const requestCount = (this.requests.get(identifier) || []).length;
        const delay = requestCount > this.delayAfter ? this.delayMs : 0;
        
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Executa a função
        const result = await item.fn();
        item.resolve(result);
        
      } catch (error) {
        item.reject(error);
      }
    }
    
    this.processing = false;
  }
  
  /**
   * Limpa o histórico de requisições
   */
  clear(identifier?: string) {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
  
  /**
   * Retorna estatísticas do rate limiter
   */
  getStats(identifier: string = 'default') {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return {
      current: validRequests.length,
      max: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      resetAt: validRequests.length > 0 
        ? new Date(validRequests[0] + this.windowMs)
        : null,
      queueSize: this.queue.length,
    };
  }
}

/**
 * Rate limiter com sliding window
 * Mais preciso que o rate limiter básico
 */
export class SlidingWindowRateLimiter extends RateLimiter {
  private buckets: Map<string, Map<number, number>> = new Map();
  private bucketSize: number;
  
  constructor(options: RateLimiterOptions & { bucketSize?: number }) {
    super(options);
    // Divide a janela em buckets menores para maior precisão
    this.bucketSize = options.bucketSize || Math.max(1000, this.windowMs / 10);
  }
  
  async check(identifier: string = 'default'): Promise<boolean> {
    const now = Date.now();
    const currentBucket = Math.floor(now / this.bucketSize);
    
    // Obtém ou cria o mapa de buckets para o identifier
    if (!this.buckets.has(identifier)) {
      this.buckets.set(identifier, new Map());
    }
    
    const userBuckets = this.buckets.get(identifier)!;
    
    // Remove buckets antigos
    const oldestValidBucket = currentBucket - Math.ceil(this.windowMs / this.bucketSize);
    for (const [bucket] of userBuckets) {
      if (bucket < oldestValidBucket) {
        userBuckets.delete(bucket);
      }
    }
    
    // Conta requisições totais na janela
    let totalRequests = 0;
    for (const [bucket, count] of userBuckets) {
      if (bucket >= oldestValidBucket) {
        totalRequests += count;
      }
    }
    
    if (totalRequests >= this.maxRequests) {
      throw new Error(`Rate limit exceeded: ${totalRequests}/${this.maxRequests} requests in sliding window`);
    }
    
    // Adiciona a requisição atual
    userBuckets.set(currentBucket, (userBuckets.get(currentBucket) || 0) + 1);
    
    return true;
  }
  
  getStats(identifier: string = 'default') {
    const now = Date.now();
    const currentBucket = Math.floor(now / this.bucketSize);
    const oldestValidBucket = currentBucket - Math.ceil(this.windowMs / this.bucketSize);
    
    const userBuckets = this.buckets.get(identifier) || new Map();
    
    let totalRequests = 0;
    let oldestRequest = Infinity;
    
    for (const [bucket, count] of userBuckets) {
      if (bucket >= oldestValidBucket) {
        totalRequests += count;
        oldestRequest = Math.min(oldestRequest, bucket * this.bucketSize);
      }
    }
    
    return {
      current: totalRequests,
      max: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - totalRequests),
      resetAt: oldestRequest < Infinity 
        ? new Date(oldestRequest + this.windowMs)
        : null,
      queueSize: this.queue.length,
    };
  }
}

/**
 * Token Bucket Rate Limiter
 * Permite burst de requisições até o limite do bucket
 */
export class TokenBucketRateLimiter {
  private tokens: Map<string, { count: number; lastRefill: number }> = new Map();
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens por segundo
  
  constructor(options: { maxTokens: number; refillRate: number }) {
    this.maxTokens = options.maxTokens;
    this.refillRate = options.refillRate;
  }
  
  async check(identifier: string = 'default', tokensRequired: number = 1): Promise<boolean> {
    const now = Date.now();
    const bucket = this.tokens.get(identifier) || { 
      count: this.maxTokens, 
      lastRefill: now 
    };
    
    // Calcula tokens a adicionar baseado no tempo decorrido
    const timePassed = (now - bucket.lastRefill) / 1000; // em segundos
    const tokensToAdd = timePassed * this.refillRate;
    
    // Atualiza o bucket
    bucket.count = Math.min(this.maxTokens, bucket.count + tokensToAdd);
    bucket.lastRefill = now;
    
    // Verifica se há tokens suficientes
    if (bucket.count < tokensRequired) {
      this.tokens.set(identifier, bucket);
      throw new Error(`Insufficient tokens: ${bucket.count}/${tokensRequired} required`);
    }
    
    // Consome os tokens
    bucket.count -= tokensRequired;
    this.tokens.set(identifier, bucket);
    
    return true;
  }
  
  async execute<T>(
    fn: () => Promise<T>, 
    identifier: string = 'default',
    tokensRequired: number = 1
  ): Promise<T> {
    await this.check(identifier, tokensRequired);
    return fn();
  }
  
  getStats(identifier: string = 'default') {
    const now = Date.now();
    const bucket = this.tokens.get(identifier) || { 
      count: this.maxTokens, 
      lastRefill: now 
    };
    
    // Calcula tokens atuais
    const timePassed = (now - bucket.lastRefill) / 1000;
    const currentTokens = Math.min(
      this.maxTokens, 
      bucket.count + (timePassed * this.refillRate)
    );
    
    return {
      current: Math.floor(currentTokens),
      max: this.maxTokens,
      refillRate: this.refillRate,
      nextTokenIn: currentTokens < this.maxTokens 
        ? Math.ceil((1 - (currentTokens % 1)) / this.refillRate * 1000)
        : 0,
    };
  }
}

/**
 * Factory para criar rate limiters
 */
export function createRateLimiter(
  type: 'basic' | 'sliding' | 'token',
  options: any
): RateLimiter | TokenBucketRateLimiter {
  switch (type) {
    case 'sliding':
      return new SlidingWindowRateLimiter(options);
    case 'token':
      return new TokenBucketRateLimiter(options);
    default:
      return new RateLimiter(options);
  }
}

// Exporta instâncias pré-configuradas para uso comum
export const defaultRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minuto
  delayAfter: 80,
  delayMs: 100,
});

export const strictRateLimiter = new SlidingWindowRateLimiter({
  maxRequests: 50,
  windowMs: 60000,
  delayAfter: 40,
  delayMs: 200,
  bucketSize: 1000, // buckets de 1 segundo
});

export const burstRateLimiter = new TokenBucketRateLimiter({
  maxTokens: 20,
  refillRate: 2, // 2 tokens por segundo
});