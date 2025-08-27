import React from 'react';
import { Card } from '../Layout';
import { Typography } from '../UI';
import { CalculationHistory } from '../ProfitCalculator';
import { useApp } from '../../context/AppContext';

const RelatoriosSection: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="mb-xl">
        <Typography variant="h1" className="text-white mb-sm">
          Relatórios
        </Typography>
        <Typography variant="body1" color="neutral">
          Histórico de cálculos e análises de margem de lucro
        </Typography>
      </div>

      {/* Calculation History */}
      <Card
        title="Histórico de Cálculos"
        subtitle="Visualize todos os cálculos realizados anteriormente"
        padding="lg"
        shadow="md"
        className="bg-surface border border-gray-700"
      >
        <CalculationHistory 
          currentProduct={state.productData}
          currentResult={state.profitResult}
        />
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <Card
          padding="lg"
          shadow="md"
          className="bg-surface border border-gray-700"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <Typography variant="h3" className="text-white mb-xs">
              0
            </Typography>
            <Typography variant="body2" color="neutral">
              Total de Cálculos
            </Typography>
          </div>
        </Card>

        <Card
          padding="lg"
          shadow="md"
          className="bg-surface border border-gray-700"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto mb-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4" />
              </svg>
            </div>
            <Typography variant="h3" className="text-white mb-xs">
              0%
            </Typography>
            <Typography variant="body2" color="neutral">
              Margem Média
            </Typography>
          </div>
        </Card>

        <Card
          padding="lg"
          shadow="md"
          className="bg-surface border border-gray-700"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <Typography variant="h3" className="text-white mb-xs">
              0
            </Typography>
            <Typography variant="body2" color="neutral">
              Produtos Únicos
            </Typography>
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <Card
        title="Exportar Dados"
        subtitle="Baixe seus relatórios em diferentes formatos"
        padding="lg"
        shadow="md"
        className="bg-surface border border-gray-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <button className="flex items-center justify-center space-x-sm p-md rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <Typography variant="body1" className="text-white">
              Exportar como CSV
            </Typography>
          </button>

          <button className="flex items-center justify-center space-x-sm p-md rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <Typography variant="body1" className="text-white">
              Exportar como PDF
            </Typography>
          </button>
        </div>
      </Card>

      {/* Tips */}
      <Card
        title="Dicas de Análise"
        subtitle="Como interpretar seus dados de margem"
        padding="lg"
        shadow="md"
        className="bg-surface border border-gray-700"
      >
        <div className="space-y-md">
          <div className="flex items-start space-x-sm">
            <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center flex-shrink-0 mt-xs">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <Typography variant="body1" className="text-white font-medium mb-xs">
                Margem Saudável
              </Typography>
              <Typography variant="body2" color="neutral">
                Margens acima de 20% são consideradas saudáveis para a maioria dos produtos
              </Typography>
            </div>
          </div>

          <div className="flex items-start space-x-sm">
            <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center flex-shrink-0 mt-xs">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <Typography variant="body1" className="text-white font-medium mb-xs">
                Atenção aos Custos
              </Typography>
              <Typography variant="body2" color="neutral">
                Monitore regularmente os custos médios dos produtos no OMIE para manter a precisão
              </Typography>
            </div>
          </div>

          <div className="flex items-start space-x-sm">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-xs">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <Typography variant="body1" className="text-white font-medium mb-xs">
                Análise Comparativa
              </Typography>
              <Typography variant="body2" color="neutral">
                Compare margens entre produtos similares para identificar oportunidades de otimização
              </Typography>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RelatoriosSection;
