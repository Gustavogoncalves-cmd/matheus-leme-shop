# Frontend Components & State Management

Complete reference for Vue 3 components and Pinia stores in the Matheus Leme Shop.

## Component Tree

```
App.vue
├── Header.vue
│   ├── Cart Badge (shows item count)
│   ├── Theme Toggle (dark/light mode)
│   └── Auth Menu (login/logout)
├── Router Views
│   ├── ShopPage.vue (main view)
│   │   ├── ProductGrid.vue
│   │   │   └── ProductCard.vue (repeating)
│   │   └── Filters/Search
│   ├── ProductDetail.vue (single product view)
│   ├── CartPage.vue
│   │   └── Cart.vue (cart management)
│   ├── LoginPage.vue
│   ├── AdminPage.vue
│   └── NotFoundPage.vue
└── Footer (implicit)
```

---

## Components

### App.vue

Main application component. Sets up routing and global state.

**Props:** None

**Data:**
- `darkMode` - Theme preference (synced with localStorage)

**Methods:**
- `handleToggleDarkMode()` - Toggle between dark/light theme

**Emits:** None

**Store Usage:**
- `useProductsStore` - Access all products
- `useCartStore` - Access cart state
- `useAuthStore` - Access authentication state

**Example:**
```vue
<script setup>
import { onMounted } from 'vue';
import { useProductsStore } from './stores/products';

const productsStore = useProductsStore();

onMounted(() => {
  productsStore.fetchProducts();
});
</script>
```

---

### Header.vue

Sticky navigation header with logo, theme toggle, cart badge, and auth menu.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `darkMode` | boolean | false | Current theme mode |

**Data:**
- `isAuthenticated` - Computed from auth store
- `isAdmin` - Computed from auth store
- `cartCount` - Total items in cart

**Methods:**
- `handleToggleDarkMode()` - Toggle dark/light mode
- `handleLogout()` - Clear auth and redirect

**Emits:**
- `toggle-dark-mode` - When theme toggle is clicked

**Store Usage:**
- `useAuthStore` - Authentication state
- `useCartStore` - Cart item count

**Example:**
```vue
<template>
  <Header :darkMode="darkMode" @toggle-dark-mode="handleToggleDarkMode" />
</template>
```

---

### ProductCard.vue

Individual product card in grid. Displays product info, price, discount, and action buttons.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `product` | object | required | Product data object |
| `darkMode` | boolean | false | Current theme mode |

**Product Object Structure:**
```javascript
{
  id: number,
  title: string,
  headerTitle: string,
  category: string,           // 'pacote' or 'individual'
  type: string,
  description: string,
  shortDescription: string,
  price: number,              // Current price
  priceOriginal: number,      // Original price (for discount calculation)
  discount: number,           // Discount percentage (0-100)
  featured: boolean,          // Show popular badge
  available: boolean,         // Can be purchased
  themeColor: string,         // Hex color for header
  thumbnail: string,          // Image URL
  images: string[],           // Additional images
  features: string[],         // Feature tags
  previews: string[]          // Video/preview URLs
}
```

**Computed Properties:**
- `priceOriginal` - Falls back to current price if not set
- `whatsappLink` - Generates WhatsApp message link

**Methods:** None

**Emits:**
- `view` - When "Ver Detalhes" button is clicked

**Example:**
```vue
<script setup>
import ProductCard from './ProductCard.vue';

function handleViewProduct(productId) {
  router.push(`/product/${productId}`);
}
</script>

<template>
  <ProductCard 
    :product="product" 
    :darkMode="darkMode"
    @view="handleViewProduct(product.id)"
  />
</template>
```

---

### ProductGrid.vue

Grid layout for displaying multiple product cards with filtering and pagination.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `products` | array | [] | Array of products to display |
| `darkMode` | boolean | false | Current theme mode |
| `loading` | boolean | false | Show loading state |

**Data:**
- `selectedProductId` - Currently selected product

**Methods:**
- `handleViewProduct(productId)` - Navigate to product detail
- `handleAddToCart(product)` - Add product to cart

**Emits:**
- `product-selected` - When a product is clicked
- `add-to-cart` - When add to cart button is clicked

**Example:**
```vue
<template>
  <ProductGrid 
    :products="products" 
    :darkMode="darkMode"
    :loading="loading"
    @product-selected="handleSelectProduct"
    @add-to-cart="handleAddToCart"
  />
</template>
```

---

### ShopPage.vue

Main shop page combining product grid, filters, and search.

**Props:** None

**Data:**
- `darkMode` - Theme preference
- `products` - From products store
- `filteredProducts` - From products store
- `loading` - From products store
- `categoryFilter` - From products store
- `searchQuery` - From products store

**Methods:**
- `handleSearch(query)` - Update search query in store
- `handleFilterCategory(category)` - Update category filter in store
- `handleViewProduct(id)` - Navigate to product detail

**Emits:** None

**Store Usage:**
- `useProductsStore` - Products state and filtering
- `useCartStore` - Add to cart functionality

**Example:**
```vue
<script setup>
import { onMounted } from 'vue';
import { useProductsStore } from '../stores/products';
import { useCartStore } from '../stores/cart';

const productsStore = useProductsStore();
const cartStore = useCartStore();

onMounted(() => {
  productsStore.fetchProducts();
});
</script>
```

---

### ProductDetail.vue

Detailed view of a single product with full description, images, and purchase options.

**Props:** None (uses route params)

**Route Params:**
- `id` - Product ID from URL

**Data:**
- `product` - Current product object
- `quantity` - Selected quantity (1+)
- `loading` - Fetch state

**Methods:**
- `handleAddToCart()` - Add to cart with quantity
- `handleIncrement()` - Increase quantity
- `handleDecrement()` - Decrease quantity

**Emits:** None

**Store Usage:**
- `useProductsStore` - Fetch product by ID
- `useCartStore` - Add to cart

**Example:**
```vue
<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProductsStore } from '../stores/products';

const route = useRoute();
const productsStore = useProductsStore();

const product = computed(() => {
  return productsStore.getProductById(route.params.id);
});

onMounted(() => {
  if (!product.value) {
    productsStore.fetchProducts();
  }
});
</script>
```

---

### Cart.vue

Cart management component. Edit quantities, remove items, see total.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | array | [] | Cart items array |
| `total` | number | 0 | Total cart value |
| `darkMode` | boolean | false | Current theme mode |

**Data:**
- `loading` - Sync state during operations

**Methods:**
- `handleRemoveItem(productId)` - Remove from cart
- `handleUpdateQuantity(productId, quantity)` - Update item quantity
- `handleClearCart()` - Empty entire cart
- `handleCheckout()` - Proceed to checkout

**Emits:**
- `remove-item` - When item is removed
- `update-quantity` - When quantity changes
- `clear-cart` - When clearing cart
- `checkout` - When proceeding to payment

**Example:**
```vue
<script setup>
import Cart from '../components/Cart.vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

function handleRemoveItem(productId) {
  cartStore.removeItem(productId);
}

function handleUpdateQuantity(productId, quantity) {
  cartStore.updateQuantity(productId, quantity);
}
</script>

<template>
  <Cart 
    :items="cartStore.items"
    :total="cartStore.total"
    :darkMode="darkMode"
    @remove-item="handleRemoveItem"
    @update-quantity="handleUpdateQuantity"
  />
</template>
```

---

### CartPage.vue

Full-page cart view with checkout flow.

**Props:** None

**Data:**
- `darkMode` - Theme preference
- `cartItems` - From cart store
- `cartTotal` - From cart store

**Methods:**
- `handleCheckout()` - Redirect to payment
- `handleContinueShopping()` - Go back to shop

**Emits:** None

**Store Usage:**
- `useCartStore` - Cart state
- `useAuthStore` - Check authentication

---

### LoginPage.vue

User login and registration form.

**Props:** None

**Data:**
- `isLogin` - Toggle between login/register
- `email` - Email input
- `password` - Password input
- `name` - Name input (for register)
- `loading` - API request state
- `error` - Error message

**Methods:**
- `handleLogin()` - Submit login
- `handleRegister()` - Submit registration
- `handleToggleMode()` - Switch between login/register

**Emits:** None

**Store Usage:**
- `useAuthStore` - Authentication methods

**Example:**
```vue
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');

async function handleLogin() {
  await authStore.login(email.value, password.value);
}
</script>
```

---

### AdminPage.vue

Admin panel for managing products (CRUD operations).

**Props:** None

**Data:**
- `products` - List of all products
- `selectedProduct` - Currently editing
- `isCreating` - In create mode
- `loading` - API state
- `error` - Error message

**Methods:**
- `handleCreateProduct(formData)` - Create new product
- `handleUpdateProduct(id, formData)` - Update existing product
- `handleDeleteProduct(id)` - Delete product
- `handleSelectProduct(id)` - Select for editing

**Emits:** None

**Store Usage:**
- `useAuthStore` - Verify admin role
- `useProductsStore` - Access products

**Note:** Requires admin authentication. Route should be protected.

---

### NotFoundPage.vue

404 error page for non-existent routes.

**Props:** None

**Example:**
```vue
<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-4xl font-bold">404</h1>
    <p class="text-gray-600">Página não encontrada</p>
    <router-link to="/" class="text-brand-600 hover:underline">
      Voltar para a loja
    </router-link>
  </div>
</template>
```

---

## Pinia Stores

### useProductsStore()

Manages product catalog and filtering.

**State:**
```javascript
{
  products: [],              // All products
  loading: false,            // Fetch state
  error: null,              // Error message
  categoryFilter: 'todos',  // Current category
  searchQuery: ''           // Current search
}
```

**Getters (Computed):**
- `filteredProducts` - Filtered by category and search query

**Actions:**
```javascript
// Fetch products from API or local fallback
async fetchProducts()

// Get single product by ID
getProductById(id)

// Set category filter
setCategoryFilter(category)

// Set search query
setSearchQuery(query)
```

**Example Usage:**
```javascript
import { useProductsStore } from '@/stores/products';

const productsStore = useProductsStore();

// Fetch products on mount
onMounted(() => {
  productsStore.fetchProducts();
});

// Filter by category
productsStore.setCategoryFilter('pacote');

// Search
productsStore.setSearchQuery('premium');

// Get filtered results
const filtered = productsStore.filteredProducts;

// Get single product
const product = productsStore.getProductById(1);
```

---

### useCartStore()

Manages shopping cart with localStorage persistence.

**State:**
```javascript
{
  items: [
    {
      id: number,
      title: string,
      price: number,
      discount: number,
      thumbnail: string,
      quantity: number
    }
  ]
}
```

**Getters (Computed):**
- `total` - Sum of all items (with discount applied)
- `count` - Total quantity of items

**Actions:**
```javascript
// Initialize cart from localStorage
initCart()

// Add item or increment if exists
addItem(product)

// Remove item by product ID
removeItem(productId)

// Update item quantity
updateQuantity(productId, quantity)

// Clear entire cart
clearCart()
```

**Example Usage:**
```javascript
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();

// Add product to cart
cartStore.addItem({
  id: 1,
  title: 'Product Name',
  price: 99.99,
  discount: 10,
  thumbnail: 'url.jpg',
  quantity: 1
});

// Get total
console.log(cartStore.total); // 89.99

// Get item count
console.log(cartStore.count); // 1

// Update quantity
cartStore.updateQuantity(1, 5);

// Remove item
cartStore.removeItem(1);

// Clear cart
cartStore.clearCart();
```

**Persistence:**
- Cart is automatically saved to `localStorage['matheus_leme_cart']`
- Persists across page refreshes and browser restarts

---

### useAuthStore()

Manages user authentication and JWT tokens.

**State:**
```javascript
{
  user: {
    id: number,
    email: string,
    name: string,
    role: string  // 'customer' or 'admin'
  },
  token: string,                // JWT token
  isLoading: false,            // Request state
  error: null                  // Error message
}
```

**Getters (Computed):**
- `isAuthenticated` - Boolean, true if token exists
- `isAdmin` - Boolean, true if user role is 'admin'

**Actions:**
```javascript
// Initialize from localStorage
initAuth()

// Login with email/password
async login(email, password)

// Register new account
async register(name, email, password)

// Logout and clear state
logout()
```

**Example Usage:**
```javascript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Check if logged in
if (authStore.isAuthenticated) {
  console.log('User:', authStore.user);
}

// Check if admin
if (authStore.isAdmin) {
  // Show admin panel
}

// Login
try {
  await authStore.login('user@example.com', 'password123');
  router.push('/');
} catch (error) {
  console.error(authStore.error);
}

// Register
try {
  await authStore.register('John Doe', 'john@example.com', 'password123');
  router.push('/');
} catch (error) {
  console.error(authStore.error);
}

// Logout
authStore.logout();
router.push('/');
```

**Persistence:**
- Token is saved to `localStorage['matheus_leme_token']`
- Auto-restored on app startup via `initAuth()`

---

## Store Integration Examples

### Adding Product to Cart (Full Example)

```vue
<script setup>
import { useCartStore } from '@/stores/cart';
import { useProductsStore } from '@/stores/products';

const cartStore = useCartStore();
const productsStore = useProductsStore();

function addToCart(productId, quantity = 1) {
  const product = productsStore.getProductById(productId);
  
  if (!product) {
    alert('Produto não encontrado');
    return;
  }

  if (!product.available) {
    alert('Produto indisponível');
    return;
  }

  // Add to cart store
  for (let i = 0; i < quantity; i++) {
    cartStore.addItem(product);
  }

  // Show success message
  console.log(`${product.title} adicionado ao carrinho`);
}
</script>

<template>
  <button @click="addToCart(product.id)">
    Adicionar ao Carrinho (R$ {{ product.price }})
  </button>
</template>
```

### Protected Admin Route

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/admin',
    component: () => import('@/pages/AdminPage.vue'),
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore();
      if (authStore.isAdmin) {
        next();
      } else {
        next('/');
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### Computed Cart Summary

```vue
<script setup>
import { computed } from 'vue';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();

const summary = computed(() => {
  const subtotal = cartStore.total;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return {
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2)
  };
});
</script>

<template>
  <div>
    <p>Subtotal: R$ {{ summary.subtotal }}</p>
    <p>Taxa: R$ {{ summary.tax }}</p>
    <p class="font-bold">Total: R$ {{ summary.total }}</p>
  </div>
</template>
```

---

## Dark Mode Implementation

Dark mode state is managed at the App level and passed as prop to all components.

**In App.vue:**
```vue
<script setup>
import { ref, watch } from 'vue';

const darkMode = ref(localStorage.getItem('theme') === 'dark');

watch(darkMode, (newValue) => {
  localStorage.setItem('theme', newValue ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', newValue);
});

function handleToggleDarkMode() {
  darkMode.value = !darkMode.value;
}
</script>
```

**In Components:**
```vue
<script setup>
defineProps({
  darkMode: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div :class="darkMode ? 'bg-slate-900 text-white' : 'bg-white text-black'">
    <!-- Content -->
  </div>
</template>
```

---

## Styling

All components use **Tailwind CSS** for styling.

**Key Utilities:**
- Colors: `text-slate-*`, `bg-brand-*`, `border-slate-*`
- Spacing: `p-*`, `m-*`, `gap-*`
- Responsive: `sm:`, `md:`, `lg:`
- Effects: `shadow-*`, `rounded-*`, `transition-*`

**Brand Colors:**
- Primary: `brand-500`, `brand-600` (teal/blue)
- Dark Mode: `slate-900`, `slate-800`

---

## Testing Components

Example using Vitest and Vue Test Utils:

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ProductCard from '@/components/ProductCard.vue';

describe('ProductCard', () => {
  it('renders product title', () => {
    const product = {
      id: 1,
      title: 'Test Product',
      price: 99.99,
      discount: 10,
      featured: false,
      available: true
    };

    const wrapper = mount(ProductCard, {
      props: { product }
    });

    expect(wrapper.text()).toContain('Test Product');
  });

  it('emits view event on button click', async () => {
    const product = {
      id: 1,
      title: 'Test Product',
      price: 99.99,
      discount: 10,
      featured: false,
      available: true
    };

    const wrapper = mount(ProductCard, {
      props: { product }
    });

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('view')).toHaveLength(1);
  });
});
```

---

## Performance Tips

1. **Lazy Load Routes:**
   ```javascript
   const AdminPage = () => import('@/pages/AdminPage.vue');
   ```

2. **Computed Properties:**
   Use computed for expensive calculations (cart total, filtered products).

3. **v-show vs v-if:**
   - `v-show` for frequently toggled elements (modal, dropdowns)
   - `v-if` for rarely rendered elements (admin panel)

4. **Track Cart Changes:**
   ```vue
   <template v-for="item in items" :key="item.id">
     <!-- Item -->
   </template>
   ```

5. **Image Optimization:**
   Use thumbnails for product grids, full images for detail pages.

---

## Common Patterns

### Loading State
```vue
<template v-if="loading">
  <div class="spinner">Loading...</div>
</template>
<template v-else>
  <!-- Content -->
</template>
```

### Error Handling
```vue
<template v-if="error">
  <div class="alert alert-error">{{ error }}</div>
</template>
```

### Empty State
```vue
<template v-if="items.length === 0">
  <div class="text-center">Your cart is empty</div>
</template>
```

### Conditional Styling
```vue
<div :class="{ 'opacity-50': disabled, 'cursor-not-allowed': disabled }">
  <!-- Content -->
</div>
```
