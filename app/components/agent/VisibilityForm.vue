<template>
  <div class="space-y-7">
    <!-- Banner Upload -->
    <div class="space-y-2">
      <div>
        <h3 class="text-sm font-medium text-highlighted">Banner</h3>
        <p class="text-xs text-muted">Wide cover image shown on the profile.</p>
      </div>
      <div v-if="bannerPreview" class="group relative">
        <img
          :src="bannerPreview"
          alt="Banner preview"
          class="h-36 w-full rounded-(--ui-radius) object-cover"
        />
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="solid"
          size="xs"
          class="absolute right-2 top-2"
          @click="removeBanner"
        />
      </div>
      <button
        v-else
        type="button"
        class="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-(--ui-radius) border border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-elevated/40"
        @click="bannerInputRef?.click()"
      >
        <UIcon name="i-lucide-image-up" class="size-6" />
        <span class="text-sm font-medium">Upload banner</span>
        <span class="text-xs">PNG or JPG</span>
      </button>
      <input
        ref="bannerInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onBannerChange"
      />
    </div>

    <!-- Logo Upload -->
    <div class="space-y-2">
      <div>
        <h3 class="text-sm font-medium text-highlighted">Logo</h3>
        <p class="text-xs text-muted">Square mark used in listings.</p>
      </div>
      <div class="flex items-center gap-4">
        <div v-if="logoPreview" class="relative w-fit">
          <img
            :src="logoPreview"
            alt="Logo preview"
            class="size-24 rounded-(--ui-radius) object-cover"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="solid"
            size="xs"
            class="absolute -right-2 -top-2"
            @click="removeLogo"
          />
        </div>
        <button
          v-else
          type="button"
          class="flex size-24 flex-col items-center justify-center gap-1.5 rounded-(--ui-radius) border border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-elevated/40"
          @click="logoInputRef?.click()"
        >
          <UIcon name="i-lucide-store" class="size-5" />
          <span class="text-xs font-medium">Logo</span>
        </button>
      </div>
      <input
        ref="logoInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onLogoChange"
      />
    </div>

    <!-- Gallery Images -->
    <div class="space-y-2">
      <div>
        <h3 class="text-sm font-medium text-highlighted">Photos</h3>
        <p class="text-xs text-muted">
          Storefront and surroundings to help customers find the agent.
        </p>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div
          v-for="(preview, index) in imagesPreviews"
          :key="index"
          class="relative"
        >
          <img
            :src="preview"
            :alt="`Photo ${index + 1}`"
            class="aspect-square w-full rounded-(--ui-radius) object-cover"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="solid"
            size="xs"
            class="absolute -right-2 -top-2"
            @click="removeImage(index)"
          />
        </div>
        <button
          type="button"
          class="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-(--ui-radius) border border-dashed border-default text-muted transition-colors hover:border-primary hover:bg-elevated/40"
          @click="imagesInputRef?.click()"
        >
          <UIcon name="i-lucide-plus" class="size-5" />
          <span class="text-xs font-medium">Add</span>
        </button>
      </div>
      <input
        ref="imagesInputRef"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="onImagesChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface VisibilityData {
  bannerFile: File | null
  logoFile: File | null
  imageFiles: File[]
}

interface Props {
  modelValue: VisibilityData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: VisibilityData]
}>()

const bannerPreview = ref<string | null>(null)
const logoPreview = ref<string | null>(null)
const imagesPreviews = ref<string[]>([])

const bannerInputRef = ref<HTMLInputElement>()
const logoInputRef = ref<HTMLInputElement>()
const imagesInputRef = ref<HTMLInputElement>()

function onBannerChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null

  if (bannerPreview.value) {
    URL.revokeObjectURL(bannerPreview.value)
  }
  bannerPreview.value = file ? URL.createObjectURL(file) : null

  emit('update:modelValue', {
    ...props.modelValue,
    bannerFile: file,
  })
}

function onLogoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] || null

  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
  }
  logoPreview.value = file ? URL.createObjectURL(file) : null

  emit('update:modelValue', {
    ...props.modelValue,
    logoFile: file,
  })
}

function onImagesChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  // Revoke old previews
  imagesPreviews.value.forEach((url) => URL.revokeObjectURL(url))
  imagesPreviews.value = files.map((f) => URL.createObjectURL(f))

  emit('update:modelValue', {
    ...props.modelValue,
    imageFiles: files,
  })
}

function removeBanner() {
  if (bannerPreview.value) {
    URL.revokeObjectURL(bannerPreview.value)
  }
  bannerPreview.value = null
  if (bannerInputRef.value) {
    bannerInputRef.value.value = ''
  }
  emit('update:modelValue', {
    ...props.modelValue,
    bannerFile: null,
  })
}

function removeLogo() {
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
  }
  logoPreview.value = null
  if (logoInputRef.value) {
    logoInputRef.value.value = ''
  }
  emit('update:modelValue', {
    ...props.modelValue,
    logoFile: null,
  })
}

function removeImage(index: number) {
  URL.revokeObjectURL(imagesPreviews.value[index])
  imagesPreviews.value.splice(index, 1)
  const updatedFiles = [...props.modelValue.imageFiles]
  updatedFiles.splice(index, 1)
  emit('update:modelValue', {
    ...props.modelValue,
    imageFiles: updatedFiles,
  })
}

onBeforeUnmount(() => {
  if (bannerPreview.value) {
    URL.revokeObjectURL(bannerPreview.value)
  }
  if (logoPreview.value) {
    URL.revokeObjectURL(logoPreview.value)
  }
  imagesPreviews.value.forEach((url) => URL.revokeObjectURL(url))
})

defineExpose({
  validate: () => true,
})
</script>
