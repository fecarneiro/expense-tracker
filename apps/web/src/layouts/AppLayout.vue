<script setup lang="ts">
import AppSidebar from '@/layouts/AppSidebar.vue'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/ui/sidebar'
</script>

<template>
  <!-- Always open on desktop: the sidebar only collapses into the mobile menu. -->
  <SidebarProvider :open="true">
    <AppSidebar />

    <SidebarInset class="min-w-0">
      <header
        class="bg-background sticky top-0 z-10 flex items-center gap-2 border-b p-2 md:hidden"
      >
        <SidebarTrigger class="size-9" />
        <strong class="font-semibold">Expense Tracker</strong>
      </header>

      <div class="mx-auto w-full max-w-7xl px-4 py-6 md:p-8">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
