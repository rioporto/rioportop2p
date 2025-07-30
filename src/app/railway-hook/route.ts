// Webhook ULTRA simples fora da pasta api para evitar qualquer middleware
export async function POST(request: Request) {
  // Log absolutamente tudo
  console.log('=== RAILWAY WEBHOOK ULTRA SIMPLE ===');
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const text = await request.text();
    console.log('Body:', text);
  } catch (e) {
    console.log('No body');
  }
  
  // Retorna 200 com corpo vazio
  return new Response('', { 
    status: 200,
    headers: {
      'Content-Length': '0'
    }
  });
}

export async function GET() {
  return new Response('Railway Webhook OK', { status: 200 });
}