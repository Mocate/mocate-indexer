<template>
  <UForm :schema="schema" :state="formState" class="space-y-7">
    <!-- Agent Name & Attendant -->
    <UFormField label="Agent name" name="name" required>
      <UInput
        v-model="formState.name"
        placeholder="e.g. Kofi Mobile Money"
        class="w-full"
      />
    </UFormField>
    <UFormField label="Attendant" name="attendant">
      <UInput
        v-model="formState.attendant"
        placeholder="Person on duty (optional)"
        class="w-full"
      />
    </UFormField>

    <!-- Networks -->
    <div class="space-y-3">
      <h3 class="text-sm font-medium text-default">Networks</h3>
      <AgentNetworkRow
        v-for="(row, index) in networkRows"
        :key="index"
        :model-value="row"
        :networks="networks"
        :used-network-ids="usedNetworkIds"
        @update:model-value="(value) => updateNetworkRow(index, value)"
        @remove="removeNetworkRow(index)"
      />
      <UButton
        label="Add network"
        icon="i-lucide-plus"
        size="xs"
        variant="soft"
        class="ml-auto"
        @click="addNetworkRow"
      />
    </div>

    <!-- Location -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-default">Location</h3>
        <UButton
          label="Detect my location"
          icon="i-lucide-locate-fixed"
          size="xs"
          variant="soft"
          :loading="geoLoading || geocodingLoading"
          @click="detectLocation"
        />
      </div>

      <p v-if="geoError" class="text-xs text-error">{{ geoError }}</p>

      <MapGoogleMap
        :center="mapCenter"
        :marker-position="{ lat: locationData.lat, lon: locationData.lon }"
        draggable
        class="h-64 w-full"
        @dragend="onMarkerDragEnd"
      />

      <!-- Geocoded address (read-only) -->
      <div
        v-if="locationData.address || geocodingLoading"
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
              locationData.address || 'Unknown address'
            }}</span>
          </div>
          <div class="flex items-center gap-4 pl-6 text-xs text-muted">
            <span v-if="locationData.city">{{ locationData.city }}</span>
            <span v-if="locationData.country">
              {{ locationData.country }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import * as z from 'zod'

import type { ServiceNetwork } from '~~/shared/types/models'
import { DEFAULT_MAP_CENTER } from '~~/shared/utils/constants'

export interface AgentInformationData {
  name: string
  attendant: string
  networks: {
    network_id: number | null
    merchant_code: string
  }[]
  location: {
    lat: number
    lon: number
    address: string
    city: string
    country: string
    plus_code?: string
    street_name?: string
    town?: string
    post_code?: string
    administrative_area_level_1?: string
    administrative_area_level_2?: string
  }
}

interface Props {
  modelValue: AgentInformationData
  networks: ServiceNetwork[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: AgentInformationData]
}>()

const schema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  attendant: z.string().optional(),
})

type Schema = z.output<typeof schema>

const formState = reactive<Partial<Schema>>({
  name: props.modelValue.name,
  attendant: props.modelValue.attendant,
})

const {
  getCurrentPosition,
  loading: geoLoading,
  error: geoError,
} = useGeolocation()
const { reverseGeocode } = useGooglePlacesAPI()

const locationData = reactive({
  lat: props.modelValue.location.lat || DEFAULT_MAP_CENTER.lat,
  lon: props.modelValue.location.lon || DEFAULT_MAP_CENTER.lon,
  address: props.modelValue.location.address || '',
  city: props.modelValue.location.city || '',
  country: props.modelValue.location.country || 'Ghana',
  plus_code: props.modelValue.location.plus_code,
  street_name: props.modelValue.location.street_name,
  town: props.modelValue.location.town,
  post_code: props.modelValue.location.post_code,
  administrative_area_level_1:
    props.modelValue.location.administrative_area_level_1,
  administrative_area_level_2:
    props.modelValue.location.administrative_area_level_2,
})

const mapCenter = ref({
  lat: locationData.lat,
  lon: locationData.lon,
})

const geocodingLoading = ref(false)
const locationDetected = ref(false)

const networkRows = ref<{ network_id: number | null; merchant_code: string }[]>(
  props.modelValue.networks.length > 0
    ? [...props.modelValue.networks]
    : [{ network_id: null, merchant_code: '' }],
)

const usedNetworkIds = computed(() =>
  networkRows.value
    .map((r) => r.network_id)
    .filter((id): id is number => id !== null),
)

function addNetworkRow() {
  networkRows.value.push({ network_id: null, merchant_code: '' })
}

function removeNetworkRow(index: number) {
  networkRows.value.splice(index, 1)
  emitUpdate()
}

function updateNetworkRow(
  index: number,
  value: { network_id: number | null; merchant_code: string },
) {
  networkRows.value[index] = value
  emitUpdate()
}

async function runReverseGeocode(lat: number, lon: number) {
  geocodingLoading.value = true
  try {
    const result = await reverseGeocode(lat, lon)
    if (!result) {
      return
    }
    locationData.address = result.address
    locationData.city = result.city ?? ''
    locationData.country = result.country ?? ''
    locationData.plus_code = result.plus_code
    locationData.street_name = result.street_name
    locationData.town = result.town
    locationData.post_code = result.post_code
    locationData.administrative_area_level_1 =
      result.administrative_area_level_1
    locationData.administrative_area_level_2 =
      result.administrative_area_level_2
  } catch {
    // Keep existing address data on failure
  } finally {
    geocodingLoading.value = false
  }
}

async function detectLocation() {
  try {
    const pos = await getCurrentPosition()
    locationData.lat = pos.latitude
    locationData.lon = pos.longitude
    mapCenter.value = { lat: pos.latitude, lon: pos.longitude }
    locationDetected.value = true
    await runReverseGeocode(pos.latitude, pos.longitude)
    emitUpdate()
  } catch {
    // Error is handled by useGeolocation composable
  }
}

function onMarkerDragEnd(coords: { lat: number; lon: number }) {
  locationData.lat = coords.lat
  locationData.lon = coords.lon
  runReverseGeocode(coords.lat, coords.lon).then(() => emitUpdate())
}

function emitUpdate() {
  emit('update:modelValue', {
    name: formState.name || '',
    attendant: formState.attendant || '',
    networks: networkRows.value.filter((r) => r.network_id !== null),
    location: { ...locationData },
  })
}

// Sync form state changes back
watch(formState, () => emitUpdate(), { deep: true })
watch(networkRows, () => emitUpdate(), { deep: true })

// Auto-detect location on mount
onMounted(() => {
  detectLocation()
})

defineExpose({
  validate: async () => {
    // Validate that agent name is filled
    if (!formState.name?.trim()) {
      return false
    }
    // Validate that at least one valid network is selected
    const validNetworks = networkRows.value.filter((r) => r.network_id !== null)
    if (validNetworks.length === 0) {
      return false
    }
    return true
  },
})
</script>
