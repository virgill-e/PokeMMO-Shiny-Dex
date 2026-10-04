import { SEASONS, estimatedExp } from '~/utils/types'
import type { EncounterRecord, EncounterMode, Season, HordeSize, Zone, ZoneEntry, TimeOfDay, Sibling, Rarity, EvStat, SortOption } from '~/utils/types'
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
  const { isFavorite } = useFavorites()

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
    evStat.value = 'all'
    guaranteedOnly.value = false
    visibleCount.value = PAGE_SIZE
    await ensureLoaded(next)
  }

  const hordeSize = useState<'all' | HordeSize>('filter-horde-size', () => 'all')
  const season = useState<'all' | Season>('filter-season', () => 'all')
  const region = useState<'all' | string>('filter-region', () => 'all')
  const location = useState('filter-location', () => '')
  const search = useState('filter-search', () => '')
  const pokemonType = useState<'all' | string>('filter-type', () => 'all')
  const ability = useState<'all' | string>('filter-ability', () => 'all')
  const evStat = useState<'all' | EvStat>('filter-ev-stat', () => 'all')
  const timeOfDay = useState<TimeOfDayFilter>('filter-time-of-day', () => 'all')
  const guaranteedOnly = useState('filter-guaranteed-only', () => false)
  const favoritesOnly = useState('filter-favorites-only', () => false)
  const sortBy = useState<SortOption>('sort-by', () => 'zone')
  const visibleCount = useState('visible-zone-count', () => PAGE_SIZE)

  // A localized location search is meaningless once the language changes.
  watch(locale, () => { location.value = '' })

  // Any change of query should start back from the top of the results.
  watch([hordeSize, season, region, location, search, pokemonType, ability, evStat, timeOfDay, guaranteedOnly, favoritesOnly, sortBy], () => { visibleCount.value = PAGE_SIZE })

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

  const abilityOptions = computed(() => {
    const names = new Set<string>()
    for (const r of records.value) {
      for (const a of r.abilities) names.add(a)
      if (r.hiddenAbility) names.add(r.hiddenAbility)
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  })

  const filtered = computed(() => records.value.filter((r) => {
    if (mode.value === 'hordes' && hordeSize.value !== 'all' && r.hordeSize !== hordeSize.value) return false
    if (season.value !== 'all' && r.season !== season.value) return false
    if (region.value !== 'all' && r.region !== region.value) return false
    if (location.value && !locationName(r).toLowerCase().includes(location.value.trim().toLowerCase())) return false
    if (search.value && !pokemonName(r).toLowerCase().includes(search.value.trim().toLowerCase())) return false
    if (pokemonType.value !== 'all' && !r.types.includes(pokemonType.value)) return false
    if (ability.value !== 'all' && !r.abilities.includes(ability.value) && r.hiddenAbility !== ability.value) return false
    if (mode.value === 'hordes' && evStat.value !== 'all' && !r.evYields.some(y => y.stat === evStat.value)) return false

    if (timeOfDay.value === 'allday') {
      if (r.rarity.morning === '--' || r.rarity.day === '--' || r.rarity.night === '--') return false
    } else if (timeOfDay.value !== 'all') {
      if (r.rarity[timeOfDay.value] === '--') return false
    }

    if (mode.value === 'hordes' && guaranteedOnly.value) {
      const target = guaranteedValue(r.encounterType)
      if (timeOfDay.value === 'allday') {
        // "Toute la journée" + "Garanti" = guaranteed at every time of day, not just one.
        if (r.rarity.morning !== target || r.rarity.day !== target || r.rarity.night !== target) return false
      } else if (timeOfDay.value === 'all') {
        if (!(r.rarity.morning === target || r.rarity.day === target || r.rarity.night === target)) return false
      } else {
        if (r.rarity[timeOfDay.value] !== target) return false
      }
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
          abilities: r.abilities,
          hiddenAbility: r.hiddenAbility,
          evYields: r.evYields,
          baseExp: r.baseExp,
          hordeSize: r.hordeSize,
          encounterType: r.encounterType,
          seasonRarities: [],
          minLevel: r.minLevel,
          maxLevel: r.maxLevel,
          expEstimate: 0,
        })
      }
      const entry = zone.entries.get(entryKey)!
      if (!entry.seasonRarities.some(sr => sr.season === r.season)) {
        entry.seasonRarities.push({ season: r.season, rarity: r.rarity })
      }
      entry.minLevel = Math.min(entry.minLevel, r.minLevel)
      entry.maxLevel = Math.max(entry.maxLevel, r.maxLevel)
    }

    const byName = (a: ZoneEntry, b: ZoneEntry) => a.pokemonName.localeCompare(b.pokemonName) || a.encounterType.localeCompare(b.encounterType)
    const byZone = (a: Zone, b: Zone) => a.region.localeCompare(b.region) || a.location.localeCompare(b.location)

    // Entries inside a zone follow the chosen criterion too, so the best
    // (or worst) encounter of each zone is the first line of its card.
    const entryCompare: Record<SortOption, (a: ZoneEntry, b: ZoneEntry) => number> = {
      zone: byName,
      expDesc: (a, b) => b.expEstimate - a.expEstimate || byName(a, b),
      expAsc: (a, b) => a.expEstimate - b.expEstimate || byName(a, b),
      levelDesc: (a, b) => b.maxLevel - a.maxLevel || byName(a, b),
      levelAsc: (a, b) => a.minLevel - b.minLevel || byName(a, b),
    }
    // A zone is ranked by its best entry for the chosen criterion (its first
    // entry once sorted), e.g. the highest-EXP encounter for "EXP (highest)".
    const zoneCompare: Record<SortOption, (a: Zone, b: Zone) => number> = {
      zone: byZone,
      expDesc: (a, b) => b.entries[0]!.expEstimate - a.entries[0]!.expEstimate || byZone(a, b),
      expAsc: (a, b) => a.entries[0]!.expEstimate - b.entries[0]!.expEstimate || byZone(a, b),
      levelDesc: (a, b) => b.entries[0]!.maxLevel - a.entries[0]!.maxLevel || byZone(a, b),
      levelAsc: (a, b) => a.entries[0]!.minLevel - b.entries[0]!.minLevel || byZone(a, b),
    }

    let result = [...zoneMap.values()]
      .map(z => ({
        region: z.region,
        location: z.location,
        locationKey: z.locationKey,
        entries: [...z.entries.values()]
          .map(e => ({
            ...e,
            seasonRarities: [...e.seasonRarities].sort((a, b) => SEASONS.indexOf(a.season) - SEASONS.indexOf(b.season)),
            expEstimate: estimatedExp(e.baseExp, e.minLevel, e.maxLevel, e.hordeSize),
          }))
          .sort(entryCompare[sortBy.value]),
      }))
      .sort(zoneCompare[sortBy.value])

    if (favoritesOnly.value) {
      result = result.filter(z => isFavorite(z.region, z.locationKey))
    }

    return result
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
    pokemonType.value = 'all'
    ability.value = 'all'
    evStat.value = 'all'
    timeOfDay.value = 'all'
    guaranteedOnly.value = false
    favoritesOnly.value = false
    sortBy.value = 'zone'
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
    pokemonType,
    ability,
    abilityOptions,
    evStat,
    timeOfDay,
    guaranteedOnly,
    favoritesOnly,
    sortBy,
    zones,
    visibleZones,
    hasMoreZones,
    loadMoreZones,
    resultCount,
    resetFilters,
    siblingsFor,
  }
}
