<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #title>
          <UBreadcrumb :items="breadcrumbItems" />
        </template>
        <template #right>
          <UButton
            label="Edit"
            icon="i-lucide-pencil"
            :to="`/agents/${agentId}/edit`"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-muted"
        />
      </div>

      <div v-else-if="agent" class="mx-auto w-full max-w-3xl pb-10">
        <!-- Banner + overlapping avatar -->
        <div class="relative mb-14">
          <div class="h-40 w-full overflow-hidden rounded-lg bg-elevated">
            <img
              v-if="bannerUrl"
              :src="bannerUrl"
              :alt="agent.name"
              class="h-full w-full object-cover"
            />
          </div>
          <UAvatar
            :src="logoUrl || undefined"
            :alt="agent.name"
            icon="i-lucide-store"
            size="3xl"
            class="absolute -bottom-8 left-6 ring-4 ring-default"
          />
        </div>

        <div class="px-2">
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-2xl font-bold text-highlighted">
              {{ agent.name }}
            </h1>
            <UBadge
              :color="agentIsOpen ? 'success' : 'neutral'"
              :label="agentIsOpen ? 'Open now' : 'Closed'"
              variant="subtle"
            />
          </div>
          <p v-if="agent.attendant" class="mt-1 text-sm text-muted">
            Attended by {{ agent.attendant }}
          </p>

          <UTabs :items="tabItems" variant="link" class="mt-6">
            <!-- Information -->
            <template #information>
              <div class="space-y-6 pt-4">
                <div v-if="location" class="space-y-3">
                  <h3 class="text-sm font-medium text-default">Location</h3>
                  <p class="text-sm text-muted">
                    {{ location.address || '—'
                    }}<span v-if="location.city">, {{ location.city }}</span>
                  </p>
                  <GoogleMap
                    :center="mapCenter"
                    :markers="mapMarkers"
                    :draggable="false"
                    class="h-64 w-full"
                  />
                </div>

                <div class="space-y-3">
                  <h3 class="text-sm font-medium text-default">Networks</h3>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="an in agent.agent_networks"
                      :key="an.id"
                      :label="an.networks?.name"
                      color="primary"
                      variant="subtle"
                    />
                    <p
                      v-if="!agent.agent_networks?.length"
                      class="text-sm text-muted"
                    >
                      No networks listed.
                    </p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Availability -->
            <template #availability>
              <div class="space-y-2 pt-4">
                <div
                  v-for="day in DAYS_OF_WEEK"
                  :key="day"
                  class="flex items-center justify-between rounded-lg border border-default px-4 py-2"
                  :class="day === currentDay ? 'border-primary' : ''"
                >
                  <span class="text-sm font-medium text-default">{{
                    day
                  }}</span>
                  <span class="text-sm text-muted">
                    <template v-if="getHoursForDay(day)">
                      {{ formatTime(getHoursForDay(day)!.opens_at) }} –
                      {{ formatTime(getHoursForDay(day)!.closes_at) }}
                    </template>
                    <template v-else>Closed</template>
                  </span>
                </div>
              </div>
            </template>

            <!-- Visibility -->
            <template #visibility>
              <div class="pt-4">
                <div
                  v-if="images.length"
                  class="grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  <img
                    v-for="img in images"
                    :key="img.id"
                    :src="getPublicUrl('agent-images', img.storage_path)"
                    :alt="agent.name"
                    class="aspect-square w-full rounded-lg object-cover"
                  />
                </div>
                <p v-else class="text-sm text-muted">No photos uploaded.</p>
              </div>
            </template>
          </UTabs>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

import { DAYS_OF_WEEK } from '~~/shared/utils/constants'
import { formatTime, getCurrentDayName, isOpenNow } from '~~/shared/utils/time'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const agentId = route.params.id as string

const { fetchAgent } = useAgents()
const { getPublicUrl } = useImageUpload()

const { data: agent, isLoading } = useQuery({
  queryKey: ['agent', agentId],
  queryFn: () => fetchAgent(agentId),
})

const breadcrumbItems = computed(() => [
  { label: 'Agents', to: '/agents' },
  { label: agent.value?.name || 'Agent' },
])

const bannerUrl = computed(() => {
  if (!agent.value?.banner) {
    return ''
  }
  return getPublicUrl('agent-banners', agent.value.banner)
})

const logoUrl = computed(() => {
  if (!agent.value?.logo) {
    return ''
  }
  return getPublicUrl('agent-logos', agent.value.logo)
})

const location = computed(() => agent.value?.agent_locations?.[0] ?? null)

const mapCenter = computed(() => {
  if (!location.value) {
    return undefined
  }
  return { lat: location.value.lat, lon: location.value.lon }
})

const mapMarkers = computed(() => {
  if (!location.value) {
    return []
  }
  return [{ lat: location.value.lat, lon: location.value.lon }]
})

const currentDay = getCurrentDayName()
const operationalHours = computed(() => agent.value?.operational_hours ?? [])
const agentIsOpen = computed(() => isOpenNow(operationalHours.value))

function getHoursForDay(day: string) {
  return operationalHours.value.find((h) => h.working_day === day)
}

const images = computed(() => agent.value?.agent_images ?? [])

const tabItems = [
  { label: 'Information', icon: 'i-lucide-info', slot: 'information' as const },
  {
    label: 'Availability',
    icon: 'i-lucide-clock',
    slot: 'availability' as const,
  },
  { label: 'Visibility', icon: 'i-lucide-images', slot: 'visibility' as const },
]
</script>
