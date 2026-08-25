import { createRouter, createWebHistory } from 'vue-router'
import ShopPage from '../pages/ShopPage.vue'
import CartPage from '../pages/CartPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import PaymentSuccess from '../pages/PaymentSuccess.vue'
import PaymentCancel from '../pages/PaymentCancel.vue'
import OrdersPage from '../pages/OrdersPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'shop',
    component: ShopPage,
    meta: { title: 'Loja' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartPage,
    meta: { title: 'Carrinho' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutPage,
    meta: { title: 'Checkout', requiresAuth: true }
  },
  {
    path: '/payment-success',
    name: 'payment-success',
    component: PaymentSuccess,
    meta: { title: 'Pagamento Confirmado' }
  },
  {
    path: '/payment-cancel',
    name: 'payment-cancel',
    component: PaymentCancel,
    meta: { title: 'Pagamento Cancelado' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { title: 'Login' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { title: 'Criar Conta' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrdersPage,
    meta: { title: 'Meus Pedidos', requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: ProfilePage,
    meta: { title: 'Meu Perfil', requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPage,
    meta: { title: 'Admin', requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
    meta: { title: '404 Não Encontrado' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update page title on route change
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Página'} | Matheus Leme | Loja de Streampacks Premium`
  next()
})

// Auth guard for protected routes (requiresAuth).
// Redirects to login with redirect param, then back after login.
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.requiresAdmin) return true

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Verify token is still valid before rendering protected pages
  const valid = await authStore.verifySession()
  if (!valid) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Admin-only check
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
