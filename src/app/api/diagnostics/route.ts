import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const diagnostics = {
    success: true,
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
    },
    runtime: {
      version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    },
    memory: process.memoryUsage(),
  };

  return NextResponse.json(diagnostics);
}

export async function POST(req: NextRequest) {
  let body = null;
  let parseError = null;
  
  try {
    body = await req.json();
  } catch (error: any) {
    parseError = error.message;
  }

  const diagnostics = {
    success: true,
    timestamp: new Date().toISOString(),
    method: 'POST',
    contentType: req.headers.get('content-type'),
    contentLength: req.headers.get('content-length'),
    body: body,
    parseError: parseError,
    rawBody: parseError ? 'Unable to parse' : 'Parsed successfully',
  };

  return NextResponse.json(diagnostics);
}