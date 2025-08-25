const axios = require('axios');

// Teste da API do backend
async function testAPI() {
  console.log('🧪 Testando API do Backend...\n');

  try {
    // 1. Teste de Health Check
    console.log('1️⃣ Testando Health Check...');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Health Check OK:', healthResponse.data);
    console.log('');

    // 2. Teste de conexão com OMIE
    console.log('2️⃣ Testando conexão com OMIE...');
    const connectionResponse = await axios.get('http://localhost:3001/api/product/test-connection');
    console.log('✅ Conexão OMIE:', connectionResponse.data);
    console.log('');

    // 3. Teste de busca de produto (com código de teste)
    console.log('3️⃣ Testando busca de produto...');
    const searchResponse = await axios.post('http://localhost:3001/api/product/search', {
      productCode: 'QCYT13', // Código de exemplo que funciona
      date: '11/08/2025'
    });
    console.log('✅ Busca de produto OK:', searchResponse.data);
    console.log('');

    console.log('🎉 Todos os testes passaram! A API está funcionando corretamente.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o backend está rodando em http://localhost:3001');
      console.log('Execute: cd backend && npm run dev');
    }
    
    if (error.response?.status === 500 && error.response?.data?.error?.includes('OMIE API credentials')) {
      console.log('\n💡 Dica: Configure as credenciais do OMIE no arquivo backend/.env');
      console.log('OMIE_APP_KEY=5390588942739');
      console.log('OMIE_APP_SECRET=6958317ffdd43775cbd1039bffcd4ac6');
    }
  }
}

// Executar teste
testAPI();