# Backend - Matheus Leme Streampacks

API Node.js + Express para gerenciar catálogo de produtos, carrinho, pedidos e pagamentos.

## Setup

### 1. Variáveis de Ambiente

Copiar `.env.example` para `.env`:

```bash
cp .env.example .env
```

Editar `.env` com credenciais do PostgreSQL e Stripe.

### 2. Banco de Dados

Criar banco PostgreSQL:

```bash
createdb matheus_leme_shop
```

Executar migrations:

```bash
psql -U postgres -d matheus_leme_shop -f migrations/001_create_users.sql
psql -U postgres -d matheus_leme_shop -f migrations/002_create_products.sql
psql -U postgres -d matheus_leme_shop -f migrations/003_create_orders.sql
psql -U postgres -d matheus_leme_shop -f migrations/004_create_cart.sql
```

### 3. Seed de Dados

Inserir produtos iniciais:

```bash
npm run seed
```

### 4. Iniciar o Servidor

Modo desenvolvimento (com auto-reload):

```bash
npm run dev
```

Modo produção:

```bash
npm start
```

Servidor rodará em `http://localhost:3000`

## API Endpoints

### Produtos

- `GET /api/products` - Lista todos os produtos
  - Query params: `category`, `available`, `featured`, `search`, `limit`, `offset`
- `GET /api/products/:id` - Detalhes de um produto
- `POST /api/products` - Criar produto (admin only)
- `PATCH /api/products/:id` - Atualizar produto (admin only)
- `DELETE /api/products/:id` - Deletar produto (admin only)

### Carrinho (em desenvolvimento)

- `GET /api/cart` - Ver itens do carrinho
- `POST /api/cart/add` - Adicionar ao carrinho
- `DELETE /api/cart/:itemId` - Remover do carrinho

### Pedidos (em desenvolvimento)

- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Listar pedidos do usuário
- `GET /api/orders/:id` - Detalhes do pedido

### Autenticação (em desenvolvimento)

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login

## Estrutura de Arquivos

```
src/
├── routes/          # Definição de rotas da API
├── models/          # Modelos de dados (Product, Order, User)
├── middleware/      # Middleware de autenticação, validação
├── config/          # Configurações (database, payment)
├── app.js           # Setup do Express
└── index.js         # Entry point

migrations/         # SQL migrations para banco de dados
seeds/              # Seeders para dados iniciais
```

## Desenvolvimento

### Estrutura de uma Rota

```javascript
const express = require('express');
const router = express.Router();
const Model = require('../models/Model');

router.get('/', async (req, res) => {
  try {
    const data = await Model.findAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Adicionando Nova Rota

1. Criar arquivo em `src/routes/<name>.js`
2. Implementar endpoints com Model
3. Adicionar rota em `src/app.js`

## Autenticação

Endpoints protegidos usam JWT. Incluir header:

```
Authorization: Bearer <token>
```

## Próximas Fases

- [ ] Rotas de Carrinho (GET, POST, DELETE)
- [ ] Rotas de Autenticação (register, login, logout)
- [ ] Integração Stripe (payment intents, webhooks)
- [ ] Rotas de Pedidos
- [ ] Testes (Jest, Supertest)
- [ ] Deploy (Docker, Railway/Render)
