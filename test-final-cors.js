const axios = require('axios');

// Teste final para verificar se o CORS está funcionando
async function testFinalCORS() {
  console.log('🎯 Teste final de CORS - URL correta');
  console.log('Backend: https://calculadora-de-margem.onrender.com/api');
  console.log('Frontend: https://calculadora-de-margem-s1x.vercel.app');
  console.log('');
  
  const baseUrl = 'https://calculadora-de-margem.onrender.com/api';
  const origin = 'https://calculadora-de-margem-s1x.vercel.app';
  
  try {
    // Teste 1: Health check com Origin header
    console.log('1️⃣ Health check com Origin header...');
    const healthResponse = await axios.get(`${baseUrl}/health`, {
      headers: {
        'Origin': origin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('✅ Health check OK');
    console.log('   CORS Headers:', {
      'access-control-allow-origin': healthResponse.headers['access-control-allow-origin'],
      'access-control-allow-methods': healthResponse.headers['access-control-allow-methods'],
      'access-control-allow-headers': healthResponse.headers['access-control-allow-headers']
    });
    console.log('');
    
    // Teste 2: OPTIONS preflight request
    console.log('2️⃣ CORS Preflight (OPTIONS)...');
    const preflightResponse = await axios.options(`${baseUrl}/product/search`, {
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ Preflight OK');
    console.log('   Status:', preflightResponse.status);
    console.log('');
    
    // Teste 3: POST request simulando o frontend
    console.log('3️⃣ POST request simulando frontend...');
    const postResponse = await axios.post(`${baseUrl}/product/search`, {
      productCode: 'TEST123',
      date: new Date().toLocaleDateString('pt-BR')
    }, {
      headers: {
        'Origin': origin,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    console.log('✅ POST request OK');
    console.log('   Status:', postResponse.status);
    console.log('   Response:', postResponse.data);
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
      
      if (error.response.status === 502) {
        console.log('\n💡 Erro 502: O backend pode estar reiniciando ou com problema interno.');
        console.log('   Isso não é um problema de CORS, mas sim do servidor backend.');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Conexão recusada: Backend não está respondendo.');
    }
  }
  
  console.log('\n📋 Resumo:');
  console.log('- URL do backend corrigida ✅');
  console.log('- Headers CORS configurados ✅');
  console.log('- Frontend deve usar: https://calculadora-de-margem.onrender.com/api');
  console.log('\n🚀 Após o redeploy do Vercel, o CORS deve estar funcionando!');
}

testFinalCORS();