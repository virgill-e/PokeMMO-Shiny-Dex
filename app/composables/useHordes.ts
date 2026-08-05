import rawHordes from '~/data/hordes.json'
import { SEASONS } from '~/utils/types'
import type { HordeRecord, Season, HordeSize, Zone, ZoneEntry, TimeOfDay, Sibling, Rarity } from '~/utils/types'
import type { Locale } from '~/i18n/translations'

const records = rawHordes as HordeRecord[]

const PAGE_SIZE = 24

// How many zones are initially rendered / revealed per "load more" click.
// Rendering all ~250 zones at once (4994 records) blows up the DOM to
// 100k+ nodes and makes first load noticeably slow.

interface SlotMember {
  pokemonId: number
  pokemonName: string
  rarity: Rarity
}

// region|location|encounterType|hordeSize|season -> every pokemon occupying that
// exact horde slot. Built once per locale (pokemon names are localized) and
// reused by every RarityCell, instead of re-scanning all records per cell.
const slotIndexCache = new Map<Locale, Map<string, SlotMember[]>>()

function buildSlotIndex(locale: Locale) {
  const cached = slotIndexCache.get(locale)
  if (cached) return cached

  const index = new Map<string, SlotMember[]>()
  for (const r of records) {
    const key = `${r.region}|${r.location}|${r.encounterType}|${r.hordeSize}|${r.season}`
    let members = index.get(key)
    if (!members) {
      members = []
      index.set(key, members)
    }
    members.push({
      pokemonId: r.pokemonId,
      pokemonName: locale === 'fr' ? r.pokemonNameFr : r.pokemonName,
      rarity: r.rarity,
    })
  }
  slotIndexCache.set(locale, index)
  return index
}

export function useHordes() {
  const { locale } = useLocale()

  const hordeSize = useState<'all' | HordeSize>('filter-horde-size', () => 'all')
  const season = useState<'all' | Season>('filter-season', () => 'all')
  const region = useState<'all' | string>('filter-region', () => 'all')
  const location = useState('filter-location', () => '')
  const search = useState('filter-search', () => '')
  const visibleCount = useState('visible-zone-count', () => PAGE_SIZE)

  // A localized location search is meaningless once the language changes.
  watch(locale, () => { location.value = '' })

  // Any change of query should start back from the top of the results.
  watch([hordeSize, season, region, location, search], () => { visibleCount.value = PAGE_SIZE })

  function pokemonName(r: HordeRecord) {
    return locale.value === 'fr' ? r.pokemonNameFr : r.pokemonName
  }

  function locationName(r: HordeRecord) {
    return locale.value === 'fr' ? r.locationFr : r.location
  }

  const locationOptions = computed(() => {
    const names = new Set(records.map(locationName))
    return [...names].sort((a, b) => a.localeCompare(b))
  })

  const filtered = computed(() => records.filter((r) => {
    if (hordeSize.value !== 'all' && r.hordeSize !== hordeSize.value) return false
    if (season.value !== 'all' && r.season !== season.value) return false
    if (region.value !== 'all' && r.region !== region.value) return false
    if (location.value && !locationName(r).toLowerCase().includes(location.value.trim().toLowerCase())) return false
    if (search.value && !pokemonName(r).toLowerCase().includes(search.value.trim().toLowerCase())) return false
    return true
  }))

  const zones = computed<Zone[]>(() => {
    const zoneMap = new Map<string, { region: string, location: string, locationKey: string, entries: Map<string, ZoneEntry> }>()

    for (const r of filtered.value) {
      const zoneKey = `${r.region}__${r.location}`
      if (!zoneMap.has(zoneKey)) {
        zoneMap.set(zoneKey, { region: r.region, location: locationName(r), locationKey: r.location, entries: new Map() })
      }
      const zone = zoneMap.get(zoneKey)!

      // Encounter type is part of the entry key: the same pokemon can appear in the
      // same zone through several distinct methods at once (e.g. Cave AND Water in a
      // cavern with a lake), each with its own rarity/levels.
      const entryKey = `${r.pokemonId}__${r.hordeSize}__${r.encounterType}`
      if (!zone.entries.has(entryKey)) {
        zone.entries.set(entryKey, {
          pokemonId: r.pokemonId,
          pokemonName: pokemonName(r),
          types: r.types,
          hordeSize: r.hordeSize,
          encounterType: r.encounterType,
          seasonRarities: [],
          minLevel: r.minLevel,
          maxLevel: r.maxLevel,
        })
      }
      const entry = zone.entries.get(entryKey)!
      if (!entry.seasonRarities.some(sr => sr.season === r.season)) {
        entry.seasonRarities.push({ season: r.season, rarity: r.rarity })
      }
      entry.minLevel = Math.min(entry.minLevel, r.minLevel)
      entry.maxLevel = Math.max(entry.maxLevel, r.maxLevel)
    }

    return [...zoneMap.values()]
      .map(z => ({
        region: z.region,
        location: z.location,
        locationKey: z.locationKey,
        entries: [...z.entries.values()]
          .map(e => ({
            ...e,
            seasonRarities: [...e.seasonRarities].sort((a, b) => SEASONS.indexOf(a.season) - SEASONS.indexOf(b.season)),
          }))
          .sort((a, b) => a.pokemonName.localeCompare(b.pokemonName) || a.encounterType.localeCompare(b.encounterType)),
      }))
      .sort((a, b) => a.region.localeCompare(b.region) || a.location.localeCompare(b.location))
  })

  const visibleZones = computed(() => zones.value.slice(0, visibleCount.value))
  const hasMoreZones = computed(() => zones.value.length > visibleCount.value)

  function loadMoreZones() {
    visibleCount.value += PAGE_SIZE
  }

  const resultCount = computed(() => filtered.value.length)

  function resetFilters() {
    hordeSize.value = 'all'
    season.value = 'all'
    region.value = 'all'
    location.value = ''
    search.value = ''
  }

  // Other pokemon sharing the exact same horde slot (zone + encounter type + horde
  // size + season) as `entry` — i.e. what else you might run into alongside it.
  // Looks up the full, unfiltered dataset so active UI filters don't hide siblings.
  function siblingsFor(zone: Zone, entry: ZoneEntry, seasonValue: Season, timeOfDay: TimeOfDay): Sibling[] {
    const key = `${zone.region}|${zone.locationKey}|${entry.encounterType}|${entry.hordeSize}|${seasonValue}`
    const members = buildSlotIndex(locale.value).get(key)
    if (!members) return []

    return members
      .filter(m => m.pokemonId !== entry.pokemonId)
      .map(m => ({ pokemonId: m.pokemonId, pokemonName: m.pokemonName, rate: m.rarity[timeOfDay] }))
      .sort((a, b) => a.pokemonName.localeCompare(b.pokemonName))
  }

  return {
    hordeSize,
    season,
    region,
    location,
    locationOptions,
    search,
    zones,
    visibleZones,
    hasMoreZones,
    loadMoreZones,
    resultCount,
    resetFilters,
    siblingsFor,
  }
}
