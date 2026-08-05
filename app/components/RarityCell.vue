<script setup lang="ts">
import type { Zone, ZoneEntry, Season, TimeOfDay } from '~/utils/types'

const props = defineProps<{
  zone: Zone
  entry: ZoneEntry
  season: Season
  timeOfDay: TimeOfDay
  value: string
}>()

const { siblingsFor } = useHordes()
const { t } = useLocale()

const siblings = computed(() => siblingsFor(props.zone, props.entry, props.season, props.timeOfDay))
</script>

<template>
  <div class="group relative text-center">
    <span :class="siblings.length ? 'cursor-help text-neutral-300 underline decoration-dotted decoration-neutral-600 underline-offset-2' : 'text-neutral-300'">
      {{ value }}
    </span>

    <div
      v-if="siblings.length"
      class="pointer-events-none absolute left-1/2 top-full z-10 hidden w-52 -translate-x-1/2 rounded border border-neutral-700 bg-neutral-950 p-2 text-left normal-case tracking-normal text-neutral-300 shadow-lg group-hover:block"
    >
      <p class="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">{{ t.alsoHere }}</p>
      <p v-for="s in siblings" :key="s.pokemonId" class="flex justify-between gap-2 text-xs">
        <span>{{ s.pokemonName }}</span>
        <span class="text-neutral-400">{{ s.rate }}</span>
      </p>
    </div>
  </div>
</template>
