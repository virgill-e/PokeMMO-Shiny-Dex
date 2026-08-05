export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const
export type Season = typeof SEASONS[number]

export type HordeSize = 3 | 5

export interface Rarity {
  morning: string
  day: string
  night: string
}

export type EncounterMode = 'hordes' | 'singles'

// hordeSize is only present on records from hordes.json; singles.json records
// don't have it at all (regular wild encounters aren't hordes).
export interface EncounterRecord {
  pokemonId: number
  pokemonName: string
  pokemonNameFr: string
  types: string[]
  region: string
  location: string
  locationFr: string
  season: Season
  hordeSize?: HordeSize
  encounterType: string
  minLevel: number
  maxLevel: number
  rarity: Rarity
}

export interface SeasonRarity {
  season: Season
  rarity: Rarity
}

export interface ZoneEntry {
  pokemonId: number
  pokemonName: string
  types: string[]
  hordeSize?: HordeSize
  encounterType: string
  seasonRarities: SeasonRarity[]
  minLevel: number
  maxLevel: number
}

export interface Zone {
  region: string
  location: string
  locationKey: string
  entries: ZoneEntry[]
}

export type TimeOfDay = 'morning' | 'day' | 'night'

export interface Sibling {
  pokemonId: number
  pokemonName: string
  rate: string
}

// Region keys are the canonical (English) names used throughout the data.
// Fixed display order, independent of locale.
export const REGIONS = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova'] as const

export const TYPE_COLORS: Record<string, string> = {
  NORMAL: 'bg-neutral-400',
  FIRE: 'bg-orange-500',
  WATER: 'bg-blue-500',
  ELECTRIC: 'bg-yellow-400 text-neutral-900',
  GRASS: 'bg-green-500',
  ICE: 'bg-cyan-300 text-neutral-900',
  FIGHTING: 'bg-red-700',
  POISON: 'bg-purple-500',
  GROUND: 'bg-amber-600',
  FLYING: 'bg-indigo-300 text-neutral-900',
  PSYCHIC: 'bg-pink-500',
  BUG: 'bg-lime-500 text-neutral-900',
  ROCK: 'bg-yellow-700',
  GHOST: 'bg-violet-700',
  DRAGON: 'bg-indigo-600',
  DARK: 'bg-neutral-700',
  STEEL: 'bg-slate-400 text-neutral-900',
  FAIRY: 'bg-pink-300 text-neutral-900',
}

export function spriteUrl(pokemonId: number, shiny: boolean) {
  const variant = shiny ? 'shiny/' : ''
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${variant}${pokemonId}.png`
}
