const axios = require('axios');

// Teste para verificar se o problema de CORS foi resolvido
async function testCORSFix() {
  console.log('🧪 Testando correção de CORS...');
  
  const backendUrls = [
    'https://omie-profit-calculator-backend.onrender.com/api',
    'https://calculadora-de-margem.onrender.com/api'
  ];
  
  for (const baseUrl of backendUrls) {
    console.log(`\n🔍 Testando: ${baseUrl}`);
    
    try {
      // Teste 1: Health check
      console.log('  ➤ Health check...');
      const healthResponse = await axios.get(`${baseUrl}/health`, {
        timeout: 10000,
        headers: {
          'Origin': 'https://calculadora-de-margem-s1x.vercel.app',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log('  ✅ Health check OK:', healthResponse.status);
      
      // Teste 2: CORS preflight
      console.log('  ➤ CORS preflight...');
      const preflightResponse = await axios.options(`${baseUrl}/product/search`, {
        timeout: 10000,
        headers: {
          'Origin': 'https://calculadora-de-margem-s1x.vercel.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('  ✅ CORS preflight OK:', preflightResponse.status);
      
      // Teste 3: Requisição real
      console.log('  ➤ Requisição POST...');
      const searchResponse = await axios.post(`${baseUrl}/product/search`, {
        productCode: 'TEST123',
        date: '25/08/2025'
      }, {
        timeout: 10000,
        headers: {
          'Origin': 'https://calculadora-de-margem-s1x.vercel.app',
          'Content-Type': 'application/json'
        }
      });
      console.log('  ✅ POST request OK:', searchResponse.status);
      
      console.log(`\n🎉 Backend funcionando em: ${baseUrl}`);
      break;
      
    } catch (error) {
      console.log(`  ❌ Erro em ${baseUrl}:`, error.message);
      if (error.response) {
        console.log(`     Status: ${error.response.status}`);
        console.log(`     Headers:`, error.response.headers);
      }
    }
  }
}

testCORSFix();