<script setup lang="ts">
import { SEASONS, REGIONS, POKEMON_TYPES } from '~/utils/types'
import { REGION_LABELS, SEASON_LABELS, TYPE_LABELS, abilityLabel, resultCountLabel } from '~/i18n/translations'

const { mode, hordeSize, season, region, location, locationOptions, search, pokemonType, ability, abilityOptions, timeOfDay, guaranteedOnly, favoritesOnly, resultCount, resetFilters } = useEncounters()
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
      <span class="text-neutral-400">{{ t.labelType }}</span>
      <select v-model="pokemonType" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">{{ t.all }}</option>
        <option v-for="tp in POKEMON_TYPES" :key="tp" :value="tp">{{ TYPE_LABELS[locale][tp] }}</option>
      </select>
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span class="text-neutral-400">{{ t.labelAbility }}</span>
      <select v-model="ability" class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-neutral-100">
        <option value="all">{{ t.all }}</option>
        <option v-for="ab in abilityOptions" :key="ab" :value="ab">{{ abilityLabel(locale, ab) }}</option>
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

    <Checkbox v-if="mode === 'hordes'" v-model="guaranteedOnly">{{ t.guaranteedOnly }}</Checkbox>

    <Checkbox v-model="shiny">{{ t.shinyToggle }}</Checkbox>

    <Checkbox v-model="favoritesOnly">{{ t.favoritesOnly }}</Checkbox>

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
