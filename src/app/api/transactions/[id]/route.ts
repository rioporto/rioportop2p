import { NextRequest } from 'next/server';
import { PATCH, getTransaction } from '../route';

// Re-export PATCH from parent route
export { PATCH };

// Re-export GET as the named export
export const GET = getTransaction;