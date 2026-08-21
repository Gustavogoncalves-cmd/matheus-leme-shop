# Matheus Leme - Streampacks E-commerce

Loja profissional de streampacks premium (overlays, assets, design) com catálogo dinâmico, carrinho de compras, painel admin e integração de pagamento.

## Stack

- **Frontend:** Vue 3 + Vite + Pinia + Tailwind CSS
- **Backend:** Node.js + Express + PostgreSQL
- **Pagamento:** Stripe
- **Auth:** JWT (JSON Web Tokens)
- **Testing:** Vitest (frontend) + Jest (backend)

## Estrutura do Projeto

```
matheus-leme-shop/
├── frontend/                # Vue 3 + Vite SPA
│   ├── src/
│   │   ├── components/      # Reusable Vue components
│   │   ├── pages/           # Page-level components
│   │   ├── stores/          # Pinia state management
│   │   ├── services/        # API client
│   │   ├── router/          # Route definitions
│   │   └── main.js
│   └── COMPONENTS.md        # Component documentation
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth & validation
│   │   ├── config/          # Database config
│   │   └── index.js
│   ├── API.md              # API endpoint reference
│   └── migrations/          # Database schemas
├── shared/                  # Shared data & types
└── QUICKSTART.md           # 5-minute setup guide
```

## Documentation

📚 **Read these in order:**

1. **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup (start here!)
2. **[backend/API.md](./backend/API.md)** - Complete API reference with curl examples
3. **[frontend/COMPONENTS.md](./frontend/COMPONENTS.md)** - Component & store documentation
4. **[README.md](./README.md)** - This file (architecture, deployment, features)

## Quick Start

```bash
# 1. Install dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# 2. Setup database
createdb matheus_leme_shop
# Edit backend/.env with your database credentials

# 3. Run the app
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Open http://localhost:5173
```

**Full setup instructions:** See [QUICKSTART.md](./QUICKSTART.md)

## Features

### ✅ Implemented (MVP)

- [x] **Product Catalog**
  - Dynamic product listing with filters (category, search)
  - Product detail pages with full information
  - Featured products & discount badges
  - Stock status (available/out of stock)

- [x] **Shopping Cart**
  - Add/remove items with quantity management
  - Real-time cart total calculation
  - localStorage persistence (survives page refresh)
  - Cart badge in header showing item count

- [x] **User Authentication**
  - User registration with email/password
  - Login with JWT token generation
  - Protected routes (cart, profile)
  - Logout functionality
  - Role-based access (customer, admin)

- [x] **Backend API**
  - RESTful endpoints for products, cart, auth
  - Request/response validation
  - Error handling with proper HTTP status codes
  - JWT authentication middleware
  - CORS enabled for development

- [x] **Testing Infrastructure**
  - Backend: Jest with supertest
  - Frontend: Vitest + Vue Test Utils
  - Test coverage reports

- [x] **UI/UX**
  - Dark mode / Light mode toggle
  - Fully responsive design (mobile-first)
  - Tailwind CSS for styling
  - Smooth animations & transitions
  - Accessibility considerations (ARIA labels, semantic HTML)

### 🚧 In Progress

- [ ] **Stripe Payment Integration**
  - Checkout form
  - Payment processing
  - Order confirmation

- [ ] **Admin Panel**
  - Product management (CRUD)
  - Order management
  - User management
  - Analytics dashboard

### 📋 TODO (Future)

- [ ] **Order Management**
  - Order history for users
  - Order tracking
  - Invoice generation

- [ ] **Email Notifications**
  - Order confirmation email
  - Shipping updates
  - Newsletter signup

- [ ] **Product Reviews & Ratings**
  - User reviews
  - Star ratings
  - Review moderation

- [ ] **Search Optimization**
  - Full-text search
  - Elasticsearch integration
  - Autocomplete suggestions

- [ ] **Performance Optimization**
  - Image optimization & CDN
  - Code splitting
  - Caching strategies
  - Database query optimization

- [ ] **Analytics**
  - Google Analytics integration
  - Product view tracking
  - Conversion funnel tracking

## Architecture Overview

### Frontend Architecture

```
Components
    ↓
Router (Vue Router)
    ↓
State (Pinia Stores)
    ↓
API (axios)
    ↓
Backend
```

**Key Design Patterns:**
- Component-based UI architecture
- Composition API for stateful logic
- Pinia stores for global state (cart, auth, products)
- API service layer for backend communication
- localStorage for offline-first features (cart)

### Backend Architecture

```
HTTP Request
    ↓
Express Middleware (CORS, JSON parser)
    ↓
Route Handler
    ↓
Authentication Middleware (JWT verify)
    ↓
Business Logic (Model methods)
    ↓
PostgreSQL Database
    ↓
Response (JSON)
```

**Key Design Patterns:**
- MVC (Model-View-Controller) with routes as controllers
- Model classes for database operations
- Middleware for cross-cutting concerns (auth, validation)
- Async/await for clean error handling
- PostgreSQL with parameterized queries (SQL injection safe)

### Data Flow

```
User Action (click button)
    ↓
Vue Component emits event or updates store
    ↓
Pinia store action triggered
    ↓
API service makes HTTP request
    ↓
Backend route handler processes request
    ↓
Database query via Model
    ↓
Response returned to frontend
    ↓
Store updates reactive state
    ↓
Component re-renders with new data
```

## Setup Instructions

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 12+
- **npm** (included with Node.js)

### Step-by-Step

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd matheus-leme-shop
   ```

2. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Create database**
   ```bash
   createdb matheus_leme_shop
   psql matheus_leme_shop < backend/migrations/init.sql
   ```

4. **Configure environment variables**
   
   Backend (`backend/.env`):
   ```
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/matheus_leme_shop
   JWT_SECRET=your-secret-key-change-this
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

   Frontend (`frontend/.env`):
   ```
   VITE_API_URL=http://localhost:3000
   VITE_STRIPE_PUBLIC_KEY=pk_test_xxxx
   ```

5. **Run development servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

## Deployment

### Production Build

```bash
# Frontend
cd frontend
npm run build        # Creates dist/ folder
npm run preview      # Preview production build

# Backend
cd backend
npm run build        # (if applicable, not needed for Node.js)
npm start            # Start in production mode
```

### Environment Variables (Production)

**Backend:**
```
PORT=3000
DATABASE_URL=postgresql://prod_user:prod_password@prod-host:5432/matheus_leme_shop
JWT_SECRET=very-long-random-secret-key-min-32-chars
JWT_EXPIRE=7d
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_xxxx
CORS_ORIGIN=https://yourdomain.com
```

**Frontend:**
```
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxx
```

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/src ./src
EXPOSE 3000
CMD ["node", "src/index.js"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Database Migration (Production)

```bash
# Backup existing database
pg_dump matheus_leme_shop > backup.sql

# Apply migrations
psql matheus_leme_shop < migrations/init.sql
```

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: matheus_leme_shop
          POSTGRES_PASSWORD: postgres

    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: |
          cd backend && npm ci && cd ..
          cd frontend && npm ci && cd ..
      
      - name: Run tests
        run: |
          cd backend && npm test && cd ..
          cd frontend && npm test && cd ..
      
      - name: Build frontend
        run: cd frontend && npm run build && cd ..
      
      - name: Deploy to production
        run: |
          # Add deployment scripts here
          echo "Deploying to production..."
```

### Hosting Options

**Frontend:**
- Vercel (recommended, auto-deploy from Git)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Backend:**
- Heroku
- Railway
- AWS EC2 / ECS
- DigitalOcean App Platform
- Render

**Database:**
- Heroku Postgres
- AWS RDS
- DigitalOcean Managed Databases
- PlanetScale (MySQL)

## Testing

### Backend Tests

```bash
cd backend
npm test                # Run once
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm run test           # Run once
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

## Development Guidelines

### Code Style

- Use ESLint for consistency
- Follow Vue style guide
- Use Prettier for formatting
- TypeScript-ready (types in JSDoc)

### Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Restructure code
test: Add tests
chore: Update dependencies
```

### Branch Naming

```
feature/description
bugfix/issue-title
docs/what-changed
```

## API Reference

**Quick Links:**
- **GET** `/api/health` - Health check
- **GET** `/api/products` - List all products
- **GET** `/api/products/:id` - Get single product
- **POST** `/api/products` - Create product (admin)
- **PATCH** `/api/products/:id` - Update product (admin)
- **DELETE** `/api/products/:id` - Delete product (admin)
- **POST** `/api/auth/register` - Register user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/logout` - Logout user
- **GET** `/api/auth/profile` - Get user profile
- **GET** `/api/cart` - Get cart items
- **POST** `/api/cart/add` - Add to cart
- **PATCH** `/api/cart/:itemId` - Update cart item
- **DELETE** `/api/cart/:itemId` - Remove from cart
- **DELETE** `/api/cart` - Clear cart

**Full documentation:** See [backend/API.md](./backend/API.md)

## Troubleshooting

### Common Issues

**"Cannot connect to PostgreSQL"**
- Verify PostgreSQL is running: `psql --version`
- Check connection string in `.env`
- Create database: `createdb matheus_leme_shop`

**"Port 3000 already in use"**
- Change port in `.env`: `PORT=3001`
- Or kill existing process: `lsof -ti :3000 | xargs kill -9`

**"CORS error"**
- Ensure backend is running on correct port
- Check CORS settings in `backend/src/app.js`
- Verify `VITE_API_URL` in frontend `.env`

**"JWT errors"**
- Re-login to get fresh token
- Check `JWT_SECRET` is set in backend `.env`
- Token expires after 7 days (configurable)

See [QUICKSTART.md](./QUICKSTART.md) for more troubleshooting.

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Commit: `git commit -m "feat: Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open Pull Request

## Performance Metrics

**Frontend:**
- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

**Backend:**
- API Response Time: < 200ms
- Database Query Time: < 100ms
- Uptime Target: 99.9%

## Security Checklist

- [x] Password hashing with bcrypt
- [x] JWT token expiration
- [x] SQL injection prevention (parameterized queries)
- [x] CORS configured for specific origins (production)
- [ ] HTTPS enforced (production)
- [ ] Rate limiting (TODO)
- [ ] Input validation (in progress)
- [ ] Environment secrets not committed

## License

MIT License - see LICENSE file for details

## Support

- **Issues:** GitHub Issues
- **Email:** contact@example.com
- **Docs:** This README + documentation files

## Roadmap

**Phase 1 (Current):** MVP with products, cart, auth ✅
**Phase 2:** Stripe payment integration
**Phase 3:** Admin panel for product management
**Phase 4:** Order tracking & user history
**Phase 5:** Reviews & ratings system
**Phase 6:** Analytics & optimization

## Contato

Desenvolvido para **Matheus Leme** | Design e Motion

---

**Last Updated:** January 2024
**Stack:** Vue 3, Express.js, PostgreSQL
**License:** MIT
