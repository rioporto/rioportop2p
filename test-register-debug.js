// Script para testar a API de registro e ver o erro real
const testRegister = async () => {
  const testData = {
    name: 'Johnny Ferrera',
    email: 'johnnyhelder@gmail.com',
    whatsapp: '21988761425',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
    acceptTerms: true
  };

  console.log('Enviando dados:', testData);

  try {
    const response = await fetch('https://rioporto.com.br/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response Text:', responseText);

    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response JSON:', JSON.stringify(responseJson, null, 2));
    } catch (e) {
      console.log('Não foi possível parsear como JSON');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
};

// Também testar localmente
const testLocal = async () => {
  console.log('\n=== TESTANDO LOCALMENTE ===\n');
  
  const testData = {
    name: 'Johnny Ferrera',
    email: 'johnnyhelder@gmail.com',
    whatsapp: '21988761425',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#',
    acceptTerms: true
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
  } catch (error) {
    console.log('Erro local (esperado se não estiver rodando):', error.message);
  }
};

// Executar testes
(async () => {
  console.log('=== TESTANDO API DE REGISTRO ===\n');
  await testRegister();
  await testLocal();
})();