const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testando API do Backend...\n');

  try {
    // Teste de busca de produto
    console.log('1️⃣ Testando busca de produto...');
    const searchResponse = await axios.post('http://localhost:3001/api/product/search', {
      productCode: "001"
    });
    console.log('✅ Busca de produto OK:', searchResponse.data);
    console.log('');

    console.log('🎉 Teste realizado com sucesso! A API está funcionando corretamente.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar teste
testAPI();</execute_code>
</create_file>
