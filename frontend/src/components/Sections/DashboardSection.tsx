import React from 'react';
import { useApp } from '../../context/AppContext';

interface DashboardSectionProps {
  onSectionChange?: (section: string) => void;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ onSectionChange }) => {
  const { state } = useApp();

  const stats = [
    {
      title: 'Produtos Consultados',
      value: '0',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'text-blue-500'
    },
    {
      title: 'Cálculos Realizados',
      value: '0',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-teal-500'
    },
    {
      title: 'Produto Atual',
      value: state.productData ? state.productData.cCodigo : 'Nenhum',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-green-500'
    },
    {
      title: 'Status da API',
      value: 'Conectado',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">
          Visão geral do sistema de cálculo de margem integrado ao OMIE
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:shadow-xl hover:-translate-y-0.5 hover:border-gray-500 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Ações Rápidas</h3>
        <p className="text-gray-400 mb-6">Acesse rapidamente as principais funcionalidades</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="flex items-center space-x-3 p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-left"
            onClick={() => onSectionChange?.('calculo')}
          >
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Calcular Margem</p>
              <p className="text-gray-400 text-sm">Simular preços e margens</p>
            </div>
          </button>

          <button 
            className="flex items-center space-x-3 p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-left"
            onClick={() => onSectionChange?.('relatorios')}
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Ver Relatórios</p>
              <p className="text-gray-400 text-sm">Histórico e análises</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-2">Atividade Recente</h3>
        <p className="text-gray-400 mb-6">Últimas ações realizadas no sistema</p>
        
        <div className="space-y-4">
          {state.productData ? (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">
                  Produto {state.productData.cCodigo} consultado
                </p>
                <p className="text-gray-400 text-xs">
                  {state.productData.cDescricao}
                </p>
              </div>
              <span className="text-gray-400 text-xs">
                Agora
              </span>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">
                Nenhuma atividade recente
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Comece buscando um produto para ver o histórico aqui
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
