<script setup lang="ts">
import { TYPE_LABELS } from '~/i18n/translations'
import type { RotationCaveEntry } from '~/composables/useRotationCave'

const { locale, t } = useLocale()
const { data, error, loading, load } = useRotationCave()
const { translate: translatePokemonName } = usePokemonNamesFr()

const open = ref(false)

onMounted(load)

function pokemonName(englishName: string) {
  return locale.value === 'fr' ? translatePokemonName(englishName) : englishName
}

const typeLabel = computed(() => {
  if (!data.value) return ''
  return TYPE_LABELS[locale.value][data.value.typeName.toUpperCase()] ?? data.value.typeName
})

const TIER_COLORS = [
  'bg-fuchsia-900 text-fuchsia-200',
  'bg-rose-900 text-rose-200',
  'bg-orange-900 text-orange-200',
  'bg-amber-900 text-amber-200',
  'bg-lime-900 text-lime-200',
  'bg-emerald-900 text-emerald-200',
  'bg-sky-900 text-sky-200',
  'bg-violet-900 text-violet-200',
]

function tierClass(tier: number | null) {
  if (tier === null) return 'bg-neutral-800 text-neutral-400'
  return TIER_COLORS[Math.min(Math.max(Math.round(tier), 0), TIER_COLORS.length - 1)]
}

const sections = computed<{ label: string, entries: RotationCaveEntry[] }[]>(() => {
  if (!data.value) return []
  return [
    { label: t.value.rotationSingles, entries: data.value.singles },
    { label: t.value.rotationRareSingles, entries: data.value.rareSingles },
    { label: t.value.rotationHordes, entries: data.value.hordes },
  ].filter(s => s.entries.length > 0)
})
</script>

<template>
  <div class="group relative">
    <button
      type="button"
      class="rounded border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-800"
      @click="open = !open"
    >
      {{ t.rotationCaveLabel }}
    </button>

    <div
      class="absolute right-0 top-full z-20 mt-1 w-72 rounded border border-neutral-700 bg-neutral-950 p-3 text-left shadow-lg group-hover:block"
      :class="open ? 'block' : 'hidden'"
    >
      <p v-if="loading" class="text-sm text-neutral-500">{{ t.rotationLoading }}</p>
      <p v-else-if="error || !data" class="text-sm text-neutral-500">{{ t.rotationError }}</p>

      <template v-else>
        <div class="mb-2 flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
          <p class="font-semibold text-neutral-100">{{ typeLabel }}</p>
          <span class="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-neutral-900">{{ t.rotationCaveActive }}</span>
        </div>

        <div v-for="section in sections" :key="section.label" class="mb-2 last:mb-0">
          <p class="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">{{ section.label }}</p>
          <div v-for="entry in section.entries" :key="entry.name" class="flex items-center justify-between gap-2 py-0.5 text-sm">
            <span class="text-neutral-200">{{ pokemonName(entry.name) }}</span>
            <span class="rounded px-1.5 py-0.5 text-[10px] font-semibold" :class="tierClass(entry.tier)">{{ entry.tier ?? '?' }}</span>
          </div>
        </div>

        <p class="mt-2 border-t border-neutral-800 pt-2 text-[10px] text-neutral-500">
          {{ t.rotationCredit }}
          <a :href="data.sourceUrl" target="_blank" rel="noopener" class="underline hover:text-neutral-300">{{ data.credit }}</a>
        </p>
      </template>
    </div>
  </div>
</template>
