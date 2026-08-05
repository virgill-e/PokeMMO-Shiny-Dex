# PokeMMO Shiny Dex

A tool to find shiny-farmable Pokémon hordes in [PokeMMO](https://pokemmo.com/), filterable by horde size, season, region and location, and grouped by zone so you can see everything catchable in one spot at a glance.

🔗 [github.com/virgill-e/PokeMMO-Shiny-Dex](https://github.com/virgill-e/PokeMMO-Shiny-Dex)

🌐 [pokemmo.virgill-e.com](https://pokemmo.virgill-e.com/)

## Features

- **Two modes**: Hordes (groups of 3 or 5 identical Pokémon) and single encounters (regular one-by-one wild encounters)
- **Filters**: horde size (x3 / x5), season, region, Pokémon type, time of day (morning / day / night / all day), location (with autocomplete), Pokémon name, guaranteed-encounter only (hordes)
- **Favorites**: star a zone to pin it, and filter to favorites only — kept separately for hordes and single encounters, stored in your browser
- **Zone view**: Pokémon grouped by location, with per-season encounter rates (morning / day / night) and the encounter method (Grass, Dark Grass, Water, Cave...)
- **Shared horde slots**: hover/tap a rarity value to see which other Pokémon share that exact spot, encounter type, horde size and season
- **Shareable filters**: the current mode and filters are reflected in the URL
- **Shiny sprite toggle**
- **French / English**, with the language choice remembered in your browser

## Data sources

- Encounter data (locations, seasons, horde flags, rarities) and French translations: extracted from [PokeMMO-Tools/pokemmo-hub](https://github.com/PokeMMO-Tools/pokemmo-hub) — see [`scripts/extract-data.py`](scripts/extract-data.py)
- Sprites: [PokeAPI](https://pokeapi.co/)

If you have any concern about how this data is used here, contact me at [virgill-e.com](https://virgill-e.com/#contact).

## Tech stack

Nuxt 4, Vue 3, Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To refresh the encounter data from pokemmo-hub:

```bash
python3 scripts/extract-data.py
```

## Production

```bash
npm run build
node .output/server/index.mjs
```

A `Dockerfile` is included for container-based deployment (e.g. Dokploy).

## Credits

Built with [Claude Code](https://claude.com/claude-code).
