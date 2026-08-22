import { createRouter, createWebHistory } from 'vue-router'
import ShopPage from '../pages/ShopPage.vue'
import CartPage from '../pages/CartPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import PaymentSuccess from '../pages/PaymentSuccess.vue'
import PaymentCancel from '../pages/PaymentCancel.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

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
    meta: { title: 'Admin' }
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

export default router
