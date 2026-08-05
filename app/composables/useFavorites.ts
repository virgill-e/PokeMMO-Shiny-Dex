import type { EncounterMode } from '~/utils/types'

const STORAGE_KEY = 'pokemmo-shiny-dex:favorites'

// A favorite identifies a zone (region + canonical location) within one
// encounter mode: the same location can be favorited in hordes without being
// favorited in singles, and vice versa. Independent of locale.
function zoneKey(mode: EncounterMode, region: string, locationKey: string) {
  return `${mode}__${region}__${locationKey}`
}

export function useFavorites() {
  const mode = useState<EncounterMode>('encounter-mode', () => 'hordes')
  const favorites = useState<string[]>('favorite-zones', () => [])

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) favorites.value = parsed
    } catch {
      // malformed storage: ignore and keep defaults
    }
  })

  function isFavorite(region: string, locationKey: string) {
    return favorites.value.includes(zoneKey(mode.value, region, locationKey))
  }

  function toggleFavorite(region: string, locationKey: string) {
    const key = zoneKey(mode.value, region, locationKey)
    favorites.value = favorites.value.includes(key)
      ? favorites.value.filter(k => k !== key)
      : [...favorites.value, key]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
  }

  return { favorites, isFavorite, toggleFavorite }
}
