import { SEASONS } from '~/utils/types'
import type { EncounterRecord, EncounterMode, Season, HordeSize, Zone, ZoneEntry, TimeOfDay, Sibling, Rarity } from '~/utils/types'
import type { Locale } from '~/i18n/translations'

const PAGE_SIZE = 24

export type TimeOfDayFilter = 'all' | 'allday' | TimeOfDay

// Horde rarity_* values are a raw table share (max 5%), except "Sweet Scent"
// hordes which guarantee an encounter and are already the real percentage
// (max 100%). Either way, this is the value that means "100% real chance".
function guaranteedValue(encounterType: string) {
  return encounterType === 'Sweet Scent' ? '100%' : '5%'
}

// singles.json is ~8MB: fetched at runtime instead of bundled, and only for
// the mode currently in use. Cached at module scope (a plain Promise map,
// not Vue state) so switching modes back and forth never re-fetches.
const fetchPromises: Partial<Record<EncounterMode, Promise<EncounterRecord[]>>> = {}

function fetchDataset(mode: EncounterMode): Promise<EncounterRecord[]> {
  if (!fetchPromises[mode]) {
    fetchPromises[mode] = $fetch<EncounterRecord[]>(`/data/${mode}.json`)
  }
  return fetchPromises[mode]!
}

interface SlotMember {
  pokemonId: number
  pokemonName: string
  rarity: Rarity
}

// "mode:locale" -> (region|location|encounterType|hordeSize|season -> members).
// Built once per mode+locale combination instead of rescanning every record
// for every rarity cell's sibling lookup.
const slotIndexCache = new Map<string, Map<string, SlotMember[]>>()

function buildSlotIndex(mode: EncounterMode, locale: Locale, records: EncounterRecord[]) {
  const cacheKey = `${mode}:${locale}`
  const cached = slotIndexCache.get(cacheKey)
  if (cached) return cached

  const index = new Map<string, SlotMember[]>()
  for (const r of records) {
    const key = `${r.region}|${r.location}|${r.encounterType}|${r.hordeSize ?? 'none'}|${r.season}`
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
  slotIndexCache.set(cacheKey, index)
  return index
}

export function useEncounters() {
  const { locale } = useLocale()

  const mode = useState<EncounterMode>('encounter-mode', () => 'hordes')
  const hordesData = useState<EncounterRecord[] | null>('encounter-data-hordes', () => null)
  const singlesData = useState<EncounterRecord[] | null>('encounter-data-singles', () => null)
  const loading = useState('encounter-loading', () => false)

  const records = computed<EncounterRecord[]>(() => (mode.value === 'hordes' ? hordesData.value : singlesData.value) ?? [])

  async function ensureLoaded(target: EncounterMode) {
    const store = target === 'hordes' ? hordesData : singlesData
    if (store.value) return
    loading.value = true
    try {
      store.value = await fetchDataset(target)
    } finally {
      loading.value = false
    }
  }

  async function setMode(next: EncounterMode) {
    mode.value = next
    hordeSize.value = 'all'
    guaranteedOnly.value = false
    visibleCount.value = PAGE_SIZE
    await ensureLoaded(next)
  }

  const hordeSize = useState<'all' | HordeSize>('filter-horde-size', () => 'all')
  const season = useState<'all' | Season>('filter-season', () => 'all')
  const region = useState<'all' | string>('filter-region', () => 'all')
  const location = useState('filter-location', () => '')
  const search = useState('filter-search', () => '')
  const timeOfDay = useState<TimeOfDayFilter>('filter-time-of-day', () => 'all')
  const guaranteedOnly = useState('filter-guaranteed-only', () => false)
  const visibleCount = useState('visible-zone-count', () => PAGE_SIZE)

  // A localized location search is meaningless once the language changes.
  watch(locale, () => { location.value = '' })

  // Any change of query should start back from the top of the results.
  watch([hordeSize, season, region, location, search, timeOfDay, guaranteedOnly], () => { visibleCount.value = PAGE_SIZE })

  function pokemonName(r: EncounterRecord) {
    return locale.value === 'fr' ? r.pokemonNameFr : r.pokemonName
  }

  function locationName(r: EncounterRecord) {
    return locale.value === 'fr' ? r.locationFr : r.location
  }

  const locationOptions = computed(() => {
    const names = new Set(records.value.map(locationName))
    return [...names].sort((a, b) => a.localeCompare(b))
  })

  const filtered = computed(() => records.value.filter((r) => {
    if (mode.value === 'hordes' && hordeSize.value !== 'all' && r.hordeSize !== hordeSize.value) return false
    if (season.value !== 'all' && r.season !== season.value) return false
    if (region.value !== 'all' && r.region !== region.value) return false
    if (location.value && !locationName(r).toLowerCase().includes(location.value.trim().toLowerCase())) return false
    if (search.value && !pokemonName(r).toLowerCase().includes(search.value.trim().toLowerCase())) return false

    if (timeOfDay.value === 'allday') {
      if (r.rarity.morning === '--' || r.rarity.day === '--' || r.rarity.night === '--') return false
    } else if (timeOfDay.value !== 'all') {
      if (r.rarity[timeOfDay.value] === '--') return false
    }

    if (mode.value === 'hordes' && guaranteedOnly.value) {
      const target = guaranteedValue(r.encounterType)
      const fields: TimeOfDay[] = timeOfDay.value === 'all' || timeOfDay.value === 'allday'
        ? ['morning', 'day', 'night']
        : [timeOfDay.value]
      if (!fields.some(f => r.rarity[f] === target)) return false
    }

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

      // Encounter type (and horde size, when relevant) are part of the entry key:
      // the same pokemon can appear in the same zone through several distinct
      // methods at once (e.g. Cave AND Water in a cavern with a lake), each
      // with its own rarity/levels.
      const entryKey = `${r.pokemonId}__${r.hordeSize ?? 'none'}__${r.encounterType}`
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
    timeOfDay.value = 'all'
    guaranteedOnly.value = false
  }

  // Other pokemon sharing the exact same slot (zone + encounter type + horde
  // size + season) as `entry` — i.e. what else you might run into alongside it.
  // Looks up the full, unfiltered dataset so active UI filters don't hide siblings.
  function siblingsFor(zone: Zone, entry: ZoneEntry, seasonValue: Season, timeOfDay: TimeOfDay): Sibling[] {
    const key = `${zone.region}|${zone.locationKey}|${entry.encounterType}|${entry.hordeSize ?? 'none'}|${seasonValue}`
    const members = buildSlotIndex(mode.value, locale.value, records.value).get(key)
    if (!members) return []

    return members
      .filter(m => m.pokemonId !== entry.pokemonId)
      .map(m => ({ pokemonId: m.pokemonId, pokemonName: m.pokemonName, rate: m.rarity[timeOfDay] }))
      .sort((a, b) => a.pokemonName.localeCompare(b.pokemonName))
  }

  return {
    mode,
    setMode,
    loading,
    ensureLoaded,
    hordeSize,
    season,
    region,
    location,
    locationOptions,
    search,
    timeOfDay,
    guaranteedOnly,
    zones,
    visibleZones,
    hasMoreZones,
    loadMoreZones,
    resultCount,
    resetFilters,
    siblingsFor,
  }
}
