import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Application routes configuration
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/resumes',
    name: 'Resumes',
    component: () => import('../views/Resumes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resume-files',
    name: 'ResumeFiles',
    component: () => import('../views/ResumeFiles.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: () => import('../views/Sessions.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:sessionId?',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/studio',    
    name: 'Studio',
    component: () => import('../views/Studio.vue'),
  },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard - Check authentication before navigation
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Redirect to login if route requires auth but user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // Redirect to home if route requires guest but user is authenticated
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/')
  } 
  // Allow navigation
  else {
    next()
  }
})

export default router

