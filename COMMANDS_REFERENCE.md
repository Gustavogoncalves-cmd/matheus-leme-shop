# Command Reference - Deployment & Production

Referência rápida de todos os comandos necessários para deploy e produção.

---

## Generate Secrets

```bash
# Gerar JWT_SECRET (32 bytes = 256 bits)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou usar o script
node scripts/generate-secrets.js
```

---

## Local Testing

```bash
# Backend
cd backend
npm install
npm test
npm start

# Frontend
cd frontend
npm install
npm test
npm run build
npm run preview
```

---

## Railway Deployment

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy backend
cd backend
railway up

# View logs
railway logs --tail

# Get status
railway status

# Connect to database
railway db shell

# Backup database
railway db backup create
railway db backup list
railway db restore <backup-id>
```

---

## Render Deployment

```bash
# Via GitHub integration (recomendado)
# 1. Connect repo em https://render.com
# 2. Configure build settings
# 3. Push para main (auto-deploy)

# Manual deployment (if needed)
# Deploy via Render CLI (se existir) ou dashboard
```

---

## Vercel Deployment

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel deploy --prod

# View logs
vercel logs <deployment-url>

# Link existing project
vercel link
```

---

## Netlify Deployment

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy --prod

# View logs
netlify logs
```

---

## Database Operations

```bash
# Connect via psql
psql postgresql://user:password@host:5432/database

# Run migrations
cd backend
npm run migrate

# Initialize database
npm run init-db

# Seed database (if needed)
npm run seed

# Backup/Restore (via platform CLI)
railway db backup create
railway db restore <backup-id>
```

---

## Testing & Verification

```bash
# Health check
curl https://your-backend.railway.app/api/health

# Test login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Test CORS
curl -I https://your-backend.railway.app/api/products \
  -H "Origin: https://your-frontend.vercel.app"

# List users
psql -d database_url -c "SELECT * FROM users;"
```

---

## Git & GitHub

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Deploy production setup"

# Push (triggers auto-deploy)
git push origin main

# Force push (⚠️ careful!)
git push origin main --force

# Checkout version
git checkout v1.0.0

# Create tag
git tag v1.0.0
git push origin v1.0.0
```

---

## GitHub Actions

```bash
# Trigger workflow manually
gh workflow run deploy.yml

# View workflow results
gh workflow view deploy.yml

# Check recent runs
gh run list --workflow deploy.yml
```

---

## Environment Variables

```bash
# Backend secrets setup
export DATABASE_URL="postgresql://user:pass@host:5432/db"
export JWT_SECRET="generated_32_byte_hex"
export NODE_ENV="production"
export MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."

# Frontend
export VITE_API_URL="https://your-backend.railway.app/api"
export VITE_MERCADOPAGO_PUBLIC_KEY="your_public_key"
```

---

## Monitoring & Logs

```bash
# Railway logs
railway logs --tail

# Vercel logs
vercel logs <url>

# Docker logs (if running locally)
docker-compose logs -f

# Error tracking (Sentry)
# View in https://sentry.io

# Uptime monitoring (BetterUptime)
# View in https://betteruptime.com
```

---

## Database Management

```bash
# Connect to production database
psql $DATABASE_URL

# List tables
\dt

# Describe table
\d table_name

# Show users
SELECT id, email FROM users;

# Show orders
SELECT * FROM orders ORDER BY created_at DESC;

# Manual backup (if not using auto-backup)
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting

```bash
# Check if backend is running
curl https://your-backend.railway.app/api/health

# Check CORS headers
curl -vv -H "Origin: https://your-frontend" https://your-backend.railway.app/api/products

# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# View recent errors
# Railway: railway logs --tail
# Sentry: https://sentry.io

# Restart service
railway restart
# or via dashboard
```

---

## Cleanup & Maintenance

```bash
# Remove node_modules
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf backend/node_modules

# Clear npm cache
npm cache clean --force

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit
npm audit fix

# Clear git cache (for .gitignore changes)
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

---

## Docker

```bash
# Build production image
docker build -t matheus-shop-backend:prod ./backend
docker build -t matheus-shop-frontend:prod ./frontend

# Run with compose
docker-compose -f docker-compose.prod.yml up

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Remove volumes
docker-compose down -v
```

---

## Security

```bash
# Scan for secrets
grep -r "password\|secret\|token" backend/src/ --include="*.js"

# Audit npm packages
npm audit

# Check Node.js security
npm list | grep "high\|critical"

# View environment variables (don't commit!)
cat .env.production
```

---

## DNS & Domain

```bash
# Check DNS propagation
dig your-domain.com
nslookup your-domain.com

# Check SSL certificate
openssl s_client -connect your-domain.com:443

# Verify HTTPS
curl -vv https://your-domain.com
```

---

## Deployment Checklists (One-liners)

```bash
# Pre-deployment
npm test && npm run build && echo "✅ Ready to deploy"

# Post-deployment verification
curl https://your-backend.railway.app/api/health && \
curl https://your-frontend.vercel.app && \
echo "✅ All systems online"

# Full deployment (backend only)
cd backend && npm test && railway up && railway logs --tail

# Full deployment (frontend only)
cd frontend && npm run build && vercel deploy --prod
```

---

## Help & Docs

```bash
# Railway help
railway help
railway service help
railway db help

# Vercel help
vercel help
vercel help deploy

# Netlify help
netlify help

# Git help
git help
git help push
```

---

**Last updated:** 2026-08-21

💡 **Pro tip:** Bookmarkmark this file for quick reference during deployments!
