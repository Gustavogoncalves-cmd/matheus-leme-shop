# Quick Start Guide

Get the Matheus Leme Shop running locally in 5 minutes.

## Prerequisites

Ensure you have these installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)

Optional:
- **Docker** and **Docker Compose** (for containerized setup)
- **Git** (for version control)

## Quick Setup (5 minutes)

### 1. Clone & Install Dependencies

```bash
# Navigate to project directory
cd matheus-leme-shop

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to root
cd ..
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb matheus_leme_shop

# Create tables (run SQL migrations)
psql matheus_leme_shop < backend/migrations/init.sql
```

*Note: Migrations file path may vary. Check backend directory for `*.sql` files.*

### 3. Environment Configuration

**Backend (.env)**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/matheus_leme_shop
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

**Frontend (.env)**

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173
```

**Open browser:** http://localhost:5173

---

## Database Initialization

### Option A: Using SQL File (Recommended)

```bash
# Assuming migrations/init.sql exists
psql matheus_leme_shop -f backend/migrations/init.sql
```

### Option B: Manual Setup

Create tables manually:

```bash
psql matheus_leme_shop
```

Run these SQL commands:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  header_title VARCHAR(255),
  category VARCHAR(100),
  type VARCHAR(100),
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  price_original DECIMAL(10, 2),
  discount INTEGER,
  featured BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  theme_color VARCHAR(7),
  thumbnail VARCHAR(500),
  images JSON,
  features JSON,
  previews JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (for future use)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### Seed Sample Data

```bash
cd backend
npm run seed
```

---

## Running Tests

### Backend Tests

```bash
cd backend
npm test                # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Frontend Tests

```bash
cd frontend
npm run test           # Run all tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

---

## Common Issues & Troubleshooting

### Issue: "Cannot connect to PostgreSQL"

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   psql --version
   ```
2. Check connection string in `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/matheus_leme_shop
   ```
3. Create database if missing:
   ```bash
   createdb matheus_leme_shop
   ```

### Issue: "Port 3000 is already in use"

**Solution:**
```bash
# Linux/Mac: Find and kill process
lsof -ti :3000 | xargs kill -9

# Windows: 
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change the port in `backend/.env`:
```
PORT=3001
```

### Issue: "VITE cannot connect to backend"

**Solution:**
1. Ensure backend is running on correct port (default: 3000)
2. Check `VITE_API_URL` in `frontend/.env`
3. Verify CORS is enabled in `backend/src/app.js`

### Issue: "npm install fails"

**Solution:**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: "JWT token errors"

**Solution:**
1. Ensure `JWT_SECRET` is set in `backend/.env`
2. Token expires after 7 days (configurable via `JWT_EXPIRE`)
3. Re-login to get fresh token

---

## Project Structure

```
matheus-leme-shop/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation
│   │   ├── config/          # Database config
│   │   ├── app.js           # Express app setup
│   │   └── index.js         # Server entry point
│   ├── migrations/          # Database schemas
│   ├── seeds/               # Sample data
│   ├── __tests__/           # Test files
│   ├── package.json         # Dependencies
│   └── .env.example         # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Pinia stores
│   │   ├── services/        # API client
│   │   ├── router/          # Route definitions
│   │   └── main.js          # App entry point
│   ├── __tests__/           # Test files
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   ├── package.json         # Dependencies
│   └── .env.example         # Environment template
│
└── shared/                  # Shared schemas/types
```

---

## Next Steps

1. **Read Full API Docs:** See [backend/API.md](backend/API.md)
2. **Component Reference:** See [frontend/COMPONENTS.md](frontend/COMPONENTS.md)
3. **Development:** Make changes and tests will run on save
4. **Deployment:** See main [README.md](README.md) for deployment instructions

---

## Useful Commands

```bash
# Backend
npm run dev              # Start dev server with hot reload
npm test                 # Run tests
npm run seed             # Seed sample data to database

# Frontend
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build locally
npm run test             # Run tests

# Database (from backend dir)
npm run migrate          # Run pending migrations
npm run migrate:down     # Rollback last migration
```

---

## Environment Variables Checklist

- [ ] Backend: `PORT` set (default: 3000)
- [ ] Backend: `DATABASE_URL` points to correct PostgreSQL
- [ ] Backend: `JWT_SECRET` is a strong random string
- [ ] Frontend: `VITE_API_URL` matches backend URL
- [ ] Frontend: `VITE_STRIPE_PUBLIC_KEY` is set (can be blank for now)
- [ ] Both: `NODE_ENV=development` for local dev

---

## Support

- Check logs for errors: `backend/logs/` and browser console
- API documentation: [backend/API.md](backend/API.md)
- Component docs: [frontend/COMPONENTS.md](frontend/COMPONENTS.md)
- Main README: [README.md](README.md)

**Issues?** Check the Troubleshooting section above or review error messages in terminal.
