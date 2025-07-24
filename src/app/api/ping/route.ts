export async function GET() {
  return new Response('pong', { status: 200 });
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'pong' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}