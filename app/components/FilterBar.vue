<script setup lang="ts">
import { SEASONS } from '~/utils/types'
import { REGIONS } from '~/composables/useHordes'

const { hordeSize, season, region, search, resultCount, resetFilters } = useHordes()
const shiny = useShiny()

const SEASON_LABELS: Record<string, string> = {
  Spring: '🌸 Printemps',
  Summer: '☀️ Été',
  Autumn: '🍂 Automne',
  Winter: '❄️ Hiver',
}
</script>

<template>
  <div class="flex flex-wrap items-end gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">Horde</span>
      <select v-model="hordeSize" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">Toutes</option>
        <option :value="3">Horde x3</option>
        <option :value="5">Horde x5</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">Saison</span>
      <select v-model="season" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">Toutes</option>
        <option v-for="s in SEASONS" :key="s" :value="s">{{ SEASON_LABELS[s] }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">Région</span>
      <select v-model="region" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">Toutes</option>
        <option v-for="r in REGIONS" :key="r" :value="r">{{ r }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">Pokémon</span>
      <input
        v-model="search"
        type="text"
        placeholder="Nom..."
        class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100 placeholder:text-neutral-500"
      >
    </label>

    <label class="flex cursor-pointer items-center gap-2 text-sm text-neutral-400">
      <input v-model="shiny" type="checkbox" class="h-4 w-4 accent-amber-400">
      ✨ Sprites shiny
    </label>

    <button
      type="button"
      class="rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800"
      @click="resetFilters"
    >
      Réinitialiser
    </button>

    <span class="ml-auto text-sm text-neutral-500">
      {{ resultCount }} rencontre(s)
    </span>
  </div>
</template>
