export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const
export type Season = typeof SEASONS[number]

export type HordeSize = 3 | 5

export interface Rarity {
  morning: string
  day: string
  night: string
}

export interface HordeRecord {
  pokemonId: number
  pokemonName: string
  types: string[]
  region: string
  location: string
  season: Season
  hordeSize: HordeSize
  encounterType: string
  minLevel: number
  maxLevel: number
  rarity: Rarity
}

export interface ZoneEntry {
  pokemonId: number
  pokemonName: string
  types: string[]
  hordeSize: HordeSize
  seasons: Season[]
  minLevel: number
  maxLevel: number
  rarity: Rarity
}

export interface Zone {
  region: string
  location: string
  entries: ZoneEntry[]
}

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
