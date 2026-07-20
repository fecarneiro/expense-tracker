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
  grid-template-rows: minmax(0, 1fr);
  height: 100dvh;
  overflow: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  min-height: 0;
  padding: var(--space-6);
  overflow-y: auto;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
}

.sidebar nav {
  flex: 1;
}

.page-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--content-width);
  min-width: 0;
  min-height: 0;
  margin-inline: auto;
  padding: var(--space-8);
  overflow-x: hidden;
  overflow-y: auto;
}

@media (max-width: 48rem) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .sidebar {
    flex-direction: row;
    align-items: center;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
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
