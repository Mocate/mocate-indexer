import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY,
  )

  return { provide: { supabase } }
})
