import rawHordes from '~/data/hordes.json'
import { SEASONS } from '~/utils/types'
import type { HordeRecord, Season, HordeSize, Zone, ZoneEntry } from '~/utils/types'

const records = rawHordes as HordeRecord[]

export function useHordes() {
  const { locale } = useLocale()

  const hordeSize = useState<'all' | HordeSize>('filter-horde-size', () => 'all')
  const season = useState<'all' | Season>('filter-season', () => 'all')
  const region = useState<'all' | string>('filter-region', () => 'all')
  const location = useState('filter-location', () => '')
  const search = useState('filter-search', () => '')

  // A localized location search is meaningless once the language changes.
  watch(locale, () => { location.value = '' })

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
    const zoneMap = new Map<string, { region: string, location: string, entries: Map<string, ZoneEntry> }>()

    for (const r of filtered.value) {
      const zoneKey = `${r.region}__${r.location}`
      if (!zoneMap.has(zoneKey)) {
        zoneMap.set(zoneKey, { region: r.region, location: locationName(r), entries: new Map() })
      }
      const zone = zoneMap.get(zoneKey)!

      const entryKey = `${r.pokemonId}__${r.hordeSize}`
      if (!zone.entries.has(entryKey)) {
        zone.entries.set(entryKey, {
          pokemonId: r.pokemonId,
          pokemonName: pokemonName(r),
          types: r.types,
          hordeSize: r.hordeSize,
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
        entries: [...z.entries.values()]
          .map(e => ({
            ...e,
            seasonRarities: [...e.seasonRarities].sort((a, b) => SEASONS.indexOf(a.season) - SEASONS.indexOf(b.season)),
          }))
          .sort((a, b) => a.pokemonName.localeCompare(b.pokemonName)),
      }))
      .sort((a, b) => a.region.localeCompare(b.region) || a.location.localeCompare(b.location))
  })

  const resultCount = computed(() => filtered.value.length)

  function resetFilters() {
    hordeSize.value = 'all'
    season.value = 'all'
    region.value = 'all'
    location.value = ''
    search.value = ''
  }

  return { hordeSize, season, region, location, locationOptions, search, zones, resultCount, resetFilters }
}
