// Script para testar com email novo
const testRegister = async () => {
  const timestamp = Date.now();
  const testData = {
    name: 'Test User',
    email: `test${timestamp}@example.com`,
    whatsapp: '21999999999',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
    acceptTerms: true
  };

  console.log('Enviando dados com email NOVO:', testData.email);

  try {
    const response = await fetch('https://rioporto.com.br/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Status:', response.status);
    
    const responseText = await response.text();
    console.log('Response Text:', responseText);

    if (responseText) {
      try {
        const responseJson = JSON.parse(responseText);
        console.log('Response JSON:', JSON.stringify(responseJson, null, 2));
      } catch (e) {
        console.log('Não foi possível parsear como JSON');
      }
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
};

testRegister();