# Production Deployment Checklist

Pre-flight checklist para deploy em produção. Verificar todos os itens antes de fazer push para produção.

**Date:** _______________  
**Deployer:** _______________  
**Environment:** ☐ Staging ☐ Production

---

## 1. Code Readiness

- [ ] Branch está atualizado com `main`
- [ ] Todos os commits estão feitos e pusheados
- [ ] Nenhuma mudança local não commitada
- [ ] Testes passam localmente:
  ```bash
  npm test                    # Backend tests
  cd frontend && npm test     # Frontend tests
  ```
- [ ] Linter não retorna erros:
  ```bash
  npm run lint                # Se existe
  ```
- [ ] Build funciona sem warnings:
  ```bash
  npm run build               # Frontend build
  cd backend && npm start     # Verificar se inicia
  ```
- [ ] Nenhuma console.error ou console.log de debug
- [ ] Nenhum arquivo temporário commitado
- [ ] .gitignore está completo (node_modules, .env, etc.)

---

## 2. Environment Variables

### Backend

- [ ] `.env.production.example` existe e está atualizado
- [ ] Todos os `process.env` usados estão documentados
- [ ] Variáveis críticas:
  - [ ] `DATABASE_URL` - Connection string válida
  - [ ] `JWT_SECRET` - 32+ caracteres hex
  - [ ] `NODE_ENV=production`
  - [ ] `MERCADOPAGO_ACCESS_TOKEN` - Token válido
  - [ ] `MERCADOPAGO_WEBHOOK_SECRET` - Secret válido
  - [ ] `FRONTEND_URL` - URL correta (https://)
  - [ ] `WEBHOOK_URL` - URL correta (https://)
- [ ] Nenhuma variável com valores de teste/desenvolvimento
- [ ] Secrets não estão em nenhum arquivo commitado

### Frontend

- [ ] `.env.production.example` existe
- [ ] Variáveis críticas:
  - [ ] `VITE_API_URL` - URL correta (https://)
  - [ ] `VITE_MODE=production`
  - [ ] Nenhuma variável de teste
- [ ] Build com `npm run build` passa sem warnings

---

## 3. Database

- [ ] PostgreSQL está provisionado (Railway/Render)
- [ ] Connection string validada:
  ```bash
  psql postgresql://user:pass@host:5432/dbname -c "SELECT version();"
  ```
- [ ] Todas as migrations estão aplicadas:
  ```bash
  npm run migrate
  ```
- [ ] Schema está correto:
  ```bash
  npm run init-db
  ```
- [ ] Backup automático está ativado
- [ ] Restore procedure foi testada
- [ ] Database user tem permissões limitadas (não é superuser)

---

## 4. Security

- [ ] HTTPS habilitado em frontend e backend
- [ ] CORS configurado corretamente:
  - [ ] Apenas frontend URL está permitida
  - [ ] Wildcard * não está usado
- [ ] Rate limiting implementado:
  ```bash
  grep -r "rate-limit" backend/src/
  ```
- [ ] Helmet.js instalado e usado (segurança headers)
- [ ] Input validation implementado
- [ ] Senhas usando bcrypt
- [ ] JWT tokens com expiração configurada
- [ ] SQL injection protegido (parameterized queries)
- [ ] No hardcoded secrets no código:
  ```bash
  grep -r "password\|secret\|token" backend/src/ --include="*.js"
  ```
- [ ] Dependências sem vulnerabilidades críticas:
  ```bash
  npm audit
  ```

---

## 5. Monitoring & Logging

- [ ] Sentry DSN configurado:
  - [ ] Backend integrado com Sentry
  - [ ] Frontend integrado com Sentry
  - [ ] Projeto criado em sentry.io
  - [ ] DSN está em variáveis de ambiente

- [ ] Uptime monitoring configurado (BetterUptime):
  - [ ] Health check endpoint monitored
  - [ ] Alertas configurados para downtime

- [ ] Log aggregation (opcional mas recomendado):
  - [ ] Railway logs accessible
  - [ ] Render logs accessible
  - [ ] Vercel/Netlify logs accessible

---

## 6. Payment Integration (MercadoPago)

- [ ] MercadoPago credenciais válidas:
  ```bash
  curl -H "Authorization: Bearer TOKEN" \
    https://api.mercadopago.com/v1/users/me
  ```
- [ ] Webhook URL configurada no painel MercadoPago
- [ ] Webhook secret armazenado em variável de ambiente
- [ ] Teste de pagamento (com cartão de teste):
  - [ ] Pagamento completa com sucesso
  - [ ] Webhook recebe notificação
  - [ ] Ordem é criada no banco de dados
  - [ ] Email de confirmação enviado (se implementado)

---

## 7. API Testing

- [ ] Health check endpoint retorna 200:
  ```bash
  curl https://seu-backend/api/health
  ```
- [ ] Authentication funciona:
  ```bash
  curl -X POST https://seu-backend/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}'
  ```
- [ ] Products endpoint retorna dados:
  ```bash
  curl https://seu-backend/api/products
  ```
- [ ] CORS headers estão corretos:
  ```bash
  curl -I https://seu-backend/api/products \
    -H "Origin: https://seu-frontend"
  # Deve ter Access-Control-Allow-Origin header
  ```

---

## 8. Frontend Testing

- [ ] Build completa sem erros:
  ```bash
  npm run build
  ls dist/
  # Deve ter index.html e assets/
  ```
- [ ] Lighthouse score > 90:
  - [ ] Performance
  - [ ] Accessibility
  - [ ] Best Practices
  - [ ] SEO

- [ ] Testes no browser (múltiplos):
  - [ ] Chrome/Chromium
  - [ ] Firefox
  - [ ] Safari
  - [ ] Mobile browsers

- [ ] Funcionalidades críticas:
  - [ ] Login/Logout funciona
  - [ ] Product listing carrega
  - [ ] Cart funciona
  - [ ] Checkout funciona
  - [ ] Pagamento processa corretamente

---

## 9. Domain & DNS

- [ ] Domínio registrado e válido
- [ ] DNS apontando para a plataforma:
  - [ ] Frontend: CNAME apontando para Vercel/Netlify
  - [ ] Backend: (opcional) CNAME apontando para Railway/Render

- [ ] SSL Certificate válido:
  ```bash
  openssl s_client -connect seu-dominio.com:443
  # Deve mostrar certificado válido
  ```

- [ ] DNS propagado globalmente:
  ```bash
  dig seu-dominio.com
  nslookup seu-dominio.com
  ```

---

## 10. Deployment Execution

### Backend Deploy (Railway)

- [ ] Criar projeto Railway
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Build completa sem erros:
  ```bash
  railway build
  ```
- [ ] Deployment bem-sucedido
- [ ] Health check responde

### Frontend Deploy (Vercel)

- [ ] Criar projeto Vercel
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Build completa:
  ```bash
  npm run build
  ```
- [ ] Deployment bem-sucedido
- [ ] Site carrega sem erros

### Database (PostgreSQL)

- [ ] PostgreSQL provisionado
- [ ] Migrations aplicadas
- [ ] Backup automático ativado

---

## 11. Post-Deployment Validation

- [ ] Frontend URL carrega sem erros
- [ ] Console não tem erros de JavaScript
- [ ] Network requests para backend recebem responses
- [ ] Sentry recebe eventos (sem erros críticos)
- [ ] Health check monitora corretamente
- [ ] Logs estão sendo agregados

### End-to-End Tests

- [ ] Login com usuário de teste:
  ```bash
  Email: test@example.com
  Password: test123456
  ```
- [ ] Browsear produtos
- [ ] Adicionar produto ao carrinho
- [ ] Fazer checkout
- [ ] Processar pagamento (ambiente de teste MercadoPago)
- [ ] Receber webhook de pagamento
- [ ] Ordem ser criada no banco

---

## 12. Rollback Plan

Se algo der errado:

- [ ] Versão anterior está identificada (git tag/commit)
- [ ] Backup de banco de dados foi feito
- [ ] Rollback procedure documentado:
  ```bash
  # Railway
  railway restart
  
  # Ou redeploy da versão anterior
  git checkout v1.0.0
  git push origin main --force  # ⚠️ Cuidado!
  ```

- [ ] Database rollback procedure:
  ```bash
  # Restore do backup mais recente
  railway db restore <backup-id>
  ```

- [ ] Comunicação com usuários preparada (status page)

---

## 13. Documentation

- [ ] DEPLOY.md existe e está atualizado
- [ ] SECURITY.md existe e está atualizado
- [ ] README.md tem instruções de setup
- [ ] Arquivo de CHANGELOG atualizado
- [ ] Runbook de incidentes existe
- [ ] Credenciais armazenadas em password manager

---

## 14. Team Communication

- [ ] Equipe notificada sobre deploy
- [ ] Status page atualizado
- [ ] Plano de rollback compartilhado
- [ ] On-call person identificado
- [ ] Processo de escalação documentado

---

## 15. Final Pre-Deployment

- [ ] Todos os checkboxes acima estão ✓
- [ ] Teste final em staging (se existe)
- [ ] Code review aprovado
- [ ] Manager/Lead approval obtido
- [ ] Horário de deploy agendado (evitar horários de pico)
- [ ] Ninguém faz deploy simultâneo

---

## Deployment

```bash
# Fazer push para main (dispara auto-deploy)
git push origin main

# Ou deploy manual
railway up              # Railway backend
vercel deploy --prod    # Vercel frontend
```

**Horário de deploy:** _______________  
**Duração esperada:** ~5-10 minutos  

---

## Post-Deployment Monitoring (Primeiras 24h)

- [ ] Verificar logs cada 15 minutos (primeira hora)
- [ ] Sentry para erros críticos
- [ ] Uptime monitoring para alertas
- [ ] Verificar métricas de performance
- [ ] User feedback (se aplicável)

**Issues encontradas:**
```
[Descrever qualquer issue ou deixar "Nenhuma"]
```

---

## Sign-off

| Role | Name | Date | Time |
|------|------|------|------|
| Deployer | _____________ | _____________ | _____________ |
| Lead/Manager | _____________ | _____________ | _____________ |
| QA (if applicable) | _____________ | _____________ | _____________ |

---

## Links Úteis

- Railway Dashboard: https://dashboard.railway.app
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Netlify Dashboard: https://app.netlify.com
- MercadoPago Dashboard: https://www.mercadopago.com/developers/panel
- Sentry Dashboard: https://sentry.io
- BetterUptime Dashboard: https://betteruptime.com

---

**Last updated:** 2026-08-21  
**Version:** 1.0
