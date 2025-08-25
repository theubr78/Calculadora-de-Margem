// Teste correto da API do OMIE
const https = require('https');

const testOMIECorrect = () => {
  console.log('🧪 Testando API do OMIE com formato correto...\n');

  // Primeiro, vamos testar com um produto que provavelmente existe
  const requestBody = JSON.stringify({
    call: "ObterEstoqueProduto",
    param: [{
      cCodigo: "000000000000223039", // Código mais simples
      nIdProduto: 0,
      cEAN: "",
      xCodigo: "",
      dDia: "11/08/2025"
    }],
    app_key: "3473640526356",
    app_secret: "5d66d0a5bd65008a48cfab8de5ad3724"
  });

  const options = {
    hostname: 'app.omie.com.br',
    port: 443,
    path: '/api/v1/estoque/resumo/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  console.log('📤 Enviando requisição para:', `https://${options.hostname}${options.path}`);
  console.log('📤 Dados:', JSON.stringify(JSON.parse(requestBody), null, 2));

  const req = https.request(options, (res) => {
    console.log(`\n📊 Status: ${res.statusCode}`);
    console.log(`📊 Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📥 Resposta da API OMIE:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
        
        if (response.faultstring) {
          console.log('\n❌ Erro da API OMIE:', response.faultstring);
          
          // Verificar se é erro de produto não encontrado
          if (response.faultstring.includes('não encontrado') || 
              response.faultstring.includes('not found')) {
            console.log('✅ Isso é normal! Significa que a API está funcionando, apenas o produto não existe.');
            console.log('💡 Tente com um código de produto que existe no seu OMIE.');
          }
        } else {
          console.log('\n✅ Sucesso! Produto encontrado na API OMIE');
        }
      } catch (e) {
        console.log('❌ Resposta não é JSON válido:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erro na requisição:', e.message);
  });

  req.write(requestBody);
  req.end();
};

testOMIECorrect();