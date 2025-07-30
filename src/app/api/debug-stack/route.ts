import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  // Check Stack Auth environment variables
  const stackConfig = {
    hasProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    hasSecretKey: !!process.env.STACK_SECRET_SERVER_KEY,
    projectIdLength: process.env.NEXT_PUBLIC_STACK_PROJECT_ID?.length || 0,
    publishableKeyLength: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?.length || 0,
    secretKeyLength: process.env.STACK_SECRET_SERVER_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    authUrl: process.env.NEXTAUTH_URL || 'not set',
  };

  return apiResponse.success({
    message: 'Stack Auth configuration status',
    config: stackConfig,
    timestamp: new Date().toISOString()
  });
}