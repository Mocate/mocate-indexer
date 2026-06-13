// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap',
          rel: 'stylesheet',
        },
      ],
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

  css: ['~/assets/css/main.css'],

  vite: {
    optimizeDeps: {
      include: ['@supabase/supabase-js', '@tanstack/vue-query', 'uuid', 'zod'],
    },
  },

  compatibilityDate: '2025-01-15',
})
