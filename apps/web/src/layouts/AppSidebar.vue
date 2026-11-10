<script setup lang="ts">
import { LogOut, Receipt, Users } from '@lucide/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import AppearanceSwitcher from '@/layouts/AppearanceSwitcher.vue'
import { clearSession } from '@/shared/auth/auth.session'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/sidebar'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { setOpenMobile } = useSidebar()

async function logout(): Promise<void> {
  clearSession()
  queryClient.clear()

  await router.replace('/login')
}
</script>

<template>
  <Sidebar>
    <SidebarHeader class="p-4">
      <strong class="px-2 font-semibold">Expense Tracker</strong>
    </SidebarHeader>

    <SidebarContent>
      <nav aria-label="Main">
        <SidebarGroup>
          <SidebarGroupLabel>Personal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :is-active="route.name === 'personal-expenses'">
                  <RouterLink :to="{ name: 'personal-expenses' }" @click="setOpenMobile(false)">
                    <Receipt />
                    <span>Expenses</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Partners</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton as-child :is-active="route.name === 'shared-expenses'">
                  <RouterLink :to="{ name: 'shared-expenses' }" @click="setOpenMobile(false)">
                    <Users />
                    <span>Shared expenses</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </nav>
    </SidebarContent>

    <SidebarFooter class="gap-3 p-4">
      <AppearanceSwitcher />
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton @click="logout">
            <LogOut />
            <span>Sign out</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
