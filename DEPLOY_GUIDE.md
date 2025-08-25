# Guia de Deploy - Calculadora de Margem OMIE

Este guia contém instruções completas para fazer o deploy da aplicação em produção.

## Arquitetura da Aplicação

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Integração**: API OMIE para busca de produtos

## Plataformas de Deploy Recomendadas

### Frontend: Vercel (Gratuito)
- Deploy automático via GitHub
- CDN global
- HTTPS automático
- Domínio personalizado disponível

### Backend: Render (Gratuito)
- Deploy automático via GitHub
- HTTPS automático
- Logs em tempo real
- Variáveis de ambiente seguras

## Passo a Passo do Deploy

### 1. Preparação do Repositório

Certifique-se de que todos os arquivos estão commitados no GitHub:

```bash
git add .
git commit -m "Preparação para deploy"
git push origin main
```

### 2. Deploy do Backend (Render)

1. Acesse [render.com](https://render.com) e faça login com GitHub
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `omie-profit-calculator-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

5. Configure as variáveis de ambiente:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (automático no Render)
   - `OMIE_APP_KEY`: `3473640526356`
   - `OMIE_APP_SECRET`: `5d66d0a5bd65008a48cfab8de5ad3724`
   - `OMIE_API_URL`: `https://app.omie.com.br/api/v1/estoque/resumo/`
   - `FRONTEND_URL`: (será preenchido após deploy do frontend)

6. Clique em "Create Web Service"
7. Aguarde o deploy (5-10 minutos)
8. Anote a URL gerada (ex: `https://omie-profit-calculator-backend.onrender.com`)

### 3. Deploy do Frontend (Vercel)

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em "New Project"
3. Importe seu repositório GitHub
4. **IMPORTANTE**: Selecione a raiz do projeto (Calculadora-de-Margem), NÃO a pasta frontend
5. Configure:
   - **Framework Preset**: `Other`
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`

6. Configure as variáveis de ambiente:
   - `REACT_APP_API_URL`: `https://sua-url-backend.onrender.com/api`

7. Clique em "Deploy"
8. Aguarde o deploy (2-5 minutos)
9. Anote a URL gerada (ex: `https://omie-profit-calculator.vercel.app`)

### 4. Configuração Final

1. Volte ao Render e atualize a variável `FRONTEND_URL` com a URL do Vercel
2. Redeploy o backend para aplicar as mudanças

## URLs de Exemplo

Após o deploy, você terá:

- **Frontend**: `https://omie-profit-calculator.vercel.app`
- **Backend**: `https://omie-profit-calculator-backend.onrender.com`
- **API Health**: `https://omie-profit-calculator-backend.onrender.com/api/health`

## Configuração de Domínio Personalizado

### Vercel (Frontend)
1. No dashboard do Vercel, vá em "Settings" → "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

### Render (Backend)
1. No dashboard do Render, vá em "Settings" → "Custom Domains"
2. Adicione seu subdomínio para API (ex: `api.seudominio.com`)

## Monitoramento e Logs

### Vercel
- Logs de build e runtime disponíveis no dashboard
- Analytics de performance incluído

### Render
- Logs em tempo real no dashboard
- Métricas de CPU e memória
- Health checks automáticos

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verifique se `FRONTEND_URL` está configurado corretamente no backend

2. **API não responde**
   - Verifique se as credenciais OMIE estão corretas
   - Confirme se o backend está rodando

3. **Build falha**
   - Verifique se todas as dependências estão no `package.json`
   - Confirme se não há erros de TypeScript

### Comandos de Debug Local

```bash
# Testar build do frontend
cd frontend && npm run build

# Testar build do backend
cd backend && npm run build

# Testar aplicação completa
npm run build
npm run dev
```

## Atualizações

Para atualizar a aplicação:

1. Faça as alterações no código
2. Commit e push para o GitHub
3. O deploy será automático em ambas as plataformas

## Backup e Segurança

- As variáveis de ambiente são criptografadas nas plataformas
- Faça backup regular do código no GitHub
- Monitore os logs para detectar problemas

## Custos

- **Vercel**: Gratuito para projetos pessoais
- **Render**: Gratuito com limitações (750h/mês)
- **Upgrade**: Disponível conforme necessidade

## Suporte

Para problemas técnicos:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Render: [render.com/docs](https://render.com/docs)
