const axios = require('axios');

async function testOMIE() {
  // Seguindo exatamente a documentação da API OMIE
  const requestBody = {
    "call": "ObterEstoqueProduto",
    "param": [{
      "cEAN": "",
      "nIdProduto": 0,
      "cCodigo": "QCYT13",
      "xCodigo": "",
      "dDia": "11/08/2025"
    }],
    "app_key": "5390588942739",
    "app_secret": "6958317ffdd43775cbd1039bffcd4ac6"
  };

  try {
    console.log('Testing OMIE API exactly as documented...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await axios.post(
      'https://app.omie.com.br/api/v1/estoque/resumo/',
      requestBody,
      {
        headers: {
          'Content-type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testOMIE();