import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/lib/api/response';
import { withMiddleware } from '@/lib/api/middleware';
import { coinGeckoService, SUPPORTED_CRYPTOS, SupportedCrypto } from '@/services/coingecko';
import { API_ERROR_CODES } from '@/types/api';

// Validation schemas
const pricesQuerySchema = z.object({
  ids: z.string().optional(),
  currency: z.string().default('brl'),
  detailed: z.string().transform(val => val === 'true').optional(),
});

const quoteQuerySchema = z.object({
  from: z.enum(Object.keys(SUPPORTED_CRYPTOS) as [SupportedCrypto, ...SupportedCrypto[]]),
  to: z.string().default('brl'),
  amount: z.string().regex(/^\d+(\.\d+)?$/).transform(Number),
});

// GET /api/crypto/prices - Get cryptocurrency prices
export const GET = withMiddleware(
  async (req: NextRequest & { validatedQuery?: any }) => {
    const { ids, currency, detailed } = req.validatedQuery!;

    try {
      // Parse crypto IDs
      let cryptoIds: SupportedCrypto[];
      
      if (ids) {
        const requestedIds = ids.split(',');
        cryptoIds = requestedIds.filter((id: string): id is SupportedCrypto => 
          id in SUPPORTED_CRYPTOS
        );
        
        if (cryptoIds.length === 0) {
          return ApiResponse.badRequest(
            'No valid cryptocurrency IDs provided',
            API_ERROR_CODES.INVALID_CRYPTOCURRENCY
          );
        }
      } else {
        // Return all supported cryptocurrencies
        cryptoIds = Object.keys(SUPPORTED_CRYPTOS) as SupportedCrypto[];
      }

      // Get prices
      if (detailed) {
        const marketData = await coinGeckoService.getMarketData(cryptoIds, currency);
        return ApiResponse.success(marketData);
      } else {
        const prices = await coinGeckoService.getPrices(cryptoIds, currency);
        return ApiResponse.success(prices);
      }
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
      return ApiResponse.error(
        API_ERROR_CODES.PRICE_UNAVAILABLE,
        'Failed to fetch cryptocurrency prices',
        503
      );
    }
  },
  { validateQuery: pricesQuerySchema }
);

// GET /api/crypto/prices/quote - Get conversion quote
export const POST = withMiddleware(
  async (req: NextRequest) => {
    const body = await req.json();
    const validatedData = quoteQuerySchema.parse(body);
    const { from, to, amount } = validatedData;

    try {
      // Get current price
      const conversion = await coinGeckoService.convertCrypto(from, to, amount);
      
      // Apply exchange fee (2.5%)
      const feeRate = 0.025;
      const fee = conversion.total * feeRate;
      const totalWithFee = conversion.total - fee;

      // Create quote
      const quote = {
        from,
        to,
        amount,
        price: conversion.price,
        subtotal: conversion.total,
        fee,
        total: totalWithFee,
        feePercentage: feeRate * 100,
        expiresAt: new Date(Date.now() + 60 * 1000), // 1 minute expiry
      };

      return ApiResponse.success(quote);
    } catch (error) {
      console.error('Failed to generate quote:', error);
      return ApiResponse.error(
        API_ERROR_CODES.PRICE_UNAVAILABLE,
        'Failed to generate quote',
        503
      );
    }
  }
);

// GET /api/crypto/prices/history - Get price history
export const history = withMiddleware(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const cryptoId = searchParams.get('id') as SupportedCrypto | null;
    const days = parseInt(searchParams.get('days') || '7');
    const currency = searchParams.get('currency') || 'brl';

    if (!cryptoId || !(cryptoId in SUPPORTED_CRYPTOS)) {
      return ApiResponse.badRequest(
        'Invalid cryptocurrency ID',
        API_ERROR_CODES.INVALID_CRYPTOCURRENCY
      );
    }

    if (days < 1 || days > 365) {
      return ApiResponse.badRequest('Days must be between 1 and 365');
    }

    try {
      const history = await coinGeckoService.getPriceHistory(cryptoId, days, currency);
      return ApiResponse.success(history);
    } catch (error) {
      console.error('Failed to fetch price history:', error);
      return ApiResponse.error(
        API_ERROR_CODES.PRICE_UNAVAILABLE,
        'Failed to fetch price history',
        503
      );
    }
  }
);