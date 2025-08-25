# Teste da API com dados reais do OMIE
Write-Host "🧪 Testando API com dados reais do OMIE..." -ForegroundColor Cyan
Write-Host ""

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$Description
    )
    
    Write-Host "🔍 $Description" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ Sucesso!" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Gray
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
        Write-Host ""
        return $false
    }
}

# 1. Teste Health Check
$healthOk = Test-Endpoint -Url "http://localhost:3001/api/health" -Description "Health Check"

if (-not $healthOk) {
    Write-Host "❌ Backend não está rodando. Execute:" -ForegroundColor Red
    Write-Host "cd backend" -ForegroundColor Yellow
    Write-Host "npm run dev" -ForegroundColor Yellow
    exit 1
}

# 2. Teste conexão OMIE
$connectionOk = Test-Endpoint -Url "http://localhost:3001/api/product/test-connection" -Description "Teste de conexão com OMIE"

if (-not $connectionOk) {
    Write-Host "❌ Problema na conexão com OMIE. Verifique as credenciais no arquivo backend/.env" -ForegroundColor Red
    exit 1
}

# 3. Teste busca de produto real
Write-Host "🔍 Digite um código de produto real do seu OMIE para testar:" -ForegroundColor Cyan
$productCode = Read-Host "Código do produto"

if ($productCode) {
    $searchBody = @{
        productCode = $productCode
        date = (Get-Date -Format "dd/MM/yyyy")
    }
    
    $searchOk = Test-Endpoint -Url "http://localhost:3001/api/product/search" -Method "POST" -Body $searchBody -Description "Busca de produto real: $productCode"
    
    if ($searchOk) {
        Write-Host "🎉 Teste completo! A API está funcionando com dados reais do OMIE." -ForegroundColor Green
    } else {
        Write-Host "❌ Produto não encontrado ou erro na busca. Verifique se o código existe no OMIE." -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Nenhum código fornecido. Teste básico concluído." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Para usar o frontend:" -ForegroundColor Cyan
Write-Host "cd frontend" -ForegroundColor Yellow
Write-Host "npm start" -ForegroundColor Yellow