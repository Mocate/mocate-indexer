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
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="agentLoading" class="flex justify-center py-12">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-muted"
        />
      </div>

      <UForm
        v-else
        :schema="schema"
        :state="state"
        class="mx-auto w-full max-w-2xl space-y-8 pb-10"
        @submit="onSubmit"
      >
        <!-- Basic details -->
        <div class="space-y-4">
          <h2 class="text-base font-semibold text-highlighted">Information</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Agent name" name="name" required>
              <UInput v-model="state.name" class="w-full" />
            </UFormField>
            <UFormField label="Attendant" name="attendant">
              <UInput v-model="state.attendant" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Location -->
        <div class="space-y-3">
          <h2 class="text-base font-semibold text-highlighted">Location</h2>
          <MapGoogleMap
            :center="{ lat: locationState.lat, lon: locationState.lon }"
            :marker-position="{
              lat: locationState.lat,
              lon: locationState.lon,
            }"
            class="h-64 w-full"
            @dragend="onMarkerDragEnd"
          />

          <!-- Geocoded address (read-only) -->
          <div
            v-if="locationState.address || geocodingLoading"
            class="rounded-(--ui-radius) bg-muted p-3 space-y-1"
          >
            <div
              v-if="geocodingLoading"
              class="flex items-center gap-2 text-sm text-muted"
            >
              <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
              <span>Resolving address...</span>
            </div>
            <template v-else>
              <div class="flex items-start gap-2">
                <UIcon
                  name="i-lucide-map-pin"
                  class="size-4 text-muted mt-0.5 shrink-0"
                />
                <span class="text-sm text-default">{{
                  locationState.address || 'Unknown address'
                }}</span>
              </div>
              <div class="flex items-center gap-4 pl-6 text-xs text-muted">
                <span v-if="locationState.city">{{ locationState.city }}</span>
                <span v-if="locationState.country">
                  {{ locationState.country }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <!-- Networks -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-highlighted">Networks</h2>
            <UButton
              label="Add network"
              icon="i-lucide-plus"
              size="xs"
              variant="soft"
              @click="addNetwork"
            />
          </div>
          <div
            v-for="(net, index) in selectedNetworks"
            :key="index"
            class="flex items-start gap-3"
          >
            <USelect
              v-model="net.network_id"
              :items="networkOptions"
              value-key="value"
              placeholder="Select network"
              class="flex-1"
            />
            <UInput
              v-model="net.merchant_code"
              placeholder="Merchant code"
              class="flex-1"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              aria-label="Remove network"
              @click="removeNetwork(index)"
            />
          </div>
        </div>

        <!-- Availability -->
        <div class="space-y-3">
          <h2 class="text-base font-semibold text-highlighted">Availability</h2>
          <div
            v-for="day in DAYS_OF_WEEK"
            :key="day"
            class="flex flex-col gap-3 rounded-lg border border-default p-4"
          >
            <UCheckbox
              :model-value="isDayEnabled(day)"
              :label="day"
              @update:model-value="() => toggleDay(day)"
            />
            <div v-if="isDayEnabled(day)" class="grid grid-cols-2 gap-3 pl-7">
              <UFormField label="Opens at">
                <UInput
                  v-model="getHoursForDay(day)!.opens_at"
                  type="time"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Closes at">
                <UInput
                  v-model="getHoursForDay(day)!.closes_at"
                  type="time"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :to="`/agents/${agentId}`"
          />
          <UButton type="submit" label="Save changes" :loading="saving" />
        </div>
      </UForm>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as z from 'zod'

import type { CreateAgentPayload } from '~/composables/useAgents'
import { DAYS_OF_WEEK } from '~~/shared/utils/constants'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const agentId = route.params.id as string
const toast = useToast()
const queryClient = useQueryClient()

const { fetchAgent, updateAgent, fetchNetworks } = useAgents()
const { reverseGeocode } = useGooglePlacesAPI()

const geocodingLoading = ref(false)

const { data: agent, isLoading: agentLoading } = useQuery({
  queryKey: ['agent', agentId],
  queryFn: () => fetchAgent(agentId),
})

const { data: networks } = useQuery({
  queryKey: ['networks'],
  queryFn: () => fetchNetworks(),
})

const breadcrumbItems = computed(() => [
  { label: 'Agents', to: '/agents' },
  { label: agent.value?.name || 'Agent', to: `/agents/${agentId}` },
  { label: 'Edit' },
])

// Form schema
const schema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  attendant: z.string().optional(),
})

type Schema = z.output<typeof schema>

// Form state - populated once agent data loads
const state = reactive<Partial<Schema>>({
  name: '',
  attendant: '',
})

// Location state
const locationState = reactive({
  lat: 0,
  lon: 0,
  address: '',
  city: '',
  country: 'Ghana',
  plus_code: undefined as string | undefined,
  street_name: undefined as string | undefined,
  town: undefined as string | undefined,
  post_code: undefined as string | undefined,
  administrative_area_level_1: undefined as string | undefined,
  administrative_area_level_2: undefined as string | undefined,
})

// Networks state
const selectedNetworks = ref<{ network_id: number; merchant_code: string }[]>(
  [],
)

// Hours state
const hoursState = ref<
  { working_day: string; opens_at: string; closes_at: string }[]
>([])

// Image paths state
const imagePaths = ref<string[]>([])

// Populate form when agent data loads
watch(
  agent,
  (agentData) => {
    if (!agentData) {
      return
    }

    state.name = agentData.name
    state.attendant = agentData.attendant || ''

    const loc = agentData.agent_locations?.[0]
    if (loc) {
      locationState.lat = loc.lat
      locationState.lon = loc.lon
      locationState.address = loc.address || ''
      locationState.city = loc.city || ''
      locationState.country = loc.country || 'Ghana'
      locationState.plus_code = loc.plus_code ?? undefined
      locationState.street_name = loc.street_name ?? undefined
      locationState.town = loc.town ?? undefined
      locationState.post_code = loc.post_code ?? undefined
      locationState.administrative_area_level_1 =
        loc.administrative_area_level_1 ?? undefined
      locationState.administrative_area_level_2 =
        loc.administrative_area_level_2 ?? undefined
    }

    selectedNetworks.value = (agentData.agent_networks || []).map((an) => ({
      network_id: an.network_id,
      merchant_code: an.merchant_code || '',
    }))

    hoursState.value = (agentData.operational_hours || []).map((h) => ({
      working_day: h.working_day,
      opens_at: h.opens_at,
      closes_at: h.closes_at,
    }))

    imagePaths.value = (agentData.agent_images || []).map(
      (img) => img.storage_path,
    )
  },
  { immediate: true },
)

// Mutation
const { mutate: saveAgent, isPending: saving } = useMutation({
  mutationFn: (payload: CreateAgentPayload) => updateAgent(agentId, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['agent', agentId] })
    queryClient.invalidateQueries({ queryKey: ['agents'] })
    toast.add({
      title: 'Agent updated',
      description: 'The agent has been updated successfully.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
    navigateTo(`/agents/${agentId}`)
  },
  onError: (error: Error) => {
    toast.add({
      title: 'Update failed',
      description: error.message || 'Failed to update agent.',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  },
})

async function runReverseGeocode(lat: number, lon: number) {
  geocodingLoading.value = true
  try {
    const result = await reverseGeocode(lat, lon)
    if (!result) {
      return
    }
    locationState.address = result.address
    locationState.city = result.city ?? ''
    locationState.country = result.country ?? ''
    locationState.plus_code = result.plus_code
    locationState.street_name = result.street_name
    locationState.town = result.town
    locationState.post_code = result.post_code
    locationState.administrative_area_level_1 =
      result.administrative_area_level_1
    locationState.administrative_area_level_2 =
      result.administrative_area_level_2
  } catch {
    // Keep existing address data on failure
  } finally {
    geocodingLoading.value = false
  }
}

function onMarkerDragEnd(coords: { lat: number; lon: number }) {
  locationState.lat = coords.lat
  locationState.lon = coords.lon
  runReverseGeocode(coords.lat, coords.lon)
}

function onSubmit(event: FormSubmitEvent<Schema>) {
  const payload: CreateAgentPayload = {
    name: event.data.name,
    attendant: event.data.attendant,
    location: {
      lat: locationState.lat,
      lon: locationState.lon,
      address: locationState.address,
      city: locationState.city,
      country: locationState.country,
      plus_code: locationState.plus_code,
      street_name: locationState.street_name,
      town: locationState.town,
      post_code: locationState.post_code,
      administrative_area_level_1: locationState.administrative_area_level_1,
      administrative_area_level_2: locationState.administrative_area_level_2,
    },
    networks: selectedNetworks.value.filter((n) => n.network_id),
    operational_hours: hoursState.value,
    imagePaths: imagePaths.value,
  }

  saveAgent(payload)
}

// Network helpers
const networkOptions = computed(() => {
  return (networks.value || []).map((n) => ({
    label: n.name,
    value: n.id,
  }))
})

function addNetwork() {
  selectedNetworks.value.push({ network_id: 0, merchant_code: '' })
}

function removeNetwork(index: number) {
  selectedNetworks.value.splice(index, 1)
}

// Hours helpers
function toggleDay(day: string) {
  const idx = hoursState.value.findIndex((h) => h.working_day === day)
  if (idx >= 0) {
    hoursState.value.splice(idx, 1)
  } else {
    hoursState.value.push({
      working_day: day,
      opens_at: '08:00',
      closes_at: '17:00',
    })
  }
}

function isDayEnabled(day: string) {
  return hoursState.value.some((h) => h.working_day === day)
}

function getHoursForDay(day: string) {
  return hoursState.value.find((h) => h.working_day === day)
}
</script>
