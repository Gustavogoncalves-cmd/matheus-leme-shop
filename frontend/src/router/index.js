import { createRouter, createWebHistory } from 'vue-router'
import ShopPage from '../pages/ShopPage.vue'
import CartPage from '../pages/CartPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import PaymentSuccess from '../pages/PaymentSuccess.vue'
import PaymentCancel from '../pages/PaymentCancel.vue'
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
    meta: { title: 'Checkout' }
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

// Admin guard. This is a UX gate only - it hides the panel from non-admins.
// The real enforcement lives on the API: every admin endpoint re-checks the
// JWT with authenticate + authorize('admin') server-side.
router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return true

  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Confirm the stored token is still valid and the role is current before
  // rendering the panel; a stale localStorage entry must not open the door.
  const valid = await authStore.verifySession()
  if (!valid || !authStore.isAdmin) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
