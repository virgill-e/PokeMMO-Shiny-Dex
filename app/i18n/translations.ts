export type Locale = 'fr' | 'en'

export const LOCALES: Locale[] = ['fr', 'en']

export const REGION_LABELS: Record<Locale, Record<string, string>> = {
  fr: { Kanto: 'Kanto', Johto: 'Johto', Hoenn: 'Hoenn', Sinnoh: 'Sinnoh', Unova: 'Unys' },
  en: { Kanto: 'Kanto', Johto: 'Johto', Hoenn: 'Hoenn', Sinnoh: 'Sinnoh', Unova: 'Unova' },
}

export const SEASON_LABELS: Record<Locale, Record<string, string>> = {
  fr: { Spring: '🌸 Printemps', Summer: '☀️ Été', Autumn: '🍂 Automne', Winter: '❄️ Hiver' },
  en: { Spring: '🌸 Spring', Summer: '☀️ Summer', Autumn: '🍂 Autumn', Winter: '❄️ Winter' },
}

export const SEASON_ICONS: Record<string, string> = {
  Spring: '🌸',
  Summer: '☀️',
  Autumn: '🍂',
  Winter: '❄️',
}

export const UI_TEXT: Record<Locale, Record<string, string>> = {
  fr: {
    appTitle: 'PokeMMO — Farm de hordes',
    appSubtitle: 'Filtre les hordes par taille, saison et zone pour préparer ta chasse aux shiny.',
    labelHorde: 'Horde',
    labelSeason: 'Saison',
    labelRegion: 'Région',
    labelLocation: 'Lieu',
    labelPokemon: 'Pokémon',
    all: 'Toutes',
    horde3: 'Horde x3',
    horde5: 'Horde x5',
    locationPlaceholder: 'Nom du lieu...',
    pokemonPlaceholder: 'Nom...',
    shinyToggle: '✨ Sprites shiny',
    reset: 'Réinitialiser',
    noResults: 'Aucune horde ne correspond à ces filtres.',
    levelPrefix: 'Nv.',
    rarityTooltip: 'Taux de rencontre : Matin / Jour / Nuit',
    rarityMorning: 'Mat.',
    rarityDay: 'Jour',
    rarityNight: 'Nuit',
    footerData: 'Données de rencontre :',
    footerSprites: 'Sprites :',
    footerContact: 'Un problème avec ce site ? Contactez-moi sur',
  },
  en: {
    appTitle: 'PokeMMO — Horde Farming',
    appSubtitle: 'Filter hordes by size, season and zone to plan your shiny hunt.',
    labelHorde: 'Horde',
    labelSeason: 'Season',
    labelRegion: 'Region',
    labelLocation: 'Location',
    labelPokemon: 'Pokémon',
    all: 'All',
    horde3: 'Horde x3',
    horde5: 'Horde x5',
    locationPlaceholder: 'Location name...',
    pokemonPlaceholder: 'Name...',
    shinyToggle: '✨ Shiny sprites',
    reset: 'Reset',
    noResults: 'No horde matches these filters.',
    levelPrefix: 'Lvl.',
    rarityTooltip: 'Encounter rate: Morning / Day / Night',
    rarityMorning: 'Morn.',
    rarityDay: 'Day',
    rarityNight: 'Night',
    footerData: 'Encounter data:',
    footerSprites: 'Sprites:',
    footerContact: 'Found an issue with this site? Contact me at',
  },
}

export function resultCountLabel(locale: Locale, count: number) {
  return locale === 'fr' ? `${count} rencontre(s)` : `${count} encounter(s)`
}
