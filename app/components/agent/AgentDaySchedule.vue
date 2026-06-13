<template>
  <div
    class="rounded-(--ui-radius) border p-4 transition-colors"
    :class="isWorking ? 'border-default bg-elevated/40' : 'border-default'"
  >
    <div class="flex items-center justify-between gap-3">
      <span
        class="text-sm font-medium"
        :class="isWorking ? 'text-highlighted' : 'text-muted'"
      >
        {{ schedule.working_day }}
      </span>
      <USwitch v-model="isWorking" :label="isWorking ? 'Open' : 'Closed'" />
    </div>

    <div v-if="isWorking" class="mt-4 grid grid-cols-2 gap-3">
      <UFormField
        label="Opens at"
        :name="`schedule.${schedule.working_day}.opens_at`"
      >
        <UInput v-model="opensAt" type="time" class="grow w-full" />
      </UFormField>

      <UFormField
        label="Closes at"
        :name="`schedule.${schedule.working_day}.closes_at`"
      >
        <UInput v-model="closesAt" type="time" class="grow w-full" />
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DaySchedule {
  working_day: string
  is_working: boolean
  opens_at: string
  closes_at: string
}

const schedule = defineModel<DaySchedule>({ default: {} })

const isWorking = computed({
  get: () => schedule.value.is_working,
  set: (val) => {
    schedule.value = {
      ...schedule.value,
      is_working: val,
      opens_at: val ? schedule.value.opens_at || '08:00' : '',
      closes_at: val ? schedule.value.closes_at || '17:00' : '',
    }
  },
})

const opensAt = computed({
  get: () => schedule.value.opens_at,
  set: (val) => {
    schedule.value = { ...schedule.value, opens_at: val }
  },
})

const closesAt = computed({
  get: () => schedule.value.closes_at,
  set: (val) => {
    schedule.value = { ...schedule.value, closes_at: val }
  },
})
</script>
