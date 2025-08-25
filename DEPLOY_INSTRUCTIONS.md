# 🚀 Instruções de Deploy - Calculadora de Margem OMIE

## ✅ Status do Projeto
- ✅ Build do frontend funcionando
- ✅ Configurações de deploy criadas
- ✅ Código commitado no GitHub
- ✅ Pronto para deploy

## 📋 Próximos Passos

### 1. Deploy do Backend (Render)

1. **Acesse**: [render.com](https://render.com)
2. **Faça login** com sua conta GitHub
3. **Clique em**: "New +" → "Web Service"
4. **Selecione**: seu repositório `Calculadora-de-Margem`
5. **Configure**:
   - **Name**: `omie-profit-calculator-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

6. **Variáveis de Ambiente**:
   ```
   NODE_ENV=production
   PORT=10000
   OMIE_APP_KEY=5390588942739
   OMIE_APP_SECRET=6958317ffdd43775cbd1039bffcd4ac6
   OMIE_API_URL=https://app.omie.com.br/api/v1/estoque/resumo/
   FRONTEND_URL=(deixe vazio por enquanto)
   ```

7. **Clique em**: "Create Web Service"
8. **Aguarde**: 5-10 minutos para o deploy
9. **Anote a URL**: Ex: `https://omie-profit-calculator-backend.onrender.com`

### 2. Deploy do Frontend (Vercel)

1. **Acesse**: [vercel.com](https://vercel.com)
2. **Faça login** com sua conta GitHub
3. **Clique em**: "New Project"
4. **Selecione**: seu repositório `Calculadora-de-Margem`
5. **⚠️ IMPORTANTE**: Selecione a **raiz do projeto**, NÃO a pasta frontend
6. **Configure**:
   - **Framework Preset**: `Other`
   - **Root Directory**: `.` (raiz)
   - **Build Command**: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - **Output Directory**: `frontend/build`

7. **Variáveis de Ambiente**:
   ```
   REACT_APP_API_URL=https://sua-url-backend.onrender.com/api
   ```
   (Substitua pela URL real do backend do passo 1)

8. **Clique em**: "Deploy"
9. **Aguarde**: 2-5 minutos
10. **Anote a URL**: Ex: `https://omie-profit-calculator.vercel.app`

### 3. Configuração Final

1. **Volte ao Render**
2. **Vá em**: Settings → Environment
3. **Atualize**: `FRONTEND_URL` com a URL do Vercel
4. **Redeploy**: o backend

## 🌐 URLs Finais

Após o deploy completo:
- **Site**: `https://omie-profit-calculator.vercel.app`
- **API**: `https://omie-profit-calculator-backend.onrender.com`
- **Health Check**: `https://omie-profit-calculator-backend.onrender.com/api/health`

## 🔧 Troubleshooting

### Se o build falhar no Vercel:
- Verifique se selecionou a raiz do projeto
- Confirme o comando de build: `cd frontend && npm install --legacy-peer-deps && npm run build`
- Verifique se a variável `REACT_APP_API_URL` está configurada

### Se o backend não responder:
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o health check está funcionando
- Verifique os logs no dashboard do Render

## 💰 Custos
- **Vercel**: Gratuito
- **Render**: Gratuito (750h/mês)
- **Total**: R$ 0,00/mês

## 📞 Entrega ao Cliente

Após o deploy, você pode entregar ao cliente:

1. **URL do site**: Para acessar a aplicação
2. **Credenciais OMIE**: Já configuradas no backend
3. **Documentação**: `DEPLOY_GUIDE.md` para referência técnica

## 🔄 Atualizações Futuras

Para atualizar o site:
1. Faça alterações no código
2. `git add .`
3. `git commit -m "Descrição da alteração"`
4. `git push origin main`
5. Deploy automático em ambas as plataformas

---

**✨ Seu site está pronto para ser hospedado e entregue ao cliente!**
