<script setup lang="ts">
import SharedExpensesTable from '@/modules/shared-expenses/components/SharedExpensesTable.vue'
</script>

<template>
  <section class="shared-expenses-view">
    <h1>Shared Expenses</h1>

    <SharedExpensesTable />
  </section>
</template>

<style scoped>
.shared-expenses-view {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.shared-expenses-view h1 {
  margin: 0 0 var(--space-6);
}
</style>
