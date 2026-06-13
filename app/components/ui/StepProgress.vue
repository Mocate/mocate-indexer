<template>
  <div>
    <!-- Mobile: compact counter + title + progress bar -->
    <div class="sm:hidden">
      <div class="flex items-baseline justify-between">
        <p class="text-sm font-medium text-highlighted">
          {{ steps[current]?.title }}
        </p>
        <p class="text-xs text-muted tabular-nums">
          Step {{ current + 1 }} of {{ steps.length }}
        </p>
      </div>
      <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-elevated">
        <div
          class="h-full rounded-full bg-primary transition-all duration-300"
          :style="{ width: `${((current + 1) / steps.length) * 100}%` }"
        />
      </div>
    </div>

    <!-- Desktop: numbered nodes with connectors -->
    <ol class="hidden items-center sm:flex">
      <li
        v-for="(step, index) in steps"
        :key="step.value"
        class="flex items-center"
        :class="index < steps.length - 1 ? 'flex-1' : ''"
      >
        <button
          type="button"
          class="group flex items-center gap-2.5 text-left"
          :disabled="index > current"
          :class="index <= current ? 'cursor-pointer' : 'cursor-default'"
          @click="index < current && emit('select', index)"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors"
            :class="nodeClass(index)"
          >
            <UIcon
              v-if="index < current"
              name="i-lucide-check"
              class="size-4"
            />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span
            class="text-sm font-medium transition-colors"
            :class="
              index === current
                ? 'text-highlighted'
                : index < current
                  ? 'text-default'
                  : 'text-muted'
            "
          >
            {{ step.title }}
          </span>
        </button>

        <span
          v-if="index < steps.length - 1"
          class="mx-3 h-px flex-1 transition-colors"
          :class="index < current ? 'bg-primary' : 'bg-default'"
        />
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
export interface StepItem {
  title: string
  value: string
}

interface Props {
  steps: StepItem[]
  current: number
}

const props = defineProps<Props>()

const emit = defineEmits<{ select: [index: number] }>()

function nodeClass(index: number) {
  // current: filled brand node; completed: success (teal) node; upcoming: outlined
  return index === props.current
    ? 'border-primary bg-primary text-inverted'
    : index < props.current
      ? 'border-success bg-success text-inverted'
      : 'border-default bg-default text-muted'
}
</script>
