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
  grid-template-columns: 15rem minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
}

.sidebar nav {
  flex: 1;
}

.page-content {
  width: 100%;
  max-width: var(--content-width);
  min-width: 0;
  margin-inline: auto;
  padding: var(--space-8);
}

@media (max-width: 48rem) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    flex-direction: row;
    align-items: center;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar nav {
    flex: 1;
  }

  .page-content {
    padding: var(--space-4);
  }
}
</style>
