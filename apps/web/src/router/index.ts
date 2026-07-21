import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { hasSession } from '@/modules/auth/auth.session'
import LoginView from '@/views/LoginView.vue'
import SharedExpensesView from '@/views/SharedExpensesView.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'shared-expenses',
          component: SharedExpensesView,
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const isAuthenticated = hasSession()

  if (!isAuthenticated && to.name !== 'login') {
    return {
      name: 'login',
    }
  }

  if (isAuthenticated && to.name === 'login') {
    return {
      name: 'shared-expenses',
    }
  }
})

export default router
