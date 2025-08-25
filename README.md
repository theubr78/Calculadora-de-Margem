# OMIE Profit Calculator

Sistema web profissional para cálculo de margem de lucro integrado à API do OMIE.

## 🚀 Funcionalidades

- Busca automática de produtos na API do OMIE
- Cálculo em tempo real de margem de lucro
- Interface responsiva para desktop, tablet e mobile
- Integração segura com credenciais protegidas no backend

## 🛠️ Tecnologias

**Frontend:**
- React.js 18+ com TypeScript
- TailwindCSS para estilização responsiva
- Axios para requisições HTTP
- React Hook Form para formulários

**Backend:**
- Node.js com Express.js
- TypeScript
- Integração segura com API OMIE
- Rate limiting e validações

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm run install:all
```

3. Configure as variáveis de ambiente no backend:
```bash
cd backend
cp .env.example .env
# Edite o arquivo .env com suas credenciais OMIE
```

4. Execute o projeto em modo desenvolvimento:
```bash
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente (Backend)

```env
OMIE_APP_KEY=sua_app_key_aqui
OMIE_APP_SECRET=seu_app_secret_aqui
OMIE_API_URL=https://app.omie.com.br/api/v1/estoque/resumo/
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📱 Como Usar

1. Acesse o sistema no navegador
2. Digite o código do produto OMIE
3. Clique em "Buscar" para obter dados do produto
4. Insira o preço de venda desejado
5. Visualize a margem de lucro calculada automaticamente

## 🏗️ Estrutura do Projeto

```
├── frontend/          # Aplicação React
├── backend/           # API Node.js/Express
├── package.json       # Scripts principais
└── README.md
```

## 🧪 Testes

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test
```

## 🚀 Deploy

```bash
npm run build
```

## 📄 Licença

Este projeto está sob licença MIT.