# API Documentation - Matheus Leme Shop

Complete API reference for the backend server running on `http://localhost:3000`.

## Base URL

```
http://localhost:3000
```

## Authentication

All endpoints marked with 🔒 require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are obtained through `/api/auth/login` or `/api/auth/register` endpoints.

### Error Responses

Failed authentication returns `401 Unauthorized`:

```json
{
  "success": false,
  "error": "Invalid or expired token",
  "message": "jwt expired"
}
```

## General Response Format

All endpoints return responses in this format:

**Success (2xx)**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Optional success message"
}
```

**Error (4xx/5xx)**
```json
{
  "success": false,
  "error": "Error title",
  "message": "Detailed error message"
}
```

---

## Endpoints

### Health Check

#### `GET /api/health`

Check if backend is running.

**No authentication required**

**Response:**
```json
{
  "status": "OK",
  "message": "Backend is running"
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

## Products

### List Products

#### `GET /api/products`

Retrieve all products with optional filtering and pagination.

**No authentication required**

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | - | Filter by category (e.g., `"pacote"`, `"individual"`) |
| `available` | boolean | - | Filter by availability (`true` or `false`) |
| `featured` | boolean | - | Filter by featured status (`true` or `false`) |
| `search` | string | - | Search in title and description (case-insensitive) |
| `limit` | number | 12 | Number of results per page |
| `offset` | number | 0 | Number of results to skip (for pagination) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Premium Stream Package",
      "headerTitle": "PREMIUM",
      "category": "pacote",
      "type": "package",
      "description": "Complete streaming setup with overlays and assets",
      "shortDescription": "Full streaming package",
      "price": 99.99,
      "priceOriginal": 149.99,
      "discount": 33,
      "featured": true,
      "available": true,
      "themeColor": "#FF6B6B",
      "thumbnail": "https://example.com/thumb.jpg",
      "images": ["url1", "url2"],
      "features": ["Overlay", "Alerts", "Chat Box"],
      "previews": ["preview1.mp4"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    }
  ],
  "pagination": {
    "limit": 12,
    "offset": 0
  }
}
```

**Examples:**

```bash
# Get all products
curl "http://localhost:3000/api/products"

# Filter by category
curl "http://localhost:3000/api/products?category=pacote"

# Search products
curl "http://localhost:3000/api/products?search=premium"

# Get featured, available products with custom pagination
curl "http://localhost:3000/api/products?featured=true&available=true&limit=5&offset=10"
```

---

### Get Single Product

#### `GET /api/products/:id`

Retrieve a single product by ID.

**No authentication required**

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Product ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Premium Stream Package",
    "headerTitle": "PREMIUM",
    "category": "pacote",
    "type": "package",
    "description": "Complete streaming setup...",
    "shortDescription": "Full streaming package",
    "price": 99.99,
    "priceOriginal": 149.99,
    "discount": 33,
    "featured": true,
    "available": true,
    "themeColor": "#FF6B6B",
    "thumbnail": "https://example.com/thumb.jpg",
    "images": ["url1", "url2"],
    "features": ["Overlay", "Alerts", "Chat Box"],
    "previews": ["preview1.mp4"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "Product not found"
}
```

**Example:**
```bash
curl http://localhost:3000/api/products/1
```

---

### Create Product

#### `POST /api/products`

Create a new product. **Admin only** 🔒

**Authentication:** Required (admin role)

**Request Body:**
```json
{
  "title": "Premium Stream Package",
  "headerTitle": "PREMIUM",
  "category": "pacote",
  "type": "package",
  "description": "Complete streaming setup with overlays and assets",
  "shortDescription": "Full streaming package",
  "price": 99.99,
  "priceOriginal": 149.99,
  "discount": 33,
  "featured": true,
  "available": true,
  "themeColor": "#FF6B6B",
  "thumbnail": "https://example.com/thumb.jpg",
  "images": ["url1", "url2"],
  "features": ["Overlay", "Alerts", "Chat Box"],
  "previews": ["preview1.mp4"]
}
```

**Required Fields:**
- `title`
- `category`
- `type`
- `description`
- `price`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "title": "Premium Stream Package",
    "headerTitle": "PREMIUM",
    "category": "pacote",
    "type": "package",
    "description": "Complete streaming setup...",
    "shortDescription": "Full streaming package",
    "price": 99.99,
    "priceOriginal": 149.99,
    "discount": 33,
    "featured": true,
    "available": true,
    "themeColor": "#FF6B6B",
    "thumbnail": "https://example.com/thumb.jpg",
    "images": ["url1", "url2"],
    "features": ["Overlay", "Alerts", "Chat Box"],
    "previews": ["preview1.mp4"],
    "createdAt": "2024-01-25T10:30:00Z",
    "updatedAt": "2024-01-25T10:30:00Z"
  },
  "message": "Product created successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Stream Package",
    "headerTitle": "PREMIUM",
    "category": "pacote",
    "type": "package",
    "description": "Complete streaming setup with overlays and assets",
    "shortDescription": "Full streaming package",
    "price": 99.99,
    "priceOriginal": 149.99,
    "discount": 33,
    "featured": true,
    "available": true,
    "themeColor": "#FF6B6B",
    "thumbnail": "https://example.com/thumb.jpg",
    "images": ["url1", "url2"],
    "features": ["Overlay", "Alerts", "Chat Box"],
    "previews": ["preview1.mp4"]
  }'
```

---

### Update Product

#### `PATCH /api/products/:id`

Update an existing product. **Admin only** 🔒

**Authentication:** Required (admin role)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Product ID |

**Request Body:**
```json
{
  "title": "Updated Title",
  "price": 89.99,
  "featured": false,
  "available": true
}
```

*Only include fields you want to update.*

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "price": 89.99,
    "featured": false,
    "available": true,
    ...
  },
  "message": "Product updated successfully"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 89.99,
    "featured": false
  }'
```

---

### Delete Product

#### `DELETE /api/products/:id`

Delete a product. **Admin only** 🔒

**Authentication:** Required (admin role)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Product ID |

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Authentication

### Register

#### `POST /api/auth/register`

Create a new user account.

**No authentication required**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Required Fields:**
- `email` - Valid email address
- `password` - Minimum 6 characters
- `name` - User's full name

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "Email already registered"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

---

### Login

#### `POST /api/auth/login`

Authenticate and receive JWT token.

**No authentication required**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Required Fields:**
- `email`
- `password`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

---

### Logout

#### `POST /api/auth/logout`

Logout user (server-side confirmation). 🔒

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Get Profile

#### `GET /api/auth/profile`

Retrieve current authenticated user's profile. 🔒

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "createdAt": "2024-01-15T10:30:00Z",
    "total_orders": 3
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Cart

### Get Cart

#### `GET /api/cart`

Retrieve current user's cart items. 🔒

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "product_id": 1,
        "quantity": 2,
        "product": {
          "id": 1,
          "title": "Premium Stream Package",
          "price": 99.99,
          "thumbnail": "https://example.com/thumb.jpg"
        }
      }
    ],
    "total": 199.98,
    "count": 2
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Add to Cart

#### `POST /api/cart/add`

Add product to cart or increment quantity if already exists. 🔒

**Authentication:** Required

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Required Fields:**
- `product_id` - Product ID
- `quantity` - Quantity to add (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "product_id": 1,
    "quantity": 2
  }
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "Product is not available"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

---

### Update Cart Item

#### `PATCH /api/cart/:itemId`

Update quantity of item in cart. 🔒

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `itemId` | number | Cart item ID |

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "product_id": 1,
    "quantity": 5
  }
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/cart/10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

---

### Remove from Cart

#### `DELETE /api/cart/:itemId`

Remove specific item from cart. 🔒

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `itemId` | number | Cart item ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Item removed from cart"
  }
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/cart/10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Clear Cart

#### `DELETE /api/cart`

Clear entire cart. 🔒

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Cart cleared"
  }
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Codes

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Missing required fields | Request missing mandatory parameters |
| 401 | No authentication token provided | Authorization header missing or invalid |
| 401 | Invalid or expired token | JWT token is invalid or has expired |
| 403 | Insufficient permissions | User role doesn't have required access |
| 404 | Not Found | Resource doesn't exist |
| 409 | Email already registered | Email is already in use |
| 409 | Product is not available | Product out of stock |
| 500 | Internal Server Error | Server-side error occurred |

---

## Authentication Flow

1. **Register**: `POST /api/auth/register` → get JWT token
2. **Login**: `POST /api/auth/login` → get JWT token
3. **Use token**: Add to `Authorization: Bearer <token>` header for protected endpoints
4. **Logout**: `POST /api/auth/logout` (optional, mainly frontend-side)

**Token Expiration**: Tokens expire after 7 days by default (configurable via `JWT_EXPIRE` env var).

---

## Testing the API

### Using cURL

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }' | jq '.data.token' -r > token.txt

# 2. Store token
export TOKEN=$(cat token.txt)

# 3. Get products
curl http://localhost:3000/api/products | jq

# 4. Add to cart
curl -X POST http://localhost:3000/api/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}'

# 5. Get cart
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Create a POST request to `/api/auth/register`
2. Copy the returned `token` value
3. For protected endpoints, add header: `Authorization: Bearer <token>`

---

## Rate Limiting

Currently no rate limiting is implemented. This should be added in production.

## CORS

CORS is enabled for all origins. Restrict in production by modifying `app.js` CORS configuration.
