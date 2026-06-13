<template>
  <div class="flex items-center gap-2.5">
    <img
      src="/logo.png"
      alt="Mocate"
      class="shrink-0 rounded-(--ui-radius) object-cover"
      :class="size"
    />
    <span
      v-if="wordmark"
      class="text-base font-semibold tracking-tight text-highlighted"
    >
      Mocate
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Show the "Mocate" wordmark beside the logo tile. */
  wordmark?: boolean
  /** Tailwind size utility for the logo tile. */
  size?: string
}

withDefaults(defineProps<Props>(), {
  wordmark: true,
  size: 'size-12',
})
</script>
