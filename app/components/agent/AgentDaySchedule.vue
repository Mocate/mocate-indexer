<template>
  <div class="flex flex-col gap-3 rounded-lg border border-default p-4">
    <UCheckbox v-model="isWorking" :label="schedule.working_day" />

    <div v-if="isWorking" class="grid grid-cols-2 gap-3 pl-7">
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
