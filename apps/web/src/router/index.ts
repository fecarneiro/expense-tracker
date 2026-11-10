import { createRouter, createWebHistory } from 'vue-router'

import { hasSession } from '@/shared/auth/auth.session'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      redirect: { name: 'personal-expenses' },
      children: [
        {
          path: 'personal/expenses',
          name: 'personal-expenses',
          component: () => import('@/modules/personal/expenses/views/PersonalExpensesView.vue'),
        },
        {
          path: 'partners/shared-expenses',
          name: 'shared-expenses',
          component: () =>
            import('@/modules/partners/shared-expenses/views/SharedExpensesView.vue'),
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
      name: 'personal-expenses',
    }
  }
})

export default router
