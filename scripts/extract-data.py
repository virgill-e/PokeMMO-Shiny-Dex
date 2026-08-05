#!/usr/bin/env python3
"""
Extracts horde encounter data from the PokeMMO-Tools/pokemmo-hub repository
into a small JSON file consumed by the Nuxt app.

Source: https://github.com/PokeMMO-Tools/pokemmo-hub
  - src/data/pokemmo/monster.json (per-pokemon encounter locations, incl. season + horde flags)
  - src/locales/fr-FR/monster.json (French pokemon names)
  - src/locales/fr-FR/locations.json (French location names)

Re-run this script whenever pokemmo-hub updates its data:
  python3 scripts/extract-data.py
"""
import json
import re
import urllib.request
from pathlib import Path

BASE_URL = "https://raw.githubusercontent.com/PokeMMO-Tools/pokemmo-hub/main"
MONSTER_JSON_URL = f"{BASE_URL}/src/data/pokemmo/monster.json"
FR_MONSTER_URL = f"{BASE_URL}/src/locales/fr-FR/monster.json"
FR_LOCATIONS_URL = f"{BASE_URL}/src/locales/fr-FR/locations.json"

OUTPUT_PATH = Path(__file__).parent.parent / "app" / "data" / "hordes.json"

# Location suffixes (the "(...)" part of e.g. "Dragonspiral Tower (Outside)") aren't
# covered by pokemmo-hub's French locations file, which only translates the base name.
# Translated by hand from the full list of distinct suffixes found in monster.json.
SUFFIX_TRANSLATIONS_FR = {
    "1F": "1F", "2F": "2F", "3F": "3F", "4F": "4F", "5F": "5F", "6F": "6F",
    "7F": "7F", "8F": "8F", "9F": "9F", "10F": "10F",
    "B1F": "B1F", "B2F": "B2F", "B3F": "B3F", "B4F": "B4F", "B5F": "B5F", "B6F": "B6F",
    "1F East": "1F Est", "1F North": "1F Nord", "1F West": "1F Ouest",
    "4F North": "4F Nord", "4F South": "4F Sud",
    "B1F East": "B1F Est", "B1F West": "B1F Ouest",
    "B2F East": "B2F Est", "B2F West": "B2F Ouest",
    "B3F West": "B3F Ouest",
    "Tower 1F": "Tour 1F", "Tower 2F": "Tour 2F", "Tower 3F": "Tour 3F",
    "Tower 4F": "Tour 4F", "Tower 5F": "Tour 5F",
    "Area 1": "Zone 1", "Area 2": "Zone 2", "Area 3": "Zone 3",
    "Area 4": "Zone 4", "Area 5": "Zone 5", "Area 6": "Zone 6",
    "North Area": "Zone Nord", "South Area": "Zone Sud",
    "East Area": "Zone Est", "West Area": "Zone Ouest",
    "Northeast Area": "Zone Nord-Est", "Northwest Area": "Zone Nord-Ouest",
    "Southeast Area": "Zone Sud-Est", "Southwest Area": "Zone Sud-Ouest",
    "Center Area": "Zone Centrale",
    "North": "Nord", "South": "Sud", "East": "Est", "West": "Ouest",
    "Back Room": "Salle Arrière", "Cold Room": "Salle Froide",
    "Dining Room": "Salle à Manger", "Hidden Room": "Salle Cachée",
    "Northern Room": "Salle Nord", "Southern Room": "Salle Sud",
    "Northwest Room": "Salle Nord-Ouest",
    "Inner": "Intérieur", "Outer": "Extérieur",
    "Interior": "Intérieur", "Upper Interior": "Intérieur Supérieur", "Lower Interior": "Intérieur Inférieur",
    "Outside": "Extérieur", "Entrance": "Entrée", "Entryway": "Entrée",
    "Forest": "Forêt", "Gate": "Porte", "Center": "Centre", "Depths": "Profondeurs",
    "Mountainside": "Flanc de Montagne", "North Mountainside": "Flanc Nord",
    "South Mountainside": "Flanc Sud", "Upper Mountainside": "Flanc Supérieur",
    "Lower Mountainside": "Flanc Inférieur",
    "Rooftop": "Toit", "Summit": "Sommet", "Tunnel": "Tunnel", "Cave": "Grotte",
    "???": "???",
    "Route 124": "Route 124", "Route 126": "Route 126",
}

LOCATION_SUFFIX_RE = re.compile(r"^(.*?)\s*\((.+)\)\s*$")


def fetch_json(url):
    with urllib.request.urlopen(url) as resp:
        return json.load(resp)


def mojibake_variant(s):
    """pokemmo-hub's fr-FR json has some UTF-8-as-Latin-1 mangled keys
    (e.g. 'pokémon tower' -> 'pokã©mon tower'); try that form as a fallback."""
    try:
        return s.encode("utf-8").decode("latin1")
    except UnicodeError:
        return None


def translate(name, table):
    key = name.lower()
    if key in table:
        return table[key]
    mojibake = mojibake_variant(key)
    if mojibake and mojibake.lower() in table:
        return table[mojibake.lower()]
    return name


def translate_location(full_name, table):
    match = LOCATION_SUFFIX_RE.match(full_name)
    if not match:
        return translate(full_name, table)
    base, suffix = match.group(1), match.group(2)
    base_fr = translate(base, table)
    suffix_fr = SUFFIX_TRANSLATIONS_FR.get(suffix, suffix)
    return f"{base_fr} ({suffix_fr})"


def extract_hordes(monsters, fr_monster, fr_locations):
    records = []
    for mon in monsters:
        types = list(dict.fromkeys(mon.get("types", [])))  # dedupe, keep order
        name_fr = translate(mon["name"], fr_monster)
        for loc in mon.get("locations", []):
            size = 5 if loc.get("is_horde_5x") else 3 if loc.get("is_horde_3x") else None
            if size is None:
                continue
            location_en = loc.get("location_name_full") or loc.get("location_name")
            records.append({
                "pokemonId": mon["id"],
                "pokemonName": mon["name"],
                "pokemonNameFr": name_fr,
                "types": types,
                "region": loc.get("region_name"),
                "location": location_en,
                "locationFr": translate_location(location_en, fr_locations),
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
    monsters = fetch_json(MONSTER_JSON_URL)
    fr_monster = fetch_json(FR_MONSTER_URL)
    fr_locations = fetch_json(FR_LOCATIONS_URL)

    records = extract_hordes(monsters, fr_monster, fr_locations)
    records.sort(key=lambda r: (r["region"], r["location"], r["pokemonName"]))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(records, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} horde encounter records to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
