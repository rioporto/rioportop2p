import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // API minimal sem dependências para teste
    if (body.email === 'johnnyhelder@gmail.com') {
      return NextResponse.json({
        success: false,
        error: 'Este email já está cadastrado'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso (teste)'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 });
  }
}