import { createRouter, createWebHistory } from 'vue-router'
import UserConfigurationsView from '@/views/UserConfigurationsView.vue'

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('access_token')
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('../views/CatalogView.vue')
    },
    {
      path: '/catalog/:id',
      name: 'catalog-item',
      component: () => import('../views/CatalogItemView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/configurator',
      name: 'configurator',
      component: () => import('../views/ConfiguratorView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../views/VerifyEmailView.vue')
    },
    {
      path: '/auth/verification-success',
      name: 'verification-success',
      component: () => import('../views/VerificationSuccessView.vue')
    },
    {
      path: '/auth/verification-failed',
      name: 'verification-failed',
      component: () => import('../views/VerificationFailedView.vue')
    },
    {
      path: '/ready-configurations',
      name: 'ready-configurations',
      component: () => import('../views/ReadyConfigurationsView.vue')
    },
    {
      path: '/configurations/:id',
      name: 'configuration-details',
      component: () => import('../views/ConfigurationDetailsView.vue')
    },
    {
      path: '/my-configurations',
      name: 'my-configurations',
      component: UserConfigurationsView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard for private routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router 