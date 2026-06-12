<template>
  <UCard>
    <template #header>
      <div>
        <h2 class="text-lg font-semibold text-highlighted">Visibility</h2>
        <p class="text-sm text-muted mt-1">
          Add images to help customers recognize the agent.
        </p>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Banner Upload -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium text-default">Banner</h3>
        <div v-if="bannerPreview" class="relative">
          <img
            :src="bannerPreview"
            alt="Banner preview"
            class="h-32 w-full rounded-lg object-cover"
          />
          <UButton
            icon="i-lucide-x"
            color="error"
            size="xs"
            class="absolute right-2 top-2"
            @click="removeBanner"
          />
        </div>
        <UButton
          v-else
          label="Upload banner"
          icon="i-lucide-image"
          variant="soft"
          @click="bannerInputRef?.click()"
        />
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
        <h3 class="text-sm font-medium text-default">Logo</h3>
        <div v-if="logoPreview" class="relative w-fit">
          <img
            :src="logoPreview"
            alt="Logo preview"
            class="size-20 rounded-lg object-cover"
          />
          <UButton
            icon="i-lucide-x"
            color="error"
            size="xs"
            class="absolute -right-2 -top-2"
            @click="removeLogo"
          />
        </div>
        <UButton
          v-else
          label="Upload logo"
          icon="i-lucide-store"
          variant="soft"
          @click="logoInputRef?.click()"
        />
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
        <h3 class="text-sm font-medium text-default">Photos</h3>
        <div v-if="imagesPreviews.length" class="grid grid-cols-3 gap-3">
          <div
            v-for="(preview, index) in imagesPreviews"
            :key="index"
            class="relative"
          >
            <img
              :src="preview"
              :alt="`Photo ${index + 1}`"
              class="aspect-square w-full rounded-lg object-cover"
            />
            <UButton
              icon="i-lucide-x"
              color="error"
              size="xs"
              class="absolute -right-2 -top-2"
              @click="removeImage(index)"
            />
          </div>
        </div>
        <UButton
          label="Add photos"
          icon="i-lucide-plus"
          variant="soft"
          @click="imagesInputRef?.click()"
        />
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
  </UCard>
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
