<template>
  <div class="min-h-screen bg-muted/30">
    <div
      class="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-12"
    >
      <!-- Brand / page header -->
      <header class="mb-8">
        <UiBrandMark />
      </header>

      <!-- Success state -->
      <div
        v-if="submitted"
        class="flex flex-1 flex-col items-center justify-center py-12 text-center"
      >
        <div
          class="flex size-14 items-center justify-center rounded-full bg-success/10"
        >
          <UIcon name="i-lucide-check" class="size-7 text-success" />
        </div>
        <h1 class="mt-5 text-2xl font-bold tracking-tight text-highlighted">
          Agent indexed
        </h1>
        <p class="mt-2 max-w-sm text-sm text-muted">
          <span class="font-medium text-default">{{ submittedName }}</span>
          has been added to the Mocate directory. Thank you for indexing.
        </p>
        <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <UButton
            label="Index another agent"
            icon="i-lucide-plus"
            @click="startAnother"
          />
          <UButton
            label="View agents"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-arrow-right"
            to="/agents"
          />
        </div>
      </div>

      <!-- Form flow -->
      <template v-else>
        <div class="mb-7">
          <h1 class="text-2xl font-bold tracking-tight text-highlighted">
            Index an agent
          </h1>
          <p class="mt-1 text-sm text-muted">
            Register a mobile money agent to the Mocate directory.
          </p>
        </div>

        <UiStepProgress
          :steps="steps"
          :current="currentStepIndex"
          class="mb-8"
          @select="goToStep"
        />

        <!-- Active step heading + body -->
        <div class="flex-1">
          <div class="mb-5">
            <h2 class="text-lg font-semibold text-highlighted">
              {{ activeStep.title }}
            </h2>
            <p class="mt-0.5 text-sm text-muted">
              {{ activeStep.description }}
            </p>
          </div>

          <AgentInformationForm
            v-if="activeStep.value === 'info'"
            ref="stepRef"
            v-model="agentInfo"
            :networks="networks"
          />
          <AgentAvailabilityForm
            v-else-if="activeStep.value === 'availability'"
            ref="stepRef"
            v-model="schedule"
          />
          <AgentVisibilityForm
            v-else-if="activeStep.value === 'visibility'"
            ref="stepRef"
            v-model="visibility"
          />
        </div>

        <!-- Navigation: inline on desktop, sticky bottom bar on mobile -->
        <div
          class="fixed inset-x-0 bottom-0 z-10 border-t border-default bg-default/90 px-4 py-3 backdrop-blur sm:static sm:mt-10 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
        >
          <div
            class="mx-auto flex max-w-2xl items-center justify-between gap-3"
          >
            <UButton
              label="Back"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              :disabled="currentStepIndex === 0"
              @click="goPrev"
            />

            <UButton
              v-if="!isLastStep"
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { v4 } from 'uuid'

import type { AgentInformationData } from '~/components/agent/AgentInformationForm.vue'
import type { DayScheduleEntry } from '~/components/agent/AvailabilityForm.vue'
import type { VisibilityData } from '~/components/agent/VisibilityForm.vue'
import type { StepItem } from '~/components/ui/StepProgress.vue'

interface FormStep extends StepItem {
  description: string
}

const steps: FormStep[] = [
  {
    title: 'Agent information',
    description: 'Basic details & location of the agent.',
    value: 'info',
  },
  {
    title: 'Availability',
    description: "The agent's working days and operating hours.",
    value: 'availability',
  },
  {
    title: 'Visibility',
    description: 'Images that help customers recognise the agent.',
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
const currentStepIndex = ref(0)
const submitting = ref(false)
const submitted = ref(false)
const submittedName = ref('')

const activeStep = computed(() => steps[currentStepIndex.value]!)
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1)

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

// Active step form ref (only one step is mounted at a time)
const stepRef = useTemplateRef<{ validate: () => boolean | Promise<boolean> }>(
  'stepRef',
)

async function validateCurrentStep(): Promise<boolean> {
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
  if (currentStepIndex.value < steps.length - 1) {
    currentStepIndex.value++
  }
}

function goPrev() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

// Jump back to an already-completed step from the progress indicator.
function goToStep(index: number) {
  if (index < currentStepIndex.value) {
    currentStepIndex.value = index
  }
}

async function handleSubmit() {
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

    submittedName.value = agentInfo.value.name
    submitted.value = true
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
  currentStepIndex.value = 0
  schedule.value = []
  visibility.value = {
    bannerFile: null,
    logoFile: null,
    imageFiles: [],
  }
}

function startAnother() {
  submitted.value = false
  submittedName.value = ''
}
</script>
