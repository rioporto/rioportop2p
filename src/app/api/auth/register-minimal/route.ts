import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Retornar erro fixo para email do Johnny
  if (body.email === 'johnnyhelder@gmail.com') {
    return NextResponse.json({
      success: false,
      error: 'Este email já está cadastrado'
    }, { status: 409 });
  }
  
  // Sucesso fake para outros emails
  return NextResponse.json({
    success: true,
    message: 'Conta criada (teste)'
  }, { status: 201 });
}