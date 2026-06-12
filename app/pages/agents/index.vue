<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Agents">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="Index agent" icon="i-lucide-plus" to="/" />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search by name or city..."
            class="w-full max-w-sm"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UTable
        :data="filteredAgents"
        :columns="columns"
        :loading="isLoading"
        class="flex-1"
        @select="(_event, row) => onRowClick(row)"
      />

      <div v-if="data?.total" class="flex justify-end pt-4">
        <UPagination
          v-model:page="page"
          :total="data.total"
          :items-per-page="pageSize"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useQuery } from '@tanstack/vue-query'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { fetchAgents } = useAgents()

const page = ref(1)
const pageSize = 10
const search = ref('')

const { data, isLoading } = useQuery({
  queryKey: ['agents', page],
  queryFn: () => fetchAgents(page.value, pageSize),
})

const filteredAgents = computed(() => {
  const agents = data.value?.agents ?? []
  if (!search.value) {
    return agents
  }

  const term = search.value.toLowerCase()
  return agents.filter((agent) => {
    const name = agent.name?.toLowerCase() ?? ''
    const city = agent.agent_locations?.[0]?.city?.toLowerCase() ?? ''
    return name.includes(term) || city.includes(term)
  })
})

const columns: TableColumn<Record<string, unknown>>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'networks',
    header: 'Networks',
    accessorFn: (row: Record<string, unknown>) => {
      const networks = row.agent_networks as
        | Array<{ networks?: { name?: string } }>
        | undefined
      return (
        networks
          ?.map((n) => n.networks?.name)
          .filter(Boolean)
          .join(', ') || '-'
      )
    },
  },
  {
    id: 'city',
    header: 'City',
    accessorFn: (row: Record<string, unknown>) => {
      const locations = row.agent_locations as
        | Array<{ city?: string }>
        | undefined
      return locations?.[0]?.city || '-'
    },
  },
  {
    id: 'created_at',
    header: 'Created At',
    accessorFn: (row: Record<string, unknown>) => {
      const date = row.created_at as string | undefined
      return date
        ? new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '-'
    },
  },
]

function onRowClick(row: { original: { id: string } }) {
  navigateTo(`/agents/${row.original.id}`)
}
</script>
