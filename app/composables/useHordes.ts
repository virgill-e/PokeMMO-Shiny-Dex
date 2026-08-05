import rawHordes from '~/data/hordes.json'
import type { HordeRecord, Season, HordeSize, Zone, ZoneEntry } from '~/utils/types'

const records = rawHordes as HordeRecord[]

export const REGIONS = [...new Set(records.map(r => r.region))].sort()

export function useHordes() {
  const hordeSize = useState<'all' | HordeSize>('filter-horde-size', () => 'all')
  const season = useState<'all' | Season>('filter-season', () => 'all')
  const region = useState<'all' | string>('filter-region', () => 'all')
  const search = useState('filter-search', () => '')

  const filtered = computed(() => records.filter((r) => {
    if (hordeSize.value !== 'all' && r.hordeSize !== hordeSize.value) return false
    if (season.value !== 'all' && r.season !== season.value) return false
    if (region.value !== 'all' && r.region !== region.value) return false
    if (search.value && !r.pokemonName.toLowerCase().includes(search.value.trim().toLowerCase())) return false
    return true
  }))

  const zones = computed<Zone[]>(() => {
    const zoneMap = new Map<string, { region: string, location: string, entries: Map<string, ZoneEntry> }>()

    for (const r of filtered.value) {
      const zoneKey = `${r.region}__${r.location}`
      if (!zoneMap.has(zoneKey)) {
        zoneMap.set(zoneKey, { region: r.region, location: r.location, entries: new Map() })
      }
      const zone = zoneMap.get(zoneKey)!

      const entryKey = `${r.pokemonId}__${r.hordeSize}`
      if (!zone.entries.has(entryKey)) {
        zone.entries.set(entryKey, {
          pokemonId: r.pokemonId,
          pokemonName: r.pokemonName,
          types: r.types,
          hordeSize: r.hordeSize,
          seasons: [],
          minLevel: r.minLevel,
          maxLevel: r.maxLevel,
          rarity: r.rarity,
        })
      }
      const entry = zone.entries.get(entryKey)!
      if (!entry.seasons.includes(r.season)) entry.seasons.push(r.season)
      entry.minLevel = Math.min(entry.minLevel, r.minLevel)
      entry.maxLevel = Math.max(entry.maxLevel, r.maxLevel)
    }

    return [...zoneMap.values()]
      .map(z => ({
        region: z.region,
        location: z.location,
        entries: [...z.entries.values()].sort((a, b) => a.pokemonName.localeCompare(b.pokemonName)),
      }))
      .sort((a, b) => a.region.localeCompare(b.region) || a.location.localeCompare(b.location))
  })

  const resultCount = computed(() => filtered.value.length)

  function resetFilters() {
    hordeSize.value = 'all'
    season.value = 'all'
    region.value = 'all'
    search.value = ''
  }

  return { hordeSize, season, region, search, zones, resultCount, resetFilters }
}
