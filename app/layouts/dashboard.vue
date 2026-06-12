<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <div
          class="flex items-center gap-2 p-2"
          :class="collapsed ? 'justify-center' : ''"
        >
          <UIcon name="i-lucide-map-pin" class="size-6 text-primary" />
          <span v-if="!collapsed" class="text-lg font-semibold text-default">
            Mocate
          </span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="w-full" :class="collapsed ? 'flex justify-center' : ''">
          <p
            v-if="!collapsed && user"
            class="truncate px-2 pb-2 text-xs text-muted"
          >
            {{ user.email }}
          </p>
          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            :label="collapsed ? undefined : 'Sign out'"
            :block="!collapsed"
            @click="logout"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user, logout } = useSession()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Agents',
    icon: 'i-lucide-users',
    to: '/agents',
  },
])
</script>
