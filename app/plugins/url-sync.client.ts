import { SEASONS, REGIONS, POKEMON_TYPES } from '~/utils/types'
import type { Season, HordeSize } from '~/utils/types'
import type { TimeOfDayFilter } from '~/composables/useEncounters'

const TIME_OF_DAY_VALUES = ['allday', 'morning', 'day', 'night']

// Keeps the current search (mode + filters) reflected in the URL query string,
// so a link can be copy-pasted to reproduce the exact same result set. Runs
// client-only: restores from the URL once on load, then keeps it updated.
export default defineNuxtPlugin(() => {
  const {
    mode, hordeSize, season, region, location, search, pokemonType, timeOfDay, guaranteedOnly,
  } = useEncounters()

  const params = new URLSearchParams(window.location.search)

  const urlMode = params.get('mode')
  if (urlMode === 'hordes' || urlMode === 'singles') mode.value = urlMode

  const urlHorde = params.get('horde')
  if (urlHorde === '3' || urlHorde === '5') hordeSize.value = Number(urlHorde) as HordeSize

  const urlSeason = params.get('season')
  if (urlSeason && (SEASONS as readonly string[]).includes(urlSeason)) season.value = urlSeason as Season

  const urlRegion = params.get('region')
  if (urlRegion && (REGIONS as readonly string[]).includes(urlRegion)) region.value = urlRegion

  const urlType = params.get('type')
  if (urlType && (POKEMON_TYPES as readonly string[]).includes(urlType)) pokemonType.value = urlType

  const urlTime = params.get('time')
  if (urlTime && TIME_OF_DAY_VALUES.includes(urlTime)) timeOfDay.value = urlTime as TimeOfDayFilter

  if (params.get('guaranteed') === '1') guaranteedOnly.value = true

  const urlLocation = params.get('location')
  if (urlLocation) location.value = urlLocation

  const urlPokemon = params.get('pokemon')
  if (urlPokemon) search.value = urlPokemon

  function syncUrl() {
    const next = new URLSearchParams()
    if (mode.value !== 'hordes') next.set('mode', mode.value)
    if (mode.value === 'hordes' && hordeSize.value !== 'all') next.set('horde', String(hordeSize.value))
    if (season.value !== 'all') next.set('season', season.value)
    if (region.value !== 'all') next.set('region', region.value)
    if (pokemonType.value !== 'all') next.set('type', pokemonType.value)
    if (timeOfDay.value !== 'all') next.set('time', timeOfDay.value)
    if (mode.value === 'hordes' && guaranteedOnly.value) next.set('guaranteed', '1')
    if (location.value) next.set('location', location.value)
    if (search.value) next.set('pokemon', search.value)

    const qs = next.toString()
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    history.replaceState(history.state, '', newUrl)
  }

  watch([mode, hordeSize, season, region, pokemonType, timeOfDay, guaranteedOnly, location, search], syncUrl)
})
