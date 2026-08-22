# Production Deployment Guide - Matheus Leme Shop

Guia completo para deploy em produção da aplicação Matheus Leme Shop (Backend + Frontend + Database).

**Última atualização:** 2026-08-21

---

## Índice

1. [Overview](#overview)
2. [Pré-requisitos](#pré-requisitos)
3. [Escolha da Plataforma](#escolha-da-plataforma)
4. [Backend Deploy](#backend-deploy)
5. [Frontend Deploy](#frontend-deploy)
6. [Database Setup](#database-setup)
7. [Security Checklist](#security-checklist)
8. [Monitoramento](#monitoramento)
9. [Domain & DNS](#domain--dns)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Stack:
- **Backend:** Node.js + Express (API REST)
- **Frontend:** Vue 3 + Vite (SPA)
- **Database:** PostgreSQL (managed)
- **Payment:** MercadoPago
- **Deployment:** Railway/Render (recomendado) ou Vercel/Netlify

Arquitetura:
```
[Frontend - Vercel/Netlify]
           ↓
[Backend - Railway/Render]
           ↓
[PostgreSQL - Railway/Render managed]
```

---

## Pré-requisitos

### Contas necessárias

- [ ] Railway (`railway.app`) - Backend + Database
  - OU Render (`render.com`) - Backend + Database
  - OU Heroku (`heroku.com`) - Backend + Database
- [ ] Vercel (`vercel.com`) - Frontend
  - OU Netlify (`netlify.com`) - Frontend
- [ ] GitHub - Repositório do projeto
- [ ] MercadoPago - Credenciais de pagamento
- [ ] Sentry (`sentry.io`) - Error tracking (free tier)
- [ ] CloudFlare/Route53/NameCheap - DNS management

### Ferramentas locais

```bash
# Node.js 20+ e npm
node --version    # v20+
npm --version

# Git
git --version

# Docker (opcional, se usar compose local)
docker --version

# CLI tools
npm install -g @railway/cli    # Para Railway
npm install -g vercel          # Para Vercel
```

---

## Escolha da Plataforma

### Opção A: Railway + Vercel (RECOMENDADO) ⭐

**Vantagens:**
- Railway: PostgreSQL managed, auto-scaling, $5/mês mínimo
- Vercel: Deploy automático com git push, serverless
- Zero downtime deployments
- Built-in SSL/HTTPS

**Custo:**
- Railway Backend: ~$10-30/mês (depends on usage)
- Railway PostgreSQL: ~$10-15/mês
- Vercel: Grátis (com limite de 100GB bandwidth)

**Setup: ~30 min**

---

### Opção B: Render + Netlify

**Vantagens:**
- Render: Full PaaS, PostgreSQL managed, starting $7/mês
- Netlify: Deploy automático, great for SPAs
- Built-in SSL/HTTPS

**Custo:**
- Render Backend: ~$7-20/mês
- Render PostgreSQL: ~$10-15/mês
- Netlify: Grátis (com limite)

**Setup: ~30 min**

---

### Opção C: Self-hosted (Droplet/EC2)

**Vantagens:**
- Controle total
- Sem limitações da plataforma

**Desvantagens:**
- Mais caro ($5-20+/mês)
- Gerenciamento manual
- Requer DevOps knowledge

---

## Backend Deploy

### 1. Prepare o Backend

```bash
# No diretório raiz do projeto
cd backend

# Verificar package.json
cat package.json

# Não incluir node_modules no deploy
# Verificar .gitignore
cat ../.gitignore  # Deve incluir "node_modules"
```

**Verificar que Dockerfile está ok:**
```bash
cat Dockerfile
# Deve usar Node 20-alpine, npm ci --only=production, healthcheck em /health
```

### 2. Deploy no Railway (Recomendado)

#### 2.1 Create Railway project

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd ~/obsidian-second-brain/projects/matheus-leme-shop
railway init

# Select "Create a new project" → "matheus-leme-shop"
```

#### 2.2 Configure Backend Service

```bash
# Link backend directory
cd backend
railway init

# A plataforma detectará o Dockerfile automaticamente
# Ou configure manualmente no dashboard
```

#### 2.3 Configure Environment Variables

No dashboard Railway (`dashboard.railway.app`):

```
Settings > Environment Variables
```

Adicionar:
```
NODE_ENV=production
JWT_SECRET=<generate com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
MERCADOPAGO_ACCESS_TOKEN=<do seu painel MercadoPago>
MERCADOPAGO_WEBHOOK_SECRET=<do seu painel MercadoPago>
FRONTEND_URL=https://seu-frontend.com
WEBHOOK_URL=https://seu-backend.railway.app/api/payments/webhook
DATABASE_URL=<será fornecido após criar PostgreSQL>
SENTRY_DSN=<optional>
```

#### 2.4 Deploy

```bash
# Deploy automaticamente
railway up

# Ou via GitHub push
git push origin main  # Dispara deploy se Railway estiver conectada ao GitHub
```

**Verificar status:**
```bash
railway status
railway logs --tail  # Ver logs em tempo real
```

#### 2.5 Get Backend URL

```bash
railway service connect
# Ou no dashboard: Settings > Domains
# Copiar URL pública: https://matheus-leme-shop-api.railway.app
```

---

### 3. Deploy no Render (Alternativa)

#### 3.1 Create Render account

Ir em `https://render.com` → Sign up → New+ → Web Service

#### 3.2 Connect GitHub repository

```
Select Repository > matheus-leme-shop
```

#### 3.3 Configure Build & Deploy

```
Environment: Docker
Build Command: (deixar vazio - Dockerfile presente)
Start Command: (deixar vazio - Dockerfile presente)
Instance Type: Standard (starter)
```

#### 3.4 Environment Variables

```
NODE_ENV=production
JWT_SECRET=<generate>
MERCADOPAGO_ACCESS_TOKEN=<>
MERCADOPAGO_WEBHOOK_SECRET=<>
FRONTEND_URL=https://seu-frontend.com
DATABASE_URL=<será fornecido>
```

#### 3.5 Deploy

```
Create Web Service → Deploy
```

---

## Frontend Deploy

### 1. Prepare o Frontend

```bash
cd frontend

# Verificar build
npm run build

# Verificar que dist/ foi criado
ls dist/
# Deve ter index.html + assets/

# Verificar variáveis de ambiente
cat .env.example
# Deve ter: VITE_API_URL, VITE_STRIPE_PUBLIC_KEY (deprecated), VITE_MERCADOPAGO_PUBLIC_KEY
```

### 2. Deploy no Vercel (Recomendado)

#### 2.1 Create Vercel account

```bash
npm install -g vercel
vercel login
```

#### 2.2 Deploy

```bash
cd frontend
vercel deploy --prod
```

#### 2.3 Configure Environment

No dashboard Vercel (`vercel.com/dashboard`):

```
Project Settings > Environment Variables
```

Adicionar:
```
VITE_API_URL=https://seu-backend.railway.app/api
VITE_MERCADOPAGO_PUBLIC_KEY=xxxx
```

#### 2.4 Setup Custom Domain

```
Settings > Domains > Add Domain
```

Configure DNS records (A/CNAME) no seu registrador.

#### 2.5 Auto-deploy com GitHub

```
Git Integration > Import Git Repository
```

Configure webhook para auto-deploy em cada push para `main`.

---

### 3. Deploy no Netlify (Alternativa)

#### 3.1 Connect GitHub

```
https://app.netlify.com → New site from Git → GitHub
```

#### 3.2 Build Settings

```
Build command: npm run build
Publish directory: dist
```

#### 3.3 Environment Variables

```
VITE_API_URL=https://seu-backend.railway.app/api
VITE_MERCADOPAGO_PUBLIC_KEY=xxxx
```

#### 3.4 Deploy

Push para GitHub → Netlify auto-deploya.

---

## Database Setup

### 1. Create PostgreSQL no Railway

No dashboard Railway:

```
New > Database > PostgreSQL
```

Configurar:
```
Name: matheus-shop-db
Version: Latest
Plan: Starter ($10/mês)
```

### 2. Create PostgreSQL no Render

No dashboard Render:

```
New+ > PostgreSQL
```

Configurar:
```
Name: matheus-shop-db
PostgreSQL Version: Latest
Instance Type: Standard
```

### 3. Initialize Database

Obter `DATABASE_URL` do painel de PostgreSQL.

Rodar migrations:

```bash
# Localmente (conectar via SSH ou via connection string)
# Ou via Railway CLI:
railway run npm run migrate

# Ou via Render CLI similar

# Ou via psql:
psql postgresql://user:pass@host:5432/dbname < scripts/init-db.sql
```

**Scripts esperados:**
- `backend/scripts/migrate.js` - Run migrations
- `backend/scripts/init-db.js` - Initialize schema
- `backend/seeds/products.js` - Seed products (opcional)

### 4. Backup Automático

**Railway:**
```
Settings > Database > Backups > Enabled
```

**Render:**
```
Settings > Backups > Daily backups
```

---

## Security Checklist

### [ ] Environment Variables

- [ ] JWT_SECRET é forte (32+ hex chars)
- [ ] MercadoPago credentials são válidas
- [ ] DATABASE_URL não está em .env commitado
- [ ] Todas variáveis em `.env.production` estão setadas

### [ ] HTTPS

- [ ] Frontend: HTTPS automático (Vercel/Netlify)
- [ ] Backend: HTTPS automático (Railway/Render)
- [ ] API URL no frontend começa com `https://`

### [ ] CORS

**Backend (`src/middleware/cors.js` ou similar):**

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### [ ] Rate Limiting

**Backend (express-rate-limit):**

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requisições por IP
});

app.use('/api/', limiter);
```

### [ ] Security Headers

**Backend (helmet.js):**

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### [ ] Input Validation

- [ ] Todas rotas POST/PUT validam entrada (joi, yup, etc.)
- [ ] Database queries usam parameterized queries (já tem com `pg`)
- [ ] Sem concatenação de SQL strings

### [ ] XSS Protection

- [ ] Frontend: Vue 3 escapa HTML por default
- [ ] Backend: Validar entrada, escapar output

### [ ] CSRF Protection

Se necessário:
```bash
npm install csurf
```

### [ ] SQL Injection

✅ Já protegido - usando `pg` client com parameterized queries

### [ ] Authentication

- [ ] JWT tokens em Authorization header
- [ ] Tokens expiram em 7d
- [ ] Refresh tokens implementados (opcional)

### [ ] Sensitive Data

- [ ] Passwords com bcrypt (já tem)
- [ ] Logs não contêm secrets
- [ ] Error messages não revelam estrutura interna

---

## Monitoramento

### 1. Error Tracking com Sentry

#### 1.1 Criar conta

```
https://sentry.io → Sign up (free tier)
```

#### 1.2 Configure Backend

```bash
npm install @sentry/node
```

**Backend (`src/index.js` ou similar):**

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

#### 1.3 Configure Frontend

```bash
npm install @sentry/vue
```

**Frontend (`src/main.js`):**

```javascript
import * as Sentry from "@sentry/vue";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1
});
```

**No .env.production:**
```
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
```

### 2. Uptime Monitoring

```
https://betteruptime.com → Free tier
```

Configure monitoring de `https://seu-backend/api/health`

Alertas via email/SMS se o serviço cair.

### 3. Log Aggregation

**Opção A: Datadog (paid)**
```
https://datadog.com
```

**Opção B: LogRocket (frontend only)**
```
https://logrocket.com → Free tier
```

**Opção C: Built-in Logs**
- Railway: `railway logs`
- Render: Dashboard > Logs
- Vercel: Dashboard > Deployments > Logs
- Netlify: Dashboard > Deploys > Logs

### 4. Performance Monitoring

**Frontend:**
- [ ] Web Vitals: Usar `web-vitals` library
- [ ] DevTools: Check Lighthouse scores (target 90+)
- [ ] Bundle size: `npm run build` → Check `dist/` tamanho

**Backend:**
- [ ] Response time: < 200ms (99th percentile)
- [ ] Database connection pool: Check status
- [ ] Memory usage: < 512MB (production limit)

---

## Domain & DNS

### 1. Register Domain

Registradores populares:
- NameCheap (`namecheap.com`)
- GoDaddy (`godaddy.com`)
- Route53 (`aws.amazon.com`)
- CloudFlare (`cloudflare.com`)

### 2. Configure DNS

#### 2.1 Frontend Domain

**Vercel:**
- Adicionar CNAME record no seu DNS
- `www` → `alias.vercel.app`
- `@` (root) → `76.76.19.0` (A record)

**Netlify:**
- Adicionar CNAME record
- `www` → `your-site.netlify.app`

#### 2.2 Backend Domain (opcional)

**Railway/Render:**
- Usar subdomain: `api.seu-dominio.com`
- CNAME → `seu-backend.railway.app`

Ou deixar como é: `seu-backend.railway.app` (sem custom domain)

### 3. SSL Certificate

✅ Automático:
- Vercel: SSL automático
- Netlify: SSL automático
- Railway: SSL automático
- Render: SSL automático

### 4. Configure DNS MX (opcional)

Se usar email:
```
Registrador > DNS Settings > MX Record
```

---

## Deployment Checklist Final

### Pre-deployment

- [ ] Testar localmente com `docker-compose.yml`
- [ ] Rodar testes: `npm test`
- [ ] Build frontend: `npm run build` → Sem warnings
- [ ] Verificar migrations são idempotentes
- [ ] Backup banco de dados (se migrar dados)

### During deployment

- [ ] Criar backups antes de push para prod
- [ ] Verificar que `DATABASE_URL` está correto
- [ ] Verificar que `JWT_SECRET` está setado e é forte
- [ ] Testar health check: `curl https://seu-backend/api/health`

### Post-deployment

- [ ] Testar frontend carrega sem erros
- [ ] Testar login/autenticação
- [ ] Testar checkout com MercadoPago (ambiente test)
- [ ] Verificar logs para erros
- [ ] Testar de múltiplos dispositivos/navegadores
- [ ] Verificar SEO (meta tags, robots.txt)
- [ ] Verificar performance (Lighthouse score 90+)

---

## Troubleshooting

### Backend não inicia

```bash
# Ver logs
railway logs --tail
# ou
render logs --follow
```

**Causas comuns:**
- `DATABASE_URL` inválida → Verificar connection string
- `NODE_ENV` não está `production` → Adicionar env var
- `JWT_SECRET` não setado → Adicionar env var
- Port não é 3000 → Verificar Dockerfile

### Frontend não conecta backend

**Erro no console:** `CORS error`

Verificar:
- [ ] `VITE_API_URL` é correto (com https://)
- [ ] Backend CORS aceita frontend URL
- [ ] Backend está rodando e accessible

### Database conexão falha

```bash
# Testar conexão
psql postgresql://user:pass@host:5432/dbname

# Via Railway
railway run psql
```

**Causas comuns:**
- IP não está whitelisted (Railway/Render auto-permite)
- Credenciais incorretas
- Database service não está running

### Payment webhook não funciona

**MercadoPago Dashboard:**
```
Settings > Integrations > Webhooks > Configure URL
```

URL deve ser:
```
https://seu-backend.railway.app/api/payments/webhook
```

Testar:
```bash
curl -X POST https://seu-backend/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment"}'
```

### Memory leak / Crashes

1. Verificar logs com Sentry
2. Verificar memory usage:
   ```
   Railway: Metrics > Memory
   ```
3. Implementar connection pool:
   ```javascript
   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000
   });
   ```

### Slow API responses

1. Verificar database queries (usar índices)
2. Adicionar caching (Redis)
3. Implementar pagination
4. Verificar N+1 queries

---

## Maintenance

### Regular Tasks

- [ ] Semanal: Revisar logs e Sentry errors
- [ ] Semanal: Testar backup/restore database
- [ ] Mensal: Revisar performance metrics
- [ ] Trimestral: Atualizar dependências (`npm audit fix`)
- [ ] Anual: Security audit (penetration testing)

### Scaling

**When to scale:**

- **Frontend:** Vercel auto-escalas (sem ação)
- **Backend:** Railway/Render auto-escalas (por padrão)
- **Database:** Aumentar plan se CPU > 80% consistentemente

### Zero-downtime Deployments

**Railway/Render/Vercel:** Automático

**Manual (se auto-deploy desabilitado):**

```bash
# 1. Deploy nova versão
railway up

# 2. Verificar health check
curl https://seu-backend/api/health

# 3. Switch traffic (automático)
```

---

## Support & Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MercadoPago Docs: https://developers.mercadopago.com
- Sentry Docs: https://docs.sentry.io
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html

---

**Próximos passos após deploy:**

1. ✅ Testar tudo em produção
2. ✅ Configurar monitoring (Sentry + BetterUptime)
3. ✅ Configurar alertas para downtime/errors
4. ✅ Criar runbook de incidentes
5. ✅ Documentar password reset procedure
6. ✅ Treinar team em deployment process
