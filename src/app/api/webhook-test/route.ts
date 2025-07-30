import { NextRequest } from 'next/server';

// Webhook super simples para testar Railway
export async function POST(req: NextRequest) {
  console.log('=== WEBHOOK TEST RECEIVED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    const body = await req.text();
    console.log('Body:', body);
  } catch (e) {
    console.log('Could not read body:', e);
  }
  
  // Sempre retorna 200 OK
  return new Response('OK', { status: 200 });
}

export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'Webhook test endpoint is working!',
    message: 'Use POST to test webhook'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}