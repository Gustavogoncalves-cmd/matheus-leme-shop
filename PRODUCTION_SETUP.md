# Production Setup Guide - Quick Start

Guia rápido para colocar a aplicação Matheus Leme Shop em produção em 30 minutos.

---

## TL;DR - 5 Minutos

### 1. Setup Database (Railway)

```bash
# 1. Ir em https://railway.app
# 2. Sign up/Login
# 3. Create new project
# 4. Add PostgreSQL
# 5. Copiar DATABASE_URL
```

### 2. Deploy Backend (Railway)

```bash
# 1. Connect GitHub repository ao Railway
# 2. Adicionar variáveis de ambiente:
DATABASE_URL=<from step 1>
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV=production
MERCADOPAGO_ACCESS_TOKEN=<seu token>
MERCADOPAGO_WEBHOOK_SECRET=<seu secret>
FRONTEND_URL=https://seu-frontend.com
WEBHOOK_URL=https://seu-backend.railway.app/api/payments/webhook

# 3. Railway faz deploy automático
# 4. Copiar URL pública do backend
```

### 3. Deploy Frontend (Vercel)

```bash
# 1. Ir em https://vercel.com
# 2. Import GitHub repository
# 3. Adicionar variáveis:
VITE_API_URL=https://seu-backend.railway.app/api
VITE_MERCADOPAGO_PUBLIC_KEY=<seu public key>

# 4. Vercel faz deploy automático
# 5. Configurar custom domain (opcional)
```

### 4. Configure MercadoPago Webhook

```bash
# 1. Ir em https://www.mercadopago.com/developers/panel
# 2. Settings > Integrations > Webhooks
# 3. Adicionar URL:
https://seu-backend.railway.app/api/payments/webhook

# 4. Testar webhook (send test notification)
```

### 5. Testar

```bash
# Health check
curl https://seu-backend.railway.app/api/health

# Frontend
Abrir https://seu-frontend.vercel.app no navegador
```

**Pronto! 🚀 Seu app está em produção.**

---

## Passo-a-Passo Detalhado (30 Minutos)

### Parte 1: Prepare (5 min)

```bash
# 1. Gerar secrets
node scripts/generate-secrets.js

# 2. Copiar para arquivo seguro (password manager)
# ⚠️ NUNCA committar em git

# 3. Verificar que código está pronto
git status          # Nenhuma mudança local
npm test            # Testes passam
npm run build       # Frontend build OK
```

### Parte 2: Database Setup (5 min)

**Railway:**

1. Ir em https://railway.app → Dashboard
2. New Project → Add Service → Database → PostgreSQL
3. Esperar criar (2-3 min)
4. Copiar `DATABASE_URL` (está em vars de ambiente)
5. Usar em backend

**Render (alternativa):**

1. Ir em https://render.com → New → PostgreSQL
2. Preencher:
   - Name: `matheus-shop-db`
   - Region: (escolher mais perto)
3. Esperar criar
4. Copiar connection string

### Parte 3: Backend Deploy (10 min)

**Opção A: Railway (Recomendado)**

1. Railway Dashboard → New Project → Connect GitHub
2. Selecionar repositório `matheus-leme-shop`
3. Railway detecta Dockerfile automaticamente
4. Environment > Add Variable:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=<generated>
   NODE_ENV=production
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
   MERCADOPAGO_WEBHOOK_SECRET=...
   FRONTEND_URL=https://seu-frontend.com
   WEBHOOK_URL=https://seu-backend.railway.app/api/payments/webhook
   SENTRY_DSN=<optional>
   ```
5. Deploy começa automaticamente
6. Esperar ~3 min para build e start
7. Copiar URL pública: `https://your-backend.railway.app`

**Opção B: Render**

1. Ir em https://render.com → New Web Service
2. Connect GitHub → selecionar repo
3. Configurar:
   - Service name: `matheus-leme-backend`
   - Runtime: Docker
   - Plan: Starter ($7/mês)
4. Advanced > Add Environment Variable (mesmas acima)
5. Deploy
6. Esperar build (~5 min)

### Parte 4: Frontend Deploy (10 min)

**Opção A: Vercel (Recomendado)**

1. Instalar Vercel CLI:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel deploy --prod
   ```

3. Dashboard Vercel → Settings > Environment:
   ```
   VITE_API_URL=https://seu-backend.railway.app/api
   VITE_MERCADOPAGO_PUBLIC_KEY=<public key>
   ```

4. Redeploy após adicionar variáveis

**Opção B: Netlify**

1. Dashboard Netlify → New site from Git
2. Select GitHub repo
3. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
4. Add environment variables
5. Deploy

### Parte 5: MercadoPago Webhook (5 min)

1. Ir em https://www.mercadopago.com/developers/panel
2. Credentials (copiar Access Token)
3. Settings > Integrations > Webhooks > Add Webhook
4. URL: `https://seu-backend.railway.app/api/payments/webhook`
5. Salvar
6. Test webhook (Railroad envia teste)

### Parte 6: Test Everything (5 min)

```bash
# 1. Health check
curl https://seu-backend.railway.app/api/health
# Deve retornar: {"status":"OK","message":"Backend is running"}

# 2. Frontend carrega
Abrir https://seu-frontend.vercel.app

# 3. Testar login (se usuário de teste existe)
# Usar credenciais de teste

# 4. Testar pagamento com cartão de teste MercadoPago
# Usar cartão: 4111 1111 1111 1111
# Exp: 11/25, CVV: 123
```

---

## Critical Environment Variables Reference

| Var | Where | What |
|-----|-------|------|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | 32+ hex characters (generate!) |
| `NODE_ENV` | Backend | MUST be `production` |
| `MERCADOPAGO_ACCESS_TOKEN` | Backend | From MercadoPago dashboard |
| `MERCADOPAGO_WEBHOOK_SECRET` | Backend | From MercadoPago dashboard |
| `FRONTEND_URL` | Backend | Your frontend URL (for CORS) |
| `WEBHOOK_URL` | Backend | Backend URL + `/api/payments/webhook` |
| `VITE_API_URL` | Frontend | Backend URL + `/api` |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Frontend | From MercadoPago dashboard |

---

## Files Created for Production

```
matheus-leme-shop/
├── docker-compose.prod.yml          # Production compose (reference)
├── railway.json                      # Railway config
├── render.yaml                       # Render config (alternative)
├── DEPLOY.md                         # Full deployment guide (this file)
├── SECURITY.md                       # Security checklist & implementation
├── DEPLOYMENT_CHECKLIST.md           # Pre-flight checklist
├── PRODUCTION_SETUP.md               # This file - quick start
├── .env.production.example           # Template for secrets (NEVER commit)
├── backend/
│   ├── .env.production.example       # Backend secrets template
│   └── Dockerfile                    # Already configured
├── frontend/
│   ├── .env.production.example       # Frontend env template
│   └── Dockerfile                    # Already configured (multi-stage)
└── scripts/
    └── generate-secrets.js           # Script to generate random secrets
```

---

## After Deployment

### 1. Verify Everything Works

```bash
# Health check - Backend
curl https://seu-backend.railway.app/api/health

# Frontend loads
curl https://seu-frontend.vercel.app

# No 404 or 500 errors
```

### 2. Setup Monitoring

**Sentry (Error Tracking):**
```bash
# 1. Sign up at https://sentry.io (free tier)
# 2. Create project
# 3. Copy DSN to:
#    - Backend: SENTRY_DSN env var
#    - Frontend: VITE_SENTRY_DSN env var
# 4. Redeploy
```

**BetterUptime (Uptime Monitoring):**
```bash
# 1. Sign up at https://betteruptime.com (free tier)
# 2. Add monitor: https://seu-backend/api/health
# 3. Configure alertas (email)
```

### 3. Setup Custom Domain (Optional)

**Vercel Frontend:**
```bash
# Dashboard > Settings > Domains
# Add domain: seu-dominio.com
# Configure DNS CNAME at your registrar
```

**Backend:**
```bash
# Railway: não suporta custom domain grátis
# Usar URL padrão: seu-backend.railway.app
# Ou upgrade para pagar
```

### 4. Enable Auto-deployments

```bash
# Railway & Vercel auto-deploy quando push para main
git push origin main
# Deployment inicia automaticamente
```

---

## Troubleshooting

### Backend não inicia

```bash
# Ver logs
railway logs --tail

# Verificar:
# 1. DATABASE_URL é válida
# 2. NODE_ENV=production
# 3. JWT_SECRET está setado
```

### Frontend não conecta ao backend

**Error no console:** `CORS error`

Verificar:
1. `VITE_API_URL` é `https://` (não `http://`)
2. Backend CORS permite frontend URL
3. Backend está running

### Pagamento não funciona

1. MercadoPago credentials são válidas?
2. Webhook URL está configurado?
3. Usar cartão de teste: `4111 1111 1111 1111`

---

## Scaling Later

**When you have users:**

- [ ] Increase database plan (if CPU > 80%)
- [ ] Enable caching (Redis)
- [ ] Setup CDN for frontend
- [ ] Implement rate limiting (já feito, mas verificar)
- [ ] Database backups (já automático)

---

## Security Checklist

- [x] HTTPS everywhere (automático)
- [x] CORS restrito (configurado)
- [x] JWT com expiração (7 dias)
- [x] Passwords com bcrypt
- [x] SQL injection protegido
- [x] Secrets em variáveis, não no código
- [x] Health check implementado
- [x] Logging & monitoring

**Falta implementar:**
- [ ] Rate limiting (helmet e express-rate-limit)
- [ ] Input validation (joi ou yup)
- [ ] Sentry integration

---

## Support

| Issue | Solution |
|-------|----------|
| Deploy fails | Check logs, verify DATABASE_URL, check if Dockerfile builds locally |
| 502 Bad Gateway | Backend crashed, check logs, restart service |
| CORS errors | Verify VITE_API_URL, check backend CORS config |
| Webhook not received | Check webhook URL in MercadoPago, verify backend is up |
| SSL certificate errors | Wait 5 min (propagation), clear browser cache |

---

## Next Steps

1. ✅ Deploy backend + database
2. ✅ Deploy frontend
3. ✅ Setup MercadoPago webhook
4. ✅ Test everything
5. ⏳ Setup monitoring (Sentry + BetterUptime)
6. ⏳ Setup custom domain (opcional)
7. ⏳ Launch! 🚀

---

**Questions?** See DEPLOY.md for full guide.  
**Security concerns?** See SECURITY.md.  
**Before deploying?** Use DEPLOYMENT_CHECKLIST.md.

---

**Last updated:** 2026-08-21
