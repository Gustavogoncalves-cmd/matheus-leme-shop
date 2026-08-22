# Matheus Leme Shop - Quick Start

## 🚀 Stack

- **Frontend**: Vue 3 + Vite + Pinia + Tailwind CSS
- **Backend**: Express.js + PostgreSQL
- **Payment**: MercadoPago integration
- **Admin Panel**: Complete product & order management
- **Tests**: Playwright E2E + Vitest + Jest
- **Deploy**: Docker + PM2

## 📦 Prerequisites

- Docker & Docker Compose
- Node.js 20+
- npm

## 🏃 How to Run

### Option 1: Docker Compose (Recommended)

```bash
cd /home/iamgustavo/obsidian-second-brain/projects/matheus-leme-shop
docker-compose up -d
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **Database**: localhost:5432

### Option 2: PM2 (Local Development)

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Create .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Initialize database
cd backend && npm run init-db && cd ..

# Start services
npx pm2 start ecosystem.config.cjs
npx pm2 monit
```

## 🔑 Default Credentials

**Admin Account**:
- Email: `admin@example.com`
- Password: `admin123`

**Test User**:
- Email: `user@example.com`
- Password: `user123`

Create these via `/api/auth/register` endpoint or seed data.

## 📋 Environment Setup

### Backend `.env`

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=matheus_leme_shop
DB_USER=shopuser
DB_PASSWORD=shoppassword

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-your-token-here
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
WEBHOOK_URL=http://localhost:3000/api/payments/webhook
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
VITE_ENV=development
```

## 🧪 Testing

### E2E Tests (Playwright)
```bash
cd frontend
npm run test:e2e          # Run tests
npm run test:e2e:headed  # Run with browser visible
npm run test:e2e:debug   # Debug mode
```

### Unit Tests
```bash
# Frontend
cd frontend && npm run test

# Backend
cd backend && npm run test
```

## 📊 Database Schema

- **users**: Customers & admins
- **products**: Store inventory (6 streampacks seeded)
- **orders**: Customer purchases
- **order_items**: Order line items
- **cart**: Shopping cart items

## 🛒 Features

✅ Product catalog with filtering
✅ Shopping cart (localStorage + API)
✅ MercadoPago payment integration
✅ Order tracking
✅ Admin panel (CRUD products & orders)
✅ JWT authentication
✅ Dark/light mode
✅ Responsive design
✅ API documentation (Swagger/OpenAPI)

## 🔐 Security

- JWT token authentication
- bcryptjs password hashing
- CORS enabled (configured for localhost)
- Rate limiting ready (express-rate-limit)
- Input validation (express-validator)
- Helmet.js security headers

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - User profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Product details
- `POST /api/products` - Create (admin)
- `PATCH /api/products/:id` - Update (admin)
- `DELETE /api/products/:id` - Delete (admin)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add to cart
- `PATCH /api/cart/:itemId` - Update quantity
- `DELETE /api/cart/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/:id` - Order details
- `PATCH /api/orders/:id/status` - Update status (admin)
- `GET /api/orders/admin/list` - All orders (admin)

### Payments
- `POST /api/payments/create-preference` - MercadoPago preference
- `POST /api/payments/webhook` - MercadoPago webhook
- `GET /api/payments/status/:payment_id` - Payment status

## 🚀 Deployment

See `DEPLOY.md` for production deployment guide (Railway, Render, Vercel).

## 📞 Support

- Backend logs: `docker logs matheus-shop-api`
- Database logs: `docker logs matheus-shop-db`
- Frontend logs: `docker logs matheus-shop-web`
- PM2 logs: `npx pm2 logs`

## 📖 Documentation

- **API Docs**: http://localhost:3000/api-docs (Swagger UI)
- **Project Status**: See `PROJECT_STATUS.md`
- **Architecture**: See `README.md`

---

**Projeto Finalizado**: Agosto 2026 ✅
