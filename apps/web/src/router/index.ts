import { createRouter, createWebHistory } from 'vue-router'

import { hasSession } from '@/auth/auth.session'
import AppLayout from '@/layouts/AppLayout.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

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
          name: 'home',
          component: HomeView,
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
      name: 'home',
    }
  }
})

export default router
