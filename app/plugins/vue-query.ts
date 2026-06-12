import {
  dehydrate,
  hydrate,
  QueryClient,
  VueQueryPlugin,
} from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxt) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
      },
    },
  })

  nuxt.vueApp.use(VueQueryPlugin, { queryClient })

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      nuxt.payload['vue-query'] = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxt.hooks.hook('app:created', () => {
      hydrate(queryClient, nuxt.payload['vue-query'])
    })
  }
})
