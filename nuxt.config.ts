// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  nitro: {
    // public/data/*.json (singles.json is ~8MB) gets pre-gzipped at build time
    // and served compressed instead of raw.
    compressPublicAssets: true,
  },
})