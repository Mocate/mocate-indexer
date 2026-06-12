<template>
  <div class="flex min-h-dvh items-center justify-center bg-default px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <UIcon
            name="i-lucide-map-pin"
            class="mx-auto mb-2 size-10 text-primary"
          />
          <h1 class="text-xl font-semibold text-default">Welcome back</h1>
          <p class="mt-1 text-sm text-muted">Sign in to Mocate Indexer</p>
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Email" name="email">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>

        <UButton type="submit" block :loading="loading" label="Sign in" />
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const { login, isAuthenticated, init } = useSession()
const toast = useToast()
const loading = ref(false)

await init()

if (isAuthenticated.value) {
  navigateTo('/agents')
}

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: '',
  password: '',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await login(event.data.email, event.data.password)
    navigateTo('/agents')
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Login failed. Please try again.'
    toast.add({
      title: 'Login failed',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    loading.value = false
  }
}
</script>
