<script setup lang="ts">
import { githubStarsLabel } from '~/i18n/translations'

const { mode, setMode, loading, ensureLoaded, zones, visibleZones, hasMoreZones, loadMoreZones } = useEncounters()
const { locale, setLocale, t } = useLocale()
const { stars } = useGithubStars()

const { close } = useRarityTooltip()
onMounted(() => {
  document.addEventListener('click', close)
  ensureLoaded(mode.value)
})
onUnmounted(() => document.removeEventListener('click', close))
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-neutral-950 text-neutral-200">
    <NuxtRouteAnnouncer />

    <header class="flex items-start justify-between gap-4 border-b border-neutral-800 px-6 py-4">
      <div>
        <h1 class="text-xl font-bold text-neutral-100">{{ t.appTitle }}</h1>
        <p class="text-sm text-neutral-500">{{ t.appSubtitle }}</p>
      </div>

      <div class="flex shrink-0 items-center gap-3">
        <a
          href="https://github.com/virgill-e/PokeMMO-Shiny-Dex"
          target="_blank"
          rel="noopener"
          class="rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-amber-400 hover:bg-neutral-800"
        >
          {{ githubStarsLabel(locale, stars) }}
        </a>

        <div class="flex overflow-hidden rounded border border-neutral-700 text-sm">
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
      </div>
    </header>

    <div class="flex gap-2 px-6 pt-4">
      <button
        type="button"
        class="flex-1 rounded-lg border px-4 py-3 text-left transition"
        :class="mode === 'hordes' ? 'border-amber-500 bg-amber-500/10' : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800'"
        @click="setMode('hordes')"
      >
        <p class="font-semibold" :class="mode === 'hordes' ? 'text-amber-400' : 'text-neutral-100'">{{ t.modeHordes }}</p>
        <p class="text-xs text-neutral-500">{{ t.modeHordesHint }}</p>
      </button>
      <button
        type="button"
        class="flex-1 rounded-lg border px-4 py-3 text-left transition"
        :class="mode === 'singles' ? 'border-amber-500 bg-amber-500/10' : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800'"
        @click="setMode('singles')"
      >
        <p class="font-semibold" :class="mode === 'singles' ? 'text-amber-400' : 'text-neutral-100'">{{ t.modeSingles }}</p>
        <p class="text-xs text-neutral-500">{{ t.modeSinglesHint }}</p>
      </button>
    </div>

    <main class="flex flex-col gap-4 p-6">
      <FilterBar />

      <p v-if="loading" class="py-12 text-center text-neutral-500">
        {{ t.loading }}
      </p>

      <p v-else-if="zones.length === 0" class="py-12 text-center text-neutral-500">
        {{ t.noResults }}
      </p>

      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZoneCard v-for="zone in visibleZones" :key="`${zone.region}-${zone.location}`" :zone="zone" />
      </div>

      <div v-if="!loading && hasMoreZones" class="flex flex-col items-center gap-2 py-4">
        <button
          type="button"
          class="rounded border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          @click="loadMoreZones"
        >
          {{ t.loadMore }}
        </button>
        <p class="text-xs text-neutral-500">{{ visibleZones.length }} / {{ zones.length }}</p>
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
      <p class="mt-1">
        <a href="https://github.com/virgill-e/PokeMMO-Shiny-Dex" target="_blank" rel="noopener" class="underline hover:text-neutral-300">{{ t.footerStar }}</a>
      </p>
    </footer>
  </div>
</template>
