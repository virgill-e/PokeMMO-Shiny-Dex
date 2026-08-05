<script setup lang="ts">
import { SEASONS, REGIONS } from '~/utils/types'
import { REGION_LABELS, SEASON_LABELS, resultCountLabel } from '~/i18n/translations'

const { mode, hordeSize, season, region, location, locationOptions, search, timeOfDay, guaranteedOnly, resultCount, resetFilters } = useEncounters()
const { locale, t } = useLocale()
const shiny = useShiny()
</script>

<template>
  <div class="flex flex-wrap items-end gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
    <label v-if="mode === 'hordes'" class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">{{ t.labelHorde }}</span>
      <select v-model="hordeSize" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">{{ t.all }}</option>
        <option :value="3">{{ t.horde3 }}</option>
        <option :value="5">{{ t.horde5 }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">{{ t.labelSeason }}</span>
      <select v-model="season" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">{{ t.all }}</option>
        <option v-for="s in SEASONS" :key="s" :value="s">{{ SEASON_LABELS[locale][s] }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">{{ t.labelRegion }}</span>
      <select v-model="region" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">{{ t.all }}</option>
        <option v-for="r in REGIONS" :key="r" :value="r">{{ REGION_LABELS[locale][r] }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">{{ t.labelTimeOfDay }}</span>
      <select v-model="timeOfDay" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">{{ t.timeOfDayAll }}</option>
        <option value="allday">{{ t.timeOfDayAllDay }}</option>
        <option value="morning">{{ t.optionMorning }}</option>
        <option value="day">{{ t.optionDay }}</option>
        <option value="night">{{ t.optionNight }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">{{ t.labelLocation }}</span>
      <input
        v-model="location"
        type="text"
        list="location-options"
        :placeholder="t.locationPlaceholder"
        class="w-48 rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-base text-neutral-100 placeholder:text-neutral-500"
      >
      <datalist id="location-options">
        <option v-for="loc in locationOptions" :key="loc" :value="loc" />
      </datalist>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">{{ t.labelPokemon }}</span>
      <input
        v-model="search"
        type="text"
        :placeholder="t.pokemonPlaceholder"
        class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-base text-neutral-100 placeholder:text-neutral-500"
      >
    </label>

    <label v-if="mode === 'hordes'" class="flex cursor-pointer items-center gap-2 text-sm text-neutral-400">
      <input v-model="guaranteedOnly" type="checkbox" class="h-4 w-4 accent-amber-400">
      {{ t.guaranteedOnly }}
    </label>

    <label class="flex cursor-pointer items-center gap-2 text-sm text-neutral-400">
      <input v-model="shiny" type="checkbox" class="h-4 w-4 accent-amber-400">
      {{ t.shinyToggle }}
    </label>

    <button
      type="button"
      class="rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-800"
      @click="resetFilters"
    >
      {{ t.reset }}
    </button>

    <span class="ml-auto text-sm text-neutral-500">
      {{ resultCountLabel(locale, resultCount) }}
    </span>
  </div>
</template>
