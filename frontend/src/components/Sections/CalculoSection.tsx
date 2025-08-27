import React from 'react';
import { Card } from '../Layout';
import { Typography } from '../UI';
import { ProductSearch, ProductInfo } from '../ProductSearch';
import { ProfitCalculator, ResultsDisplay, PricingScenarios } from '../ProfitCalculator';
import { useApp } from '../../context/AppContext';

const CalculoSection: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="mb-xl">
        <Typography variant="h1" className="text-white mb-sm">
          Cálculo de Margem
        </Typography>
        <Typography variant="body1" color="neutral">
          Simule diferentes preços de venda e visualize a margem de lucro em tempo real
        </Typography>
      </div>

      {/* Product Search Section */}
      <Card
        title="Busca de Produto"
        subtitle="Digite o código do produto para consultar informações no OMIE"
        padding="lg"
        shadow="md"
        className="bg-gray-800 border border-gray-600"
      >
        <ProductSearch />
      </Card>

      {/* Product Information Section */}
      {state.productData && (
        <Card
          title="Informações do Produto"
          subtitle="Dados obtidos do sistema OMIE"
          padding="lg"
          shadow="md"
          className="bg-gray-800 border border-gray-600"
        >
          <ProductInfo productData={state.productData} />
        </Card>
      )}

      {/* Profit Calculator Section */}
      {state.productData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <Card
            title="Calculadora de Margem"
            subtitle="Insira o preço de venda para calcular a margem"
            padding="lg"
            shadow="md"
            className="bg-gray-800 border border-gray-600"
          >
            <ProfitCalculator />
          </Card>

          {/* Results Display */}
          {state.profitResult && (
            <Card
              title="Resultado do Cálculo"
              subtitle="Análise detalhada da margem de lucro"
              padding="lg"
              shadow="md"
              className="bg-gray-800 border border-gray-600"
            >
              <ResultsDisplay 
                productData={state.productData}
                profitResult={state.profitResult}
              />
            </Card>
          )}
        </div>
      )}

      {/* Pricing Scenarios */}
      {state.productData && (
        <Card
          title="Cenários de Precificação"
          subtitle="Compare diferentes estratégias de preço"
          padding="lg"
          shadow="md"
          className="bg-gray-800 border border-gray-600"
        >
          <PricingScenarios productData={state.productData} />
        </Card>
      )}

      {/* Help Section */}
      <Card
        title="Como Usar"
        subtitle="Guia rápido para calcular margens de lucro"
        padding="lg"
        shadow="md"
        className="bg-gray-800 border border-gray-600"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-md">
              <Typography variant="h6" className="text-white font-bold">
                1
              </Typography>
            </div>
            <Typography variant="h6" className="text-white mb-sm">
              Buscar Produto
            </Typography>
            <Typography variant="body2" color="neutral">
              Digite o código do produto no campo de busca para consultar as informações no OMIE
            </Typography>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-md">
              <Typography variant="h6" className="text-white font-bold">
                2
              </Typography>
            </div>
            <Typography variant="h6" className="text-white mb-sm">
              Inserir Preço
            </Typography>
            <Typography variant="body2" color="neutral">
              Informe o preço de venda desejado na calculadora para ver a margem de lucro
            </Typography>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto mb-md">
              <Typography variant="h6" className="text-white font-bold">
                3
              </Typography>
            </div>
            <Typography variant="h6" className="text-white mb-sm">
              Analisar Resultado
            </Typography>
            <Typography variant="body2" color="neutral">
              Visualize a margem calculada e compare diferentes cenários de precificação
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalculoSection;
