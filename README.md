# PokeMMO Shiny Dex

A tool to find shiny-farmable Pokémon hordes in [PokeMMO](https://pokemmo.com/), filterable by horde size, season, region and location, and grouped by zone so you can see everything catchable in one spot at a glance.

🔗 [github.com/virgill-e/PokeMMO-Shiny-Dex](https://github.com/virgill-e/PokeMMO-Shiny-Dex)

## Features

- **Filters**: horde size (x3 / x5), season, region, location (with autocomplete), Pokémon name
- **Zone view**: Pokémon grouped by location, with per-season encounter rates (morning / day / night) and the encounter method (Grass, Dark Grass, Water, Cave...)
- **Shared horde slots**: hover/tap a rarity value to see which other Pokémon share that exact spot, encounter type, horde size and season
- **Shiny sprite toggle**
- **French / English**, with the language choice remembered in your browser

## Data sources

- Encounter data (locations, seasons, horde flags, rarities) and French translations: extracted from [PokeMMO-Tools/pokemmo-hub](https://github.com/PokeMMO-Tools/pokemmo-hub) — see [`scripts/extract-data.py`](scripts/extract-data.py)
- Sprites: [PokeAPI](https://pokeapi.co/)

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
