// Teste da API do backend com produto real
const http = require('http');

const testBackendAPI = () => {
    console.log('🧪 Testando API do backend com produto real...\n');

    const requestBody = JSON.stringify({
        productCode: "QCYT13",
        date: "25/08/2025"
    });

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/product/search',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('\n📥 Resposta da API Backend:');
            try {
                const response = JSON.parse(data);
                console.log(JSON.stringify(response, null, 2));

                if (response.success) {
                    console.log('\n✅ Sucesso! API do backend funcionando com OMIE');
                    console.log(`📦 Produto: ${response.data.cDescricao}`);
                    console.log(`💰 Preço: R$ ${response.data.listaEstoque[0]?.nPrecoUnitario || 'N/A'}`);
                } else {
                    console.log('\n❌ Erro na API do backend:', response.error);
                }
            } catch (e) {
                console.log('Resposta não é JSON válido:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Erro na requisição:', e.message);
    });

    req.write(requestBody);
    req.end();
};

testBackendAPI();
