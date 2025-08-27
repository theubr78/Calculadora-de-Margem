import React from 'react';
import { ProductData } from '../../types';
import { formatCurrency, formatNumber, truncateText } from '../../utils/formatters';
import Card from '../Layout/Card';

interface ProductInfoProps {
  productData: ProductData;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ productData }) => {
  return (
    <Card title="Informações do Produto" className="bg-gray-800 border border-gray-600">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-sm">
          <div>
            <label className="block text-body-small font-medium text-gray-300 mb-xs">
              Código
            </label>
            <p className="text-h5 font-mono font-semibold text-primary">
              {productData.cCodigo}
            </p>
          </div>

          <div>
            <label className="block text-body-small font-medium text-gray-300 mb-xs">
              Descrição
            </label>
            <p className="text-h5 font-semibold text-white" title={productData.cDescricao}>
              {truncateText(productData.cDescricao, 50)}
            </p>
          </div>
        </div>

        <div className="space-y-sm">
          <div>
            <label className="block text-body-small font-medium text-gray-300 mb-xs">
              Custo Médio (CMC)
            </label>
            <p className="text-h4 font-bold text-success">
              {formatCurrency(productData.nCMC)}
            </p>
          </div>

          <div>
            <label className="block text-body-small font-medium text-gray-300 mb-xs">
              Estoque Físico
            </label>
            <p className="text-h5 font-semibold text-white">
              {formatNumber(productData.fIsico)} unidades
            </p>
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div className="mt-md pt-md border-t border-gray-600">
        <div className="flex flex-wrap gap-md text-body-small text-gray-300">
          <span>
            <strong>ID OMIE:</strong> {productData.nIdProduto}
          </span>
          <span>
            <strong>Status:</strong>
            <span className={`ml-xs font-semibold ${
              productData.fIsico > 0 ? 'text-success' : 'text-warning'
            }`}>
              {productData.fIsico > 0 ? 'Em estoque' : 'Sem estoque'}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ProductInfo;