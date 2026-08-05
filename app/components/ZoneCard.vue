<script setup lang="ts">
import type { Zone } from '~/utils/types'

defineProps<{ zone: Zone }>()

const SEASON_ICONS: Record<string, string> = {
  Spring: '🌸',
  Summer: '☀️',
  Autumn: '🍂',
  Winter: '❄️',
}
</script>

<template>
  <div class="rounded-lg border border-neutral-800 bg-neutral-900">
    <div class="border-b border-neutral-800 px-4 py-2">
      <h2 class="font-semibold text-neutral-100">
        {{ zone.location }}
      </h2>
      <p class="text-xs text-neutral-500">{{ zone.region }}</p>
    </div>

    <ul class="divide-y divide-neutral-800">
      <li
        v-for="entry in zone.entries"
        :key="`${entry.pokemonId}-${entry.hordeSize}`"
        class="flex flex-wrap items-center gap-3 px-4 py-2"
      >
        <PokemonSprite :pokemon-id="entry.pokemonId" :pokemon-name="entry.pokemonName" />

        <div class="min-w-[9rem] flex-1">
          <p class="font-medium text-neutral-100">{{ entry.pokemonName }}</p>
          <div class="mt-1 flex flex-wrap gap-1">
            <TypeBadge v-for="t in entry.types" :key="t" :type="t" />
          </div>
        </div>

        <span
          class="rounded-full px-2 py-0.5 text-xs font-semibold"
          :class="entry.hordeSize === 5 ? 'bg-rose-900 text-rose-200' : 'bg-sky-900 text-sky-200'"
        >
          Horde x{{ entry.hordeSize }}
        </span>

        <span class="text-xs text-neutral-400">
          Nv. {{ entry.minLevel }}–{{ entry.maxLevel }}
        </span>

        <span class="text-xs text-neutral-400" title="Matin / Jour / Nuit">
          {{ entry.rarity.morning }} · {{ entry.rarity.day }} · {{ entry.rarity.night }}
        </span>

        <span class="flex gap-1 text-sm">
          <span
            v-for="s in entry.seasons"
            :key="s"
            :title="s"
          >{{ SEASON_ICONS[s] }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>
