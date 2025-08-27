import React from 'react';
import { useApp } from '../../context/AppContext';
import { useToastContext } from '../../context/ToastContext';
import { useAnnouncements, useErrorHandler, useFormValidation } from '../../hooks';
import { ApiService } from '../../services/api';
import { validateProductCode, validateDate } from '../../utils/validation';
import { formatProductCode, getCurrentDate } from '../../utils/formatters';
import { ProductSearchForm } from '../../types';
import Button from '../UI/Button';
import { ValidatedInput } from '../Validation';
import { ErrorDisplay } from '../ErrorBoundary';

const ProductSearch: React.FC = () => {
  const { state, setLoading, setError, setProductData } = useApp();
  const { showSuccess } = useToastContext();
  const { announce } = useAnnouncements();
  const { handleAsyncError } = useErrorHandler();

  // Form validation setup
  const [formState, formActions] = useFormValidation(
    { productCode: '', date: '' },
    {
      productCode: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_-]+$/,
        custom: (value) => validateProductCode(value),
      },
      date: {
        required: false,
        custom: (value) => validateDate(value),
      },
    },
    {
      validateOnChange: true,
      validateOnBlur: true,
      sanitizeOnChange: true,
    }
  );

  // Handle input changes
  const handleInputChange = (field: keyof ProductSearchForm, value: string) => {
    formActions.setValue(field, value);
    
    // Clear global error
    if (state.error) {
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = formActions.handleSubmit(async (values) => {
    setLoading(true);
    setError(null);

    const searchRequest = {
      productCode: formatProductCode(values.productCode),
      date: values.date?.trim() || undefined,
    };

    console.log('[ProductSearch] Searching for product:', searchRequest);

    const productData = await handleAsyncError(
      () => ApiService.searchProduct(searchRequest),
      {
        showToast: false, // We'll handle the error display manually
        onError: (error) => {
          setError(error);
          announce(`Erro: ${error.message}`, 'assertive');
        }
      }
    );

    if (productData) {
      console.log('[ProductSearch] Product found:', productData);
      setProductData(productData);
      const successMessage = `Produto "${productData.cDescricao}" encontrado com sucesso!`;
      showSuccess(successMessage);
      announce(successMessage, 'polite');
    }

    setLoading(false);
  });

  // Handle clear form
  const handleClear = () => {
    formActions.reset({ productCode: '', date: '' });
    setError(null);
    setProductData(null);
  };

  // Fill current date
  const handleFillCurrentDate = () => {
    handleInputChange('date', getCurrentDate());
  };

  return (
    <div className="space-y-md">
      <form onSubmit={handleSubmit} className="space-y-md" role="search" aria-label="Busca de produto no OMIE">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <ValidatedInput
            label="Código do Produto"
            type="text"
            value={formState.values.productCode}
            onChange={(e) => handleInputChange('productCode', e.target.value)}
            placeholder="Ex: PRD00001"
            required
            disabled={state.loading}
            helperText="Digite o código do produto no OMIE"
            ariaLabel="Código do produto para busca no OMIE"
            ariaDescribedBy="product-code-help"
            validationRules={{
              required: true,
              minLength: 2,
              maxLength: 50,
              pattern: /^[a-zA-Z0-9_-]+$/,
              custom: (value) => validateProductCode(value),
            }}
            validateOnChange={true}
            validateOnBlur={true}
            sanitizeOnChange={true}
            showValidationIcon={true}
          />

          <div className="relative">
            <ValidatedInput
              label="Data (Opcional)"
              type="text"
              value={formState.values.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              placeholder="DD/MM/AAAA"
              disabled={state.loading}
              helperText="Deixe vazio para usar a data atual"
              ariaLabel="Data para consulta do produto, opcional"
              ariaDescribedBy="date-help"
              validationRules={{
                required: false,
                custom: (value) => validateDate(value),
              }}
              validateOnChange={true}
              validateOnBlur={true}
              sanitizeOnChange={true}
              showValidationIcon={true}
            />
            <button
              type="button"
              onClick={handleFillCurrentDate}
              disabled={state.loading}
              className="absolute right-2 top-8 text-sm text-primary hover:text-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded px-1"
              aria-label="Preencher com a data de hoje"
            >
              Hoje
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            variant="primary"
            loading={state.loading}
            disabled={!formState.values.productCode.trim() || !formState.isValid}
            className="flex-1 sm:flex-none"
            ariaLabel={state.loading ? 'Buscando produto no OMIE' : 'Buscar produto no OMIE'}
            loadingText="Buscando"
          >
            {state.loading ? 'Buscando...' : 'Buscar Produto'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleClear}
            disabled={state.loading}
            className="flex-1 sm:flex-none"
            ariaLabel="Limpar formulário de busca"
          >
            Limpar
          </Button>
        </div>
      </form>

      {/* Error display */}
      {state.error && (
        <ErrorDisplay
          error={state.error}
          onRetry={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          onDismiss={() => setError(null)}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Loading state */}
      {state.loading && (
        <div className="text-center py-4" role="status" aria-live="polite">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" aria-hidden="true"></div>
            <span className="text-neutral">Buscando produto no OMIE...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
