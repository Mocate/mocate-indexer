<template>
  <div class="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
    <USelect
      v-model="selectedNetworkId"
      :items="networkItems"
      placeholder="Select network"
      value-key="value"
      class="w-full"
    />

    <UInput
      v-model="merchantCode"
      placeholder="Merchant code (optional)"
      inputmode="numeric"
      class="grow"
    />

    <UButton
      icon="i-lucide-trash-2"
      color="error"
      variant="ghost"
      size="sm"
      aria-label="Remove network"
      @click="emit('remove')"
    />
  </div>
</template>

<script setup lang="ts">
import type { ServiceNetwork } from '~~/shared/types/models'

interface NetworkEntry {
  network_id: number | null
  merchant_code: string
}

interface Props {
  modelValue: NetworkEntry
  networks: ServiceNetwork[]
  usedNetworkIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  usedNetworkIds: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: NetworkEntry]
  remove: []
}>()

const networkItems = computed(() =>
  props.networks.map((n) => ({
    label: n.name,
    value: n.id,
    disabled:
      n.id !== props.modelValue.network_id &&
      props.usedNetworkIds.includes(n.id),
  })),
)

const selectedNetworkId = computed({
  get: () => props.modelValue.network_id,
  set: (val) => {
    emit('update:modelValue', {
      ...props.modelValue,
      network_id: val,
    })
  },
})

const merchantCode = computed({
  get: () => props.modelValue.merchant_code,
  set: (val) => {
    emit('update:modelValue', {
      ...props.modelValue,
      merchant_code: val,
    })
  },
})
</script>
