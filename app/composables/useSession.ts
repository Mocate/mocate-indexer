import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const initialized = ref(false)

export function useSession() {
  const { $supabase } = useNuxtApp()
  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    if (initialized.value) {
      return
    }

    const {
      data: { session },
    } = await $supabase.auth.getSession()
    user.value = session?.user ?? null
    initialized.value = true

    $supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  async function login(email: string, password: string) {
    const { error } = await $supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw error
    }
  }

  async function logout() {
    const { error } = await $supabase.auth.signOut()
    if (error) {
      throw error
    }
    user.value = null
    navigateTo('/login')
  }

  return {
    user: readonly(user),
    isAuthenticated,
    initialized: readonly(initialized),
    init,
    login,
    logout,
  }
}
