# Security Configuration - Matheus Leme Shop

Documentação de segurança e checklist de produção.

---

## Security Features Checklist

### [ ] 1. HTTPS Everywhere

- [x] Frontend: HTTPS automático (Vercel/Netlify)
- [x] Backend: HTTPS automático (Railway/Render)
- [x] API endpoints devem ser `https://`
- [x] Redirecionar HTTP → HTTPS (automático na plataforma)

**Verificar:**
```bash
curl -I https://seu-backend.railway.app/api/health
# Deve retornar 200 OK e não warnings de SSL
```

---

### [ ] 2. CORS Restriction

**Arquivo: `backend/src/middleware/cors.js`**

Criar arquivo:
```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

module.exports = cors(corsOptions);
```

**Usar no `app.js`:**
```javascript
const corsMiddleware = require('./middleware/cors');
app.use(corsMiddleware);
```

**Variável de ambiente:**
```
FRONTEND_URL=https://seu-frontend-domain.com
```

---

### [ ] 3. Security Headers com Helmet

**Instalar:**
```bash
npm install helmet
```

**Usar no `backend/src/app.js`:**
```javascript
const helmet = require('helmet');

// Apply security headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    frameSrc: ["'none'"],
    connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173']
  }
}));
```

**Headers adicionados:**
- `X-Frame-Options: DENY` - Evita clickjacking
- `X-Content-Type-Options: nosniff` - Previne MIME type sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security: max-age=31536000` - Force HTTPS
- `Content-Security-Policy` - Controlar recursos permitidos

---

### [ ] 4. Rate Limiting

**Instalar:**
```bash
npm install express-rate-limit
```

**Implementar no `backend/src/middleware/rateLimiter.js`:**
```javascript
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit para health check
    return req.path === '/api/health';
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login
  message: 'Muitas tentativas de login, tente novamente em 15 minutos',
  skipSuccessfulRequests: true
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 pagamentos por IP
  message: 'Muitas requisições de pagamento'
});

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter
};
```

**Usar no `app.js`:**
```javascript
const { generalLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimiter');

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/payments', paymentLimiter);
```

---

### [ ] 5. Input Validation

**Instalar Joi:**
```bash
npm install joi
```

**Criar validador em `backend/src/validators/auth.js`:**
```javascript
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  password: Joi.string()
    .min(6)
    .max(255)
    .required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path[0],
          message: d.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  loginSchema,
  validateRequest
};
```

**Usar na rota:**
```javascript
const { loginSchema, validateRequest } = require('../validators/auth');

router.post('/login', validateRequest(loginSchema), (req, res) => {
  // req.body já foi validado e sanitizado
  // implementar lógica de login
});
```

---

### [ ] 6. Password Security

**Instalar bcryptjs:**
```bash
npm install bcryptjs
```

**Hash password no registro:**
```javascript
const bcrypt = require('bcryptjs');

const registerUser = async (email, password) => {
  // Hash password (10 rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Salvar no banco
  return await db.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
    [email, hashedPassword]
  );
};
```

**Verificar password no login:**
```javascript
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
```

---

### [ ] 7. JWT Security

**Usar tokens com expiração:**
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
```

**Middleware de verificação:**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

### [ ] 8. SQL Injection Prevention

**✅ Já implementado com `pg` client**

Usar parameterized queries:

```javascript
// ✅ CORRETO
db.query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ ERRADO - NUNCA FAZER
db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**Verificar:**
```bash
grep -r "db.query(\`" backend/src/
# Não deve retornar resultados
```

---

### [ ] 9. XSS Prevention

**Frontend (Vue 3):**
- ✅ Vue 3 escapa HTML por padrão
- ✅ Usar `{{ variable }}` (escaped) ao invés de `v-html`
- ✅ Se precisar HTML, usar bibliotecas seguras como `DOMPurify`

**Backend:**
```bash
npm install dompurify
```

```javascript
const DOMPurify = require('dompurify').default;

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};
```

---

### [ ] 10. CSRF Protection

Se necessário (formulários HTML tradicionais):

```bash
npm install csurf
npm install cookie-parser
```

```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
const csrfProtection = csrf({ cookie: false });

app.get('/form', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/form', csrfProtection, (req, res) => {
  // CSRF token foi validado
  res.json({ status: 'OK' });
});
```

**Nota:** Se usar JWT no header (recomendado), CSRF já está protegido.

---

### [ ] 11. Dependency Vulnerabilities

**Verificar regularmente:**
```bash
npm audit
npm audit fix
```

**Configurar GitHub Dependabot:**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /backend
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
```

---

### [ ] 12. Environment Variables

**Never commit `.env.production`:**
```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

**Template para referência:**
```bash
# .env.production.example (seguro committar)
DATABASE_URL=postgres://...
JWT_SECRET=<generate with openssl>
MERCADOPAGO_ACCESS_TOKEN=<from dashboard>
```

---

### [ ] 13. Logging & Monitoring

**NÃO logar:**
- Senhas
- Tokens
- Números de cartão
- Dados pessoais

**Logar:**
- Erros e exceções
- Requisições suspeitas
- Tentativas de login falhadas

```javascript
const logger = {
  error: (msg, err) => console.error(`[ERROR] ${msg}`, err),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
  info: (msg) => console.log(`[INFO] ${msg}`)
};

// ✅ OK
logger.error('User login failed', { userId, reason: 'Invalid password' });

// ❌ NÃO
logger.info(`User ${email} logged in with password ${password}`);
```

---

### [ ] 14. Database Security

**Backup Regular:**
- [x] Railway: Automated daily backups
- [x] Render: Automated daily backups

**Verificar:**
```bash
# Railway
railway db backup list

# Render
# Dashboard > Backups
```

**Restore procedure:**
```bash
railway db restore <backup-id>
# ou via Dashboard
```

---

### [ ] 15. API Security Best Practices

**Versionamento:**
```
/api/v1/products
/api/v1/orders
```

**Validar Content-Type:**
```javascript
app.use(express.json({ strict: true }));
app.use(express.urlencoded({ extended: false, parameterLimit: 50 }));
```

**Limitar payload size:**
```javascript
app.use(express.json({ limit: '10mb' }));
```

**Disable X-Powered-By:**
```javascript
app.disable('x-powered-by');
```

---

### [ ] 16. Payment Security (MercadoPago)

**Webhook verification:**
```javascript
const crypto = require('crypto');

const verifyMercadoPagoSignature = (req) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-request-id'];
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  const signData = `${timestamp}.${JSON.stringify(req.body)}`;
  const hash = crypto
    .createHmac('sha256', secret)
    .update(signData)
    .digest('hex');

  return hash === signature;
};
```

**Validar antes de processar:**
```javascript
app.post('/api/payments/webhook', (req, res) => {
  if (!verifyMercadoPagoSignature(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Processar webhook seguro
  processPayment(req.body);
  res.json({ status: 'OK' });
});
```

---

## Security Audit Checklist

Execute antes de cada deploy em produção:

```bash
# 1. Audit dependencies
npm audit

# 2. Check for secrets
npm install --save-dev detect-secrets
detect-secrets scan

# 3. Lint code
npm run lint

# 4. Check hardcoded secrets
grep -r "password" backend/src/
grep -r "secret" backend/src/
grep -r "token" backend/src/

# 5. Verify environment variables are used
grep -r "process.env" backend/src/

# 6. Check database queries for injection
grep -r "db.query(\`" backend/src/
grep -r "db.query(\"" backend/src/
```

---

## Incident Response

**Se banco de dados for comprometido:**
1. Parar aplicação imediatamente
2. Rotear tokens JWT
3. Forçar re-autenticação dos usuários
4. Analisar logs para determine escopo do incidente
5. Notificar usuários afetados
6. Restaurar de backup limpo

**Se chaves de API forem expostas:**
1. Revogar credenciais no painel (MercadoPago, Sentry, etc.)
2. Gerar novas credenciais
3. Atualizar variáveis de ambiente
4. Re-fazer deploy
5. Monitorar uso anormal

---

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Express Security Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
- Node.js Security: https://nodejs.org/en/docs/guides/nodejs-security/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework

---

**Last updated:** 2026-08-21
**Reviewer:** Auto-generated deployment guide
