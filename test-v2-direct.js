// Testar diretamente a API v2
const testV2 = async () => {
  const testData = {
    name: 'Johnny Ferrera',
    email: 'johnnyhelder@gmail.com',
    whatsapp: '21988761425',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
    acceptTerms: true
  };

  console.log('Testando /api/auth/register-v2 diretamente...');

  try {
    const response = await fetch('https://rioporto.com.br/api/auth/register-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Status:', response.status);
    
    const responseText = await response.text();
    console.log('Response length:', responseText.length);
    console.log('Response:', responseText);

    if (responseText) {
      try {
        const json = JSON.parse(responseText);
        console.log('JSON:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Não é JSON válido');
      }
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};

testV2();