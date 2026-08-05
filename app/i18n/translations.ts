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

export const ENCOUNTER_TYPE_LABELS: Record<Locale, Record<string, string>> = {
  fr: {
    Grass: 'Herbe',
    'Dark Grass': 'Herbe Mouvante',
    Water: 'Eau',
    Cave: 'Grotte',
    Inside: 'Intérieur',
    'Sweet Scent': 'Odeur Suave',
    'Old Rod': 'Vieille Canne',
    'Good Rod': 'Super Canne',
    'Super Rod': 'Méga Canne',
    Rocks: 'Rochers',
    Headbutt: 'Coup de Boule',
    Fishing: 'Pêche',
    Shadow: 'Ombre',
    'Dust Cloud': 'Nuage de Poussière',
    'Honey Tree': 'Arbre à Miel',
  },
  en: {
    Grass: 'Grass',
    'Dark Grass': 'Dark Grass',
    Water: 'Water',
    Cave: 'Cave',
    Inside: 'Inside',
    'Sweet Scent': 'Sweet Scent',
    'Old Rod': 'Old Rod',
    'Good Rod': 'Good Rod',
    'Super Rod': 'Super Rod',
    Rocks: 'Rocks',
    Headbutt: 'Headbutt',
    Fishing: 'Fishing',
    Shadow: 'Shadow',
    'Dust Cloud': 'Dust Cloud',
    'Honey Tree': 'Honey Tree',
  },
}

export const ENCOUNTER_TYPE_ICONS: Record<string, string> = {
  Grass: '🌿',
  'Dark Grass': '🌾',
  Water: '💧',
  Cave: '🪨',
  Inside: '🏠',
  'Sweet Scent': '🌬️',
  'Old Rod': '🎣',
  'Good Rod': '🎣',
  'Super Rod': '🎣',
  Rocks: '⛰️',
  Headbutt: '🌳',
  Fishing: '🎣',
  Shadow: '🌑',
  'Dust Cloud': '💨',
  'Honey Tree': '🍯',
}

export const UI_TEXT: Record<Locale, Record<string, string>> = {
  fr: {
    appTitle: 'PokeMMO — Shiny Dex',
    appSubtitle: 'Filtre les rencontres par saison et zone pour préparer ta chasse aux shiny.',
    modeHordes: 'Hordes',
    modeHordesHint: 'Groupes de 3 ou 5 Pokémon identiques',
    modeSingles: 'Rencontres uniques',
    modeSinglesHint: 'Pokémon sauvages classiques, un par un',
    loading: 'Chargement des données...',
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
    noResults: 'Aucune rencontre ne correspond à ces filtres.',
    levelPrefix: 'Nv.',
    rarityMorning: 'Mat.',
    rarityDay: 'Jour',
    rarityNight: 'Nuit',
    alsoHere: 'Aussi rencontrable ici :',
    loadMore: 'Charger plus de zones',
    footerData: 'Données de rencontre :',
    footerSprites: 'Sprites :',
    footerContact: 'Un problème avec ce site ? Contactez-moi sur',
  },
  en: {
    appTitle: 'PokeMMO — Shiny Dex',
    appSubtitle: 'Filter encounters by season and zone to plan your shiny hunt.',
    modeHordes: 'Hordes',
    modeHordesHint: 'Groups of 3 or 5 identical Pokémon',
    modeSingles: 'Single encounters',
    modeSinglesHint: 'Regular one-by-one wild encounters',
    loading: 'Loading data...',
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
    noResults: 'No encounter matches these filters.',
    levelPrefix: 'Lvl.',
    rarityMorning: 'Morn.',
    rarityDay: 'Day',
    rarityNight: 'Night',
    alsoHere: 'Also found here:',
    loadMore: 'Load more zones',
    footerData: 'Encounter data:',
    footerSprites: 'Sprites:',
    footerContact: 'Found an issue with this site? Contact me at',
  },
}

export function resultCountLabel(locale: Locale, count: number) {
  return locale === 'fr' ? `${count} rencontre(s)` : `${count} encounter(s)`
}
