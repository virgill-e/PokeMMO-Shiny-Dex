<script setup lang="ts">
import type { Zone, ZoneEntry, Season, TimeOfDay } from '~/utils/types'

const props = defineProps<{
  zone: Zone
  entry: ZoneEntry
  season: Season
  timeOfDay: TimeOfDay
  value: string
}>()

const { siblingsFor } = useEncounters()
const { toggle, isOpen } = useRarityTooltip()
const { t } = useLocale()

const siblings = computed(() => siblingsFor(props.zone, props.entry, props.season, props.timeOfDay))

const cellId = computed(() =>
  `${props.zone.region}|${props.zone.locationKey}|${props.entry.pokemonId}|${props.entry.hordeSize}|${props.entry.encounterType}|${props.season}|${props.timeOfDay}`,
)

// Center the popup under the middle column, but keep it anchored to the
// outer columns so it can't spill past the edge of the screen/card.
const alignClass = computed(() => {
  if (props.timeOfDay === 'morning') return 'left-0'
  if (props.timeOfDay === 'night') return 'right-0'
  return 'left-1/2 -translate-x-1/2'
})
</script>

<template>
  <div class="group relative text-center">
    <button
      v-if="siblings.length"
      type="button"
      class="cursor-help border-0 bg-transparent p-0 text-neutral-300 underline decoration-dotted decoration-neutral-600 underline-offset-2"
      @click.stop="toggle(cellId)"
    >
      {{ value }}
    </button>
    <span v-else class="text-neutral-300">{{ value }}</span>

    <div
      v-if="siblings.length"
      class="absolute top-full z-10 w-52 rounded border border-neutral-700 bg-neutral-950 p-2 text-left normal-case tracking-normal text-neutral-300 shadow-lg group-hover:block"
      :class="[alignClass, isOpen(cellId) ? 'block' : 'hidden']"
      @click.stop
    >
      <p class="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">{{ t.alsoHere }}</p>
      <p v-for="s in siblings" :key="s.pokemonId" class="flex justify-between gap-2 text-xs">
        <span>{{ s.pokemonName }}</span>
        <span class="text-neutral-400">{{ s.rate }}</span>
      </p>
    </div>
  </div>
</template>
