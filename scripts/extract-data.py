#!/usr/bin/env python3
"""
Extracts horde encounter data from the PokeMMO-Tools/pokemmo-hub repository
into a small JSON file consumed by the Nuxt app.

Source: https://github.com/PokeMMO-Tools/pokemmo-hub
  - src/data/pokemmo/monster.json (per-pokemon encounter locations, incl. season + horde flags)

Re-run this script whenever pokemmo-hub updates its data:
  python3 scripts/extract-data.py
"""
import json
import urllib.request
from pathlib import Path

MONSTER_JSON_URL = (
    "https://raw.githubusercontent.com/PokeMMO-Tools/pokemmo-hub/main/"
    "src/data/pokemmo/monster.json"
)
OUTPUT_PATH = Path(__file__).parent.parent / "app" / "data" / "hordes.json"


def fetch_monsters():
    with urllib.request.urlopen(MONSTER_JSON_URL) as resp:
        return json.load(resp)


def extract_hordes(monsters):
    records = []
    for mon in monsters:
        types = list(dict.fromkeys(mon.get("types", [])))  # dedupe, keep order
        for loc in mon.get("locations", []):
            size = 5 if loc.get("is_horde_5x") else 3 if loc.get("is_horde_3x") else None
            if size is None:
                continue
            records.append({
                "pokemonId": mon["id"],
                "pokemonName": mon["name"],
                "types": types,
                "region": loc.get("region_name"),
                "location": loc.get("location_name_full") or loc.get("location_name"),
                "season": loc.get("season") or "Any",
                "hordeSize": size,
                "encounterType": loc.get("type"),
                "minLevel": loc.get("min_level"),
                "maxLevel": loc.get("max_level"),
                "rarity": {
                    "morning": loc.get("rarity_morning"),
                    "day": loc.get("rarity_day"),
                    "night": loc.get("rarity_night"),
                },
            })
    return records


def main():
    monsters = fetch_monsters()
    records = extract_hordes(monsters)
    records.sort(key=lambda r: (r["region"], r["location"], r["pokemonName"]))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(records, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} horde encounter records to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
