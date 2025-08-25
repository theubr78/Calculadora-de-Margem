# Requirements Document

## Introduction

Este projeto visa criar um sistema web profissional e responsivo que integra com a API do OMIE para calcular margens de lucro de produtos. O sistema permitirá que vendedores consultem o custo médio de produtos no OMIE e simulem diferentes preços de venda para visualizar instantaneamente as margens de lucro resultantes, facilitando negociações e tomadas de decisão comerciais.

## Requirements

### Requirement 1

**User Story:** Como vendedor, eu quero buscar informações de um produto no OMIE usando seu código, para que eu possa ver o custo médio e dados básicos do produto.

#### Acceptance Criteria

1. WHEN o usuário inserir um código de produto válido THEN o sistema SHALL fazer uma requisição à API do OMIE usando o endpoint ObterEstoqueProduto
2. WHEN a API retornar dados válidos THEN o sistema SHALL exibir o nome/descrição do produto (cDescricao)
3. WHEN a API retornar dados válidos THEN o sistema SHALL exibir o custo médio do produto (nCMC)
4. WHEN a API retornar dados válidos THEN o sistema SHALL exibir o estoque atual (fIsico)
5. WHEN o produto não for encontrado THEN o sistema SHALL exibir uma mensagem de erro informativa
6. WHEN ocorrer erro na API THEN o sistema SHALL exibir uma mensagem de erro apropriada

### Requirement 2

**User Story:** Como vendedor, eu quero inserir um preço de venda simulado, para que eu possa calcular a margem de lucro em tempo real.

#### Acceptance Criteria

1. WHEN o usuário inserir um preço de venda THEN o sistema SHALL calcular a margem de lucro percentual usando a fórmula: ((PreçoVenda - CustoMedio) / PreçoVenda) * 100
2. WHEN o usuário inserir um preço de venda THEN o sistema SHALL calcular o lucro líquido em reais usando a fórmula: PreçoVenda - CustoMedio
3. WHEN o preço de venda for alterado THEN o sistema SHALL recalcular automaticamente sem recarregar a página
4. WHEN o preço de venda for menor que zero THEN o sistema SHALL impedir o cálculo e exibir mensagem de validação
5. WHEN não houver dados do produto carregados THEN o sistema SHALL impedir o cálculo da margem

### Requirement 3

**User Story:** Como usuário, eu quero acessar o sistema de qualquer dispositivo, para que eu possa usar a ferramenta tanto no escritório quanto em campo.

#### Acceptance Criteria

1. WHEN o usuário acessar o site em desktop THEN o sistema SHALL exibir uma interface otimizada para telas grandes
2. WHEN o usuário acessar o site em tablet THEN o sistema SHALL adaptar o layout para telas médias
3. WHEN o usuário acessar o site em celular THEN o sistema SHALL exibir uma interface otimizada para telas pequenas
4. WHEN o usuário interagir com campos de entrada THEN o sistema SHALL fornecer uma experiência touch-friendly em dispositivos móveis

### Requirement 4

**User Story:** Como administrador do sistema, eu quero que as credenciais da API OMIE sejam protegidas, para que não sejam expostas no frontend e mantenham a segurança.

#### Acceptance Criteria

1. WHEN o sistema fizer requisições à API OMIE THEN as credenciais (app_key e app_secret) SHALL estar armazenadas apenas no backend
2. WHEN o frontend precisar acessar dados do OMIE THEN o sistema SHALL fazer requisições através de um endpoint interno do backend
3. WHEN qualquer requisição for feita THEN o sistema SHALL usar HTTPS para todas as comunicações
4. WHEN ocorrer erro de autenticação THEN o sistema SHALL tratar o erro sem expor detalhes das credenciais

### Requirement 5

**User Story:** Como usuário, eu quero uma interface limpa e intuitiva, para que eu possa usar o sistema de forma eficiente sem treinamento complexo.

#### Acceptance Criteria

1. WHEN o usuário acessar a página inicial THEN o sistema SHALL exibir campos claramente identificados para código do produto e preço de venda
2. WHEN o usuário interagir com o sistema THEN o sistema SHALL fornecer feedback visual imediato para todas as ações
3. WHEN os resultados forem calculados THEN o sistema SHALL exibir os valores de forma clara e destacada
4. WHEN houver erros ou validações THEN o sistema SHALL exibir mensagens claras e orientativas
5. WHEN o sistema estiver processando THEN o sistema SHALL exibir indicadores de carregamento apropriados

### Requirement 6

**User Story:** Como usuário, eu quero ver os resultados dos cálculos formatados adequadamente, para que eu possa interpretar facilmente os valores monetários e percentuais.

#### Acceptance Criteria

1. WHEN valores monetários forem exibidos THEN o sistema SHALL formatá-los com símbolo de moeda brasileira (R$) e separadores decimais apropriados
2. WHEN percentuais forem exibidos THEN o sistema SHALL formatá-los com símbolo de porcentagem (%) e precisão decimal adequada
3. WHEN a margem for negativa THEN o sistema SHALL destacar visualmente que se trata de prejuízo
4. WHEN a margem for positiva THEN o sistema SHALL destacar visualmente que se trata de lucro