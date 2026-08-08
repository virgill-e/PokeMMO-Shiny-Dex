<script setup lang="ts">
import type { Zone, ZoneEntry } from '~/utils/types'
import { SEASON_ICONS, ENCOUNTER_TYPE_LABELS, ENCOUNTER_TYPE_ICONS, abilityLabel } from '~/i18n/translations'

const props = defineProps<{ zone: Zone }>()

const { locale, t } = useLocale()
const { isFavorite, toggleFavorite } = useFavorites()

const favorite = computed(() => isFavorite(props.zone.region, props.zone.locationKey))

function entryAbilities(entry: ZoneEntry) {
  const list = entry.abilities.map(name => ({ name, hidden: false }))
  if (entry.hiddenAbility) list.push({ name: entry.hiddenAbility, hidden: true })
  return list
}
</script>

<template>
  <div class="rounded-lg border border-neutral-800 bg-neutral-900">
    <div class="flex items-start justify-between gap-2 border-b border-neutral-800 px-4 py-2">
      <div>
        <h2 class="font-semibold text-neutral-100">
          {{ zone.location }}
        </h2>
        <p class="text-xs text-neutral-500">{{ zone.region }}</p>
      </div>

      <button
        type="button"
        class="shrink-0 text-lg leading-none"
        :class="favorite ? 'text-amber-400' : 'text-neutral-600 hover:text-neutral-400'"
        :title="favorite ? t.favoriteRemove : t.favoriteAdd"
        :aria-label="favorite ? t.favoriteRemove : t.favoriteAdd"
        @click="toggleFavorite(zone.region, zone.locationKey)"
      >
        {{ favorite ? '★' : '☆' }}
      </button>
    </div>

    <ul class="divide-y divide-neutral-800">
      <li
        v-for="entry in zone.entries"
        :key="`${entry.pokemonId}-${entry.hordeSize}-${entry.encounterType}`"
        class="flex flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:gap-3"
      >
        <div class="flex flex-1 flex-wrap items-center gap-3">
          <PokemonSprite :pokemon-id="entry.pokemonId" :pokemon-name="entry.pokemonName" />

          <div class="min-w-[9rem] flex-1">
            <p class="font-medium text-neutral-100">{{ entry.pokemonName }}</p>
            <div class="mt-1 flex flex-wrap gap-1">
              <TypeBadge v-for="tp in entry.types" :key="tp" :type="tp" />
            </div>
            <p class="mt-1 text-xs text-neutral-400">
              <span v-for="(ab, i) in entryAbilities(entry)" :key="ab.name">
                <span v-if="i > 0">, </span>{{ abilityLabel(locale, ab.name) }}<span v-if="ab.hidden">{{ t.hiddenAbilitySuffix }}</span>
              </span>
            </p>
          </div>

          <span class="whitespace-nowrap rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
            {{ ENCOUNTER_TYPE_ICONS[entry.encounterType] ?? '❔' }} {{ ENCOUNTER_TYPE_LABELS[locale][entry.encounterType] ?? entry.encounterType }}
          </span>

          <span
            v-if="entry.hordeSize"
            class="rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="entry.hordeSize === 5 ? 'bg-rose-900 text-rose-200' : 'bg-sky-900 text-sky-200'"
          >
            Horde x{{ entry.hordeSize }}
          </span>

          <span class="text-xs text-neutral-400">
            {{ t.levelPrefix }} {{ entry.minLevel }}–{{ entry.maxLevel }}
          </span>
        </div>

        <div class="grid gap-x-2 gap-y-0.5 text-xs" style="grid-template-columns: 1.25rem repeat(3, 3rem)">
          <span />
          <span class="text-center text-[9px] uppercase tracking-wide text-neutral-500">{{ t.rarityMorning }}</span>
          <span class="text-center text-[9px] uppercase tracking-wide text-neutral-500">{{ t.rarityDay }}</span>
          <span class="text-center text-[9px] uppercase tracking-wide text-neutral-500">{{ t.rarityNight }}</span>

          <template v-for="sr in entry.seasonRarities" :key="sr.season">
            <span :title="sr.season">{{ SEASON_ICONS[sr.season] }}</span>
            <RarityCell :zone="zone" :entry="entry" :season="sr.season" time-of-day="morning" :value="sr.rarity.morning" />
            <RarityCell :zone="zone" :entry="entry" :season="sr.season" time-of-day="day" :value="sr.rarity.day" />
            <RarityCell :zone="zone" :entry="entry" :season="sr.season" time-of-day="night" :value="sr.rarity.night" />
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>
