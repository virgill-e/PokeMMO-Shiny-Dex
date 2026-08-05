import rawHordes from '~/data/hordes.json'
import { SEASONS } from '~/utils/types'
import type { HordeRecord, Season, HordeSize, Zone, ZoneEntry, TimeOfDay, Sibling } from '~/utils/types'

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
    const seen = new Map<number, Sibling>()
    for (const r of records) {
      if (r.region !== zone.region || r.location !== zone.locationKey) continue
      if (r.encounterType !== entry.encounterType || r.hordeSize !== entry.hordeSize) continue
      if (r.season !== seasonValue || r.pokemonId === entry.pokemonId) continue
      if (seen.has(r.pokemonId)) continue
      seen.set(r.pokemonId, { pokemonId: r.pokemonId, pokemonName: pokemonName(r), rate: r.rarity[timeOfDay] })
    }
    return [...seen.values()].sort((a, b) => a.pokemonName.localeCompare(b.pokemonName))
  }

  return { hordeSize, season, region, location, locationOptions, search, zones, resultCount, resetFilters, siblingsFor }
}
