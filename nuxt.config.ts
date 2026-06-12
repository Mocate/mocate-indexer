// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  app: {
    head: {
      script: [
        { src: '/scripts/maps.google.js' },
        {
          src: `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_PLACES_API_KEY}&libraries=places&loading=async&callback=initGooglePlacesAPI`,
          async: true,
        },
      ],
    },
  },

  modules: ['@nuxt/eslint', '@nuxt/ui'],

  devtools: {
    enabled: true,
  },

  devServer: {
    port: 4631,
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    optimizeDeps: {
      include: ['@supabase/supabase-js', '@tanstack/vue-query', 'uuid', 'zod'],
    },
  },

  compatibilityDate: '2025-01-15',
})
