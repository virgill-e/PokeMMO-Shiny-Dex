<script setup lang="ts">
const { zones } = useHordes()
const { locale, setLocale, t } = useLocale()
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-200">
    <NuxtRouteAnnouncer />

    <header class="flex items-start justify-between gap-4 border-b border-neutral-800 px-6 py-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-100">{{ t.appTitle }}</h1>
        <p class="text-sm text-neutral-500">{{ t.appSubtitle }}</p>
      </div>

      <div class="flex shrink-0 overflow-hidden rounded border border-neutral-700 text-sm">
        <button
          type="button"
          class="px-3 py-1.5"
          :class="locale === 'fr' ? 'bg-amber-500 text-neutral-900 font-semibold' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'"
          @click="setLocale('fr')"
        >
          FR
        </button>
        <button
          type="button"
          class="px-3 py-1.5"
          :class="locale === 'en' ? 'bg-amber-500 text-neutral-900 font-semibold' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'"
          @click="setLocale('en')"
        >
          EN
        </button>
      </div>
    </header>

    <main class="flex flex-col gap-4 p-6">
      <FilterBar />

      <p v-if="zones.length === 0" class="py-12 text-center text-neutral-500">
        {{ t.noResults }}
      </p>

      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZoneCard v-for="zone in zones" :key="`${zone.region}-${zone.location}`" :zone="zone" />
      </div>
    </main>

    <footer class="border-t border-neutral-800 px-6 py-4 text-center text-xs text-neutral-500">
      <p>
        {{ t.footerData }} <a href="https://pokemmohub.com" target="_blank" rel="noopener" class="underline hover:text-neutral-300">PokeMMO Hub</a> ·
        {{ t.footerSprites }} <a href="https://pokeapi.co" target="_blank" rel="noopener" class="underline hover:text-neutral-300">PokeAPI</a>
      </p>
      <p class="mt-1">
        {{ t.footerContact }}
        <a href="https://virgill-e.com/#contact" target="_blank" rel="noopener" class="underline hover:text-neutral-300">virgill-e.com</a>
      </p>
    </footer>
  </div>
</template>
