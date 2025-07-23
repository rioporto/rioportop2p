import { ICryptoPriceData } from '@/types/api';

// CoinGecko API configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const DEFAULT_CURRENCY = 'brl';
const CACHE_DURATION = 60 * 1000; // 1 minute cache

// Supported cryptocurrencies
export const SUPPORTED_CRYPTOS = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  tether: 'tether',
  'usd-coin': 'usd-coin',
  'binance-coin': 'binancecoin',
} as const;

export type SupportedCrypto = keyof typeof SUPPORTED_CRYPTOS;

// Cache implementation
interface ICacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private cache = new Map<string, ICacheEntry<T>>();
  private duration: number;

  constructor(duration: number) {
    this.duration = duration;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.duration) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// CoinGecko service class
export class CoinGeckoService {
  private cache = new SimpleCache<any>(CACHE_DURATION);

  private async fetchFromAPI(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${COINGECKO_API_BASE}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw error;
    }
  }

  // Get current price for a single cryptocurrency
  async getPrice(cryptoId: SupportedCrypto, currency = DEFAULT_CURRENCY): Promise<number> {
    const cacheKey = `price_${cryptoId}_${currency}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.fetchFromAPI('/simple/price', {
      ids: SUPPORTED_CRYPTOS[cryptoId],
      vs_currencies: currency,
    });

    const price = data[SUPPORTED_CRYPTOS[cryptoId]]?.[currency];
    if (price === undefined) {
      throw new Error(`Price not available for ${cryptoId}`);
    }

    this.cache.set(cacheKey, price);
    return price;
  }

  // Get multiple cryptocurrency prices
  async getPrices(
    cryptoIds: SupportedCrypto[], 
    currency = DEFAULT_CURRENCY
  ): Promise<Record<string, number>> {
    const cacheKey = `prices_${cryptoIds.join(',')}_${currency}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const ids = cryptoIds.map(id => SUPPORTED_CRYPTOS[id]).join(',');
    const data = await this.fetchFromAPI('/simple/price', {
      ids,
      vs_currencies: currency,
    });

    const prices: Record<string, number> = {};
    cryptoIds.forEach(cryptoId => {
      const price = data[SUPPORTED_CRYPTOS[cryptoId]]?.[currency];
      if (price !== undefined) {
        prices[cryptoId] = price;
      }
    });

    this.cache.set(cacheKey, prices);
    return prices;
  }

  // Get detailed market data
  async getMarketData(
    cryptoIds: SupportedCrypto[], 
    currency = DEFAULT_CURRENCY
  ): Promise<ICryptoPriceData[]> {
    const cacheKey = `market_${cryptoIds.join(',')}_${currency}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const ids = cryptoIds.map(id => SUPPORTED_CRYPTOS[id]).join(',');
    const data = await this.fetchFromAPI('/coins/markets', {
      vs_currency: currency,
      ids,
      order: 'market_cap_desc',
      per_page: '100',
      page: '1',
      sparkline: 'false',
    });

    const marketData: ICryptoPriceData[] = data.map((coin: any) => ({
      id: Object.keys(SUPPORTED_CRYPTOS).find(
        key => SUPPORTED_CRYPTOS[key as SupportedCrypto] === coin.id
      ) || coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      currentPrice: coin.current_price,
      priceChangePercentage24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap || 0,
      volume24h: coin.total_volume || 0,
      lastUpdated: new Date(coin.last_updated),
    }));

    this.cache.set(cacheKey, marketData);
    return marketData;
  }

  // Get price history
  async getPriceHistory(
    cryptoId: SupportedCrypto, 
    days: number, 
    currency = DEFAULT_CURRENCY
  ): Promise<{ timestamp: number; price: number }[]> {
    const cacheKey = `history_${cryptoId}_${days}_${currency}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.fetchFromAPI(
      `/coins/${SUPPORTED_CRYPTOS[cryptoId]}/market_chart`,
      {
        vs_currency: currency,
        days: days.toString(),
      }
    );

    const history = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));

    this.cache.set(cacheKey, history);
    return history;
  }

  // Calculate conversion
  async convertCrypto(
    fromCrypto: SupportedCrypto,
    toCurrency: string,
    amount: number
  ): Promise<{ price: number; total: number }> {
    const price = await this.getPrice(fromCrypto, toCurrency);
    return {
      price,
      total: price * amount,
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const coinGeckoService = new CoinGeckoService();