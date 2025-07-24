import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Apenas retornar erro de email duplicado para teste
    if (body.email === 'johnnyhelder@gmail.com') {
      return NextResponse.json({
        success: false,
        error: 'Este email já está cadastrado',
        code: 'USER_ALREADY_EXISTS'
      }, { status: 409 });
    }
    
    // Simular sucesso para outros emails
    return NextResponse.json({
      success: true,
      data: {
        id: 'test-' + Date.now(),
        email: body.email,
        name: body.name,
        message: 'Conta criada com sucesso! (Versão de teste)'
      }
    }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição',
      details: error.message
    }, { status: 500 });
  }
}