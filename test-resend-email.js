// Script para testar envio de email com Resend
// Execute com: node test-resend-email.js

require('dotenv').config({ path: '.env' });

async function testResendEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@rioporto.com.br';
  
  if (!apiKey) {
    console.error('❌ ERRO: RESEND_API_KEY não está configurado no .env');
    console.log('💡 Verifique se existe RESEND_API_KEY no arquivo .env');
    process.exit(1);
  }
  
  console.log('📧 Testando envio de email com Resend...');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('From Email:', fromEmail);
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: 'johnnyhelder@gmail.com', // Email correto do Johnny
        subject: 'Teste Rio Porto P2P - Email Funcionando! 🎉',
        html: `
          <h1>Email de Teste Funcionando!</h1>
          <p>Se você está vendo este email, significa que:</p>
          <ul>
            <li>✅ RESEND_API_KEY está configurado corretamente</li>
            <li>✅ RESEND_FROM_EMAIL está funcionando</li>
            <li>✅ O serviço de email está operacional</li>
          </ul>
          <p>Agora os emails de verificação devem funcionar no registro!</p>
          <hr>
          <p><small>Enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
        `,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email enviado com sucesso!');
      console.log('ID do email:', data.id);
      console.log('\n📨 Verifique sua caixa de entrada!');
    } else {
      console.error('❌ Erro ao enviar email:', data);
      
      // Dicas de correção baseadas no erro
      if (data.name === 'validation_error') {
        console.log('\n💡 Dica: Verifique se o domínio está verificado no Resend');
        console.log('Acesse: https://resend.com/domains');
      }
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com Resend:', error.message);
    console.log('\n💡 Dicas:');
    console.log('1. Verifique sua conexão com a internet');
    console.log('2. Confirme se a API Key está correta');
    console.log('3. Verifique se não há firewall bloqueando');
  }
}

// Executar teste
testResendEmail();