import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ExpensesView from '../views/ExpensesView.vue'
import SettingsView from '../views/SettingsView.vue'
import LoginView from '../views/LoginView.vue'
import { isAuthenticated } from '../services/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: DashboardView },
    { path: '/expenses', component: ExpensesView },
    { path: '/settings', component: SettingsView },
    { path: '/login', component: LoginView },
  ],
})

router.beforeEach((to) => {
  if (to.path === '/login') return true
  if (isAuthenticated()) return true
  return '/login'
})

export default router
