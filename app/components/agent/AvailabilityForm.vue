<template>
  <UCard>
    <template #header>
      <div>
        <h2 class="text-lg font-semibold text-highlighted">Availability</h2>
        <p class="text-sm text-muted mt-1">
          Set the agent's working days and operating hours.
        </p>
      </div>
    </template>

    <div class="space-y-3">
      <AgentDaySchedule
        v-for="(day, index) in schedule"
        :key="day.working_day"
        :model-value="day"
        @update:model-value="(value) => updateDay(index, value)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { DAYS_OF_WEEK } from '~~/shared/utils/constants'

export interface DayScheduleEntry {
  working_day: string
  is_working: boolean
  opens_at: string
  closes_at: string
}

interface Props {
  modelValue: DayScheduleEntry[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: DayScheduleEntry[]]
}>()

// Initialize schedule for all 7 days
const schedule = ref<DayScheduleEntry[]>(
  DAYS_OF_WEEK.map((day) => {
    const existing = props.modelValue.find((s) => s.working_day === day)
    if (existing) {
      return { ...existing }
    }
    // Default: Mon-Fri working, Sat-Sun off
    const isWeekday = !['Saturday', 'Sunday'].includes(day)
    return {
      working_day: day,
      is_working: isWeekday,
      opens_at: isWeekday ? '08:00' : '',
      closes_at: isWeekday ? '17:00' : '',
    }
  }),
)

function updateDay(index: number, value: DayScheduleEntry) {
  schedule.value[index] = value
  emitUpdate()
}

function emitUpdate() {
  emit('update:modelValue', [...schedule.value])
}

// Emit initial state on mount
onMounted(() => emitUpdate())

defineExpose({
  validate: () => {
    const workingDays = schedule.value.filter((d) => d.is_working)
    if (workingDays.length === 0) {
      return false
    }
    return workingDays.every((d) => d.opens_at && d.closes_at)
  },
})
</script>
