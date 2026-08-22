# GitHub Actions Setup for Auto-Deployment

Como configurar GitHub Actions para auto-deploy em cada push para `main`.

---

## Step 1: Create Railway Token

1. Ir em https://railway.app → Dashboard
2. Account > API Tokens
3. Create new token → Copiar
4. Guardar com segurança

---

## Step 2: Create Vercel Token

1. Ir em https://vercel.com → Settings > Tokens
2. Create > Create Token
3. Copiar token
4. Guardar com segurança

---

## Step 3: Get Vercel Project IDs

```bash
# Instalar Vercel CLI
npm install -g vercel

# Conectar ao projeto
cd frontend
vercel link

# Vercel gera .vercel/project.json com IDs
cat .vercel/project.json | grep orgId,projectId
```

---

## Step 4: Add Secrets to GitHub

1. GitHub → Settings > Secrets and variables > Actions > New repository secret

Adicionar os seguintes secrets:

| Secret Name | Value | Where get |
|-------------|-------|-----------|
| `RAILWAY_TOKEN` | Token do Railway | Step 1 |
| `VERCEL_TOKEN` | Token do Vercel | Step 2 |
| `VERCEL_ORG_ID` | Seu Vercel org ID | .vercel/project.json ou account settings |
| `VERCEL_PROJECT_ID` | Seu Vercel project ID | .vercel/project.json |
| `BACKEND_URL` | URL do backend | Railway dashboard (ex: https://your-app.railway.app) |
| `VITE_API_URL` | Backend URL + /api | https://seu-backend.railway.app/api |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Seu public key | MercadoPago dashboard |
| `SLACK_WEBHOOK` | Slack webhook (opcional) | Slack workspace > Incoming Webhooks |

---

## Step 5: Configure Deploy Workflow

O arquivo `.github/workflows/deploy.yml` já está configurado para:

1. Rodar testes em cada push para `main`
2. Deploy backend no Railway se testes passarem
3. Deploy frontend no Vercel se testes passarem
4. Verificar health check do backend
5. Enviar notificação no Slack (opcional)

---

## Step 6: Test Auto-Deployment

```bash
# Fazer uma mudança menor no código
echo "# Test commit" >> README.md

# Commit e push
git add .
git commit -m "Test auto-deployment"
git push origin main

# Verificar progresso em:
# GitHub > Actions > Deploy to Production
```

Você deve ver:
- ✅ Tests running
- ✅ Backend deploying
- ✅ Frontend deploying
- ✅ Health check passing

---

## Troubleshooting

### Tests failing

1. Verificar logs em GitHub Actions
2. Rodar testes localmente: `npm test`
3. Fixar erros localmente
4. Push novamente

### Deploy failing

1. Verificar GitHub Actions logs
2. Verificar Railway/Vercel dashboard
3. Verificar secrets estão setados corretamente
4. Verificar tokens não expiraram

### Secrets not found

```bash
# GitHub CLI (if installed)
gh secret list

# Or manually re-add in Settings > Secrets
```

---

## Manual Deployment (if GitHub Actions fails)

```bash
# Backend
npm install -g @railway/cli
railway login
cd backend
railway up

# Frontend
npm install -g vercel
cd frontend
vercel deploy --prod
```

---

## Disabling Auto-Deployment

Se quiser desabilitar o auto-deploy:

1. GitHub → Settings > Actions > Disable
2. Ou remover `.github/workflows/deploy.yml`
3. Deploy manual quando precisar

---

## Advanced: Manual Trigger

Você pode disparar deploy manualmente sem fazer push:

1. GitHub → Actions > Deploy to Production
2. Run workflow
3. Selecionar branch (main)
4. Run

---

## Security Notes

- ✅ Tokens stored em GitHub Secrets (encrypted)
- ✅ Tokens nunca expostos em logs
- ✅ Use token com permissões mínimas necessárias
- ✅ Rotate tokens a cada 90 dias
- ✅ Se token vazou, regenerar imediatamente

---

## Monitoring Deployments

### Via GitHub

```
Settings > Actions > Workflow runs
```

### Via Railway

```
railway logs --tail
```

### Via Vercel

```
vercel logs
```

### Via Sentry (if configured)

```
https://sentry.io → Recent events
```

---

## Next Steps

1. ✅ Configure GitHub Secrets
2. ✅ Test workflow with test commit
3. ✅ Monitor first deployment
4. ✅ Setup Slack notifications (optional)
5. ✅ Document in team wiki

---

**Last updated:** 2026-08-21
