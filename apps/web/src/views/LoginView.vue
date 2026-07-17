<script setup lang="ts">
import { useRouter } from 'vue-router'

import { clearSession } from '@/auth/auth.session'

const router = useRouter()

async function logout(): Promise<void> {
  clearSession()

  await router.replace('/login')
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <strong>Expense Tracker</strong>

      <nav>
        <RouterLink to="/"> Shared Expenses </RouterLink>
      </nav>

      <button type="button" @click="logout">Sign out</button>
    </aside>

    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
}

.page-content {
  min-width: 0;
}

@media (max-width: 48rem) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    flex-direction: row;
  }
}
</style>
