/**
 * Utilitários para exportação de dados em diferentes formatos
 */

export interface CalculationData {
  productCode: string;
  productName: string;
  costPrice: number;
  salePrice: number;
  profitMargin: number;
  profitAmount: number;
  timestamp: number;
}

/**
 * Exporta dados de cálculos para formato CSV
 */
export const exportToCSV = (data: CalculationData[], filename: string = 'relatorio-calculos') => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Cabeçalhos do CSV
  const headers = [
    'Código do Produto',
    'Nome do Produto', 
    'Preço de Custo (R$)',
    'Preço de Venda (R$)',
    'Margem (%)',
    'Lucro (R$)',
    'Data/Hora'
  ];

  // Converter dados para formato CSV
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      `"${item.productCode}"`,
      `"${item.productName}"`,
      item.costPrice.toFixed(2).replace('.', ','),
      item.salePrice.toFixed(2).replace('.', ','),
      item.profitMargin.toFixed(2).replace('.', ','),
      item.profitAmount.toFixed(2).replace('.', ','),
      `"${new Date(item.timestamp).toLocaleString('pt-BR')}"`
    ].join(','))
  ].join('\n');

  // Criar e baixar arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exporta dados de cálculos para formato PDF
 */
export const exportToPDF = (data: CalculationData[], filename: string = 'relatorio-calculos') => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Criar conteúdo HTML para o PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Cálculos - OMIE</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #007bff;
          margin: 0;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #495057;
        }
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        .profit {
          color: #28a745;
          font-weight: bold;
        }
        .loss {
          color: #dc3545;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Cálculos de Margem</h1>
        <p>Sistema OMIE Profit Calculator</p>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Total de registros: ${data.length}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Produto</th>
            <th>Custo (R$)</th>
            <th>Venda (R$)</th>
            <th>Margem (%)</th>
            <th>Lucro (R$)</th>
            <th>Data/Hora</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td>${item.productCode}</td>
              <td>${item.productName}</td>
              <td>R$ ${item.costPrice.toFixed(2).replace('.', ',')}</td>
              <td>R$ ${item.salePrice.toFixed(2).replace('.', ',')}</td>
              <td class="${item.profitMargin > 0 ? 'profit' : 'loss'}">
                ${item.profitMargin.toFixed(2).replace('.', ',')}%
              </td>
              <td class="${item.profitAmount > 0 ? 'profit' : 'loss'}">
                R$ ${item.profitAmount.toFixed(2).replace('.', ',')}
              </td>
              <td>${new Date(item.timestamp).toLocaleString('pt-BR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema OMIE Profit Calculator</p>
      </div>
    </body>
    </html>
  `;

  // Abrir nova janela e imprimir
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
      // Fechar janela após impressão (opcional)
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  } else {
    alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desabilitado.');
  }
};

/**
 * Gera estatísticas resumidas dos dados
 */
export const generateSummaryStats = (data: CalculationData[]) => {
  if (!data || data.length === 0) {
    return {
      totalCalculations: 0,
      averageMargin: 0,
      totalProfit: 0,
      profitableCalculations: 0,
      uniqueProducts: 0
    };
  }

  const totalCalculations = data.length;
  const averageMargin = data.reduce((sum, item) => sum + item.profitMargin, 0) / totalCalculations;
  const totalProfit = data.reduce((sum, item) => sum + item.profitAmount, 0);
  const profitableCalculations = data.filter(item => item.profitAmount > 0).length;
  const uniqueProducts = new Set(data.map(item => item.productCode)).size;

  return {
    totalCalculations,
    averageMargin,
    totalProfit,
    profitableCalculations,
    uniqueProducts
  };
};