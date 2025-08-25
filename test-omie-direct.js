// Teste direto da API do OMIE
const https = require('https');

const testOMIEDirect = () => {
    console.log('🧪 Testando API do OMIE diretamente...\n');

    const requestBody = JSON.stringify({
        call: "ObterEstoqueProduto",
        param: [{
            cCodigo: "QCYT13",
            nIdProduto: 0,
            cEAN: "",
            xCodigo: "",
            dDia: "11/08/2025"
        }],
        app_key: "5390588942739",
        app_secret: "6958317ffdd43775cbd1039bffcd4ac6"
    });

    const options = {
        hostname: 'app.omie.com.br',
        port: 443,
        path: '/api/v1/estoque/resumo/',
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'User-Agent': 'OMIE-Test/1.0.0'
        }
    };

    const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);

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
                } else {
                    console.log('\n✅ Sucesso! Dados recebidos da API OMIE');
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

testOMIEDirect();