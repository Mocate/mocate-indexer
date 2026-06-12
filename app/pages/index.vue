<template>
  <div class="min-h-screen bg-default">
    <div class="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-highlighted">Index an Agent</h1>
        <p class="text-sm text-muted mt-1">
          Register a mobile money agent to the Mocate directory.
        </p>
      </div>

      <!-- Stepper -->
      <UStepper
        ref="stepperRef"
        v-model="currentStep"
        :items="steps"
        color="primary"
        size="sm"
        class="mb-8"
        linear
      >
        <template #content="{ item }">
          <div class="mt-6">
            <!-- Step 1: Agent Information -->
            <AgentInformationForm
              v-if="item.value === 'info'"
              ref="stepRef"
              v-model="agentInfo"
              :networks="networks"
            />

            <!-- Step 2: Availability -->
            <AvailabilityForm
              v-if="item.value === 'availability'"
              ref="stepRef"
              v-model="schedule"
            />

            <!-- Step 3: Visibility -->
            <VisibilityForm
              v-if="item.value === 'visibility'"
              ref="stepRef"
              v-model="visibility"
            />
          </div>
        </template>
      </UStepper>

      <!-- Navigation Buttons -->
      <div class="mt-8 flex items-center justify-between">
        <UButton
          label="Back"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :disabled="currentStep === steps.at(0)?.value"
          @click="goPrev"
        />

        <UButton
          v-if="currentStep !== steps.at(-1)?.value"
          label="Continue"
          trailing-icon="i-lucide-arrow-right"
          @click="goNext"
        />
        <UButton
          v-else
          label="Submit agent"
          icon="i-lucide-check"
          :loading="submitting"
          @click="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StepperProps } from '@nuxt/ui'
import { v4 } from 'uuid'

import type { AgentInformationData } from '~/components/agent/AgentInformationForm.vue'
import type { DayScheduleEntry } from '~/components/agent/AvailabilityForm.vue'
import type { VisibilityData } from '~/components/agent/VisibilityForm.vue'

const steps: StepperProps['items'] = [
  {
    title: 'Agent Information',
    description: 'Basic details & location',
    icon: 'i-lucide-user',
    value: 'info',
  },
  {
    title: 'Availability',
    description: 'Working days & hours',
    icon: 'i-lucide-clock',
    value: 'availability',
  },
  {
    title: 'Visibility',
    description: 'Images & branding',
    icon: 'i-lucide-image',
    value: 'visibility',
  },
]

const toast = useToast()
const { createAgent, fetchNetworks } = useAgents()
const { uploadLogo, uploadBanner, uploadImage } = useImageUpload()

// Fetch networks
const networks = ref<Awaited<ReturnType<typeof fetchNetworks>>>([])
const networksLoading = ref(true)

onMounted(async () => {
  try {
    networks.value = await fetchNetworks()
  } catch {
    toast.add({
      title: 'Failed to load networks',
      description: 'Please refresh the page to try again.',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    networksLoading.value = false
  }
})

// Stepper state
const currentStep = ref<string | number>('info')
const submitting = ref(false)

const stepperRef = useTemplateRef<{
  next: () => void
  prev: () => void
  hasNext: boolean
  hasPrev: boolean
}>('stepperRef')

// Step 1 data
const agentInfo = ref<AgentInformationData>({
  name: '',
  attendant: '',
  networks: [],
  location: {
    lat: 0,
    lon: 0,
    address: '',
    city: '',
    country: 'Ghana',
  },
})

// Step 2 data
const schedule = ref<DayScheduleEntry[]>([])

// Step 3 data
const visibility = ref<VisibilityData>({
  bannerFile: null,
  logoFile: null,
  imageFiles: [],
})

// Step form refs
const stepRef = useTemplateRef<{ validate: () => boolean | Promise<boolean> }>(
  'stepRef',
)

async function validateCurrentStep(): Promise<boolean> {
  console.log(currentStep.value, stepRef.value)
  return stepRef.value?.validate() ?? Promise.resolve(false)
}

async function goNext() {
  const valid = await validateCurrentStep()
  if (!valid) {
    toast.add({
      title: 'Please complete all required fields',
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }
  stepperRef.value?.next()
}

function goPrev() {
  stepperRef.value?.prev()
}

async function handleSubmit() {
  console.log('will submit')
  const valid = await validateCurrentStep()
  if (!valid) {
    toast.add({
      title: 'Please complete all required fields',
      color: 'warning',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  submitting.value = true

  try {
    // Build operational hours from schedule
    const operationalHours = schedule.value
      .filter((d) => d.is_working && d.opens_at && d.closes_at)
      .map((d) => ({
        working_day: d.working_day,
        opens_at: d.opens_at,
        closes_at: d.closes_at,
      }))

    // Generate the agent id up front so we can upload images and persist
    // their paths in a single INSERT. The public (anon) role has INSERT but
    // not UPDATE on `agents`, so a follow-up update would silently affect 0
    // rows and leave logo/banner null.
    const agentId = v4()

    // Upload images if present
    let logoPath: string | undefined
    let bannerPath: string | undefined
    const imagePaths: string[] = []

    if (visibility.value.logoFile) {
      logoPath = await uploadLogo(visibility.value.logoFile, agentId)
    }

    if (visibility.value.bannerFile) {
      bannerPath = await uploadBanner(visibility.value.bannerFile, agentId)
    }

    for (const file of visibility.value.imageFiles) {
      const path = await uploadImage(file, agentId)
      imagePaths.push(path)
    }

    await createAgent({
      id: agentId,
      name: agentInfo.value.name,
      attendant: agentInfo.value.attendant || undefined,
      location: agentInfo.value.location,
      networks: agentInfo.value.networks
        .filter((n) => n.network_id !== null)
        .map((n) => ({
          network_id: n.network_id!,
          merchant_code: n.merchant_code || undefined,
        })),
      operational_hours: operationalHours,
      logo: logoPath,
      banner: bannerPath,
      imagePaths,
    })

    toast.add({
      title: 'Agent indexed successfully!',
      description: `${agentInfo.value.name} has been added to the directory.`,
      color: 'success',
      icon: 'i-lucide-check-circle',
    })

    resetForm()
  } catch (error) {
    toast.add({
      title: 'Failed to index agent',
      description:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  agentInfo.value = {
    name: '',
    attendant: '',
    networks: [],
    location: {
      lat: 0,
      lon: 0,
      address: '',
      city: '',
      country: 'Ghana',
    },
  }
  currentStep.value = steps.at(0)?.value || 'info'
  schedule.value = []
  visibility.value = {
    bannerFile: null,
    logoFile: null,
    imageFiles: [],
  }
}
</script>
