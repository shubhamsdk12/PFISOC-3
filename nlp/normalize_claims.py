#!/usr/bin/env python3
"""
nlp/normalize_claims.py

Normalizes existing claim JSONs:
  - fills missing `unit` if '%' present in claim_text
  - standardizes units using mappings/metrics_map.json
  - remaps metric keywords if possible
  - writes cleaned claim files back to ./claims/
  - makes backup copies under ./claims_backup/

Usage:
  python nlp/normalize_claims.py
"""

import json
import shutil
from pathlib import Path
import re

MAPPINGS_PATH = Path("mappings/metrics_map.json")
CLAIMS_DIR = Path("claims")
BACKUP_DIR = Path("claims_backup")
BACKUP_DIR.mkdir(exist_ok=True)

def load_json(p):
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

def normalize_unit(unit_raw, units_map):
    if not unit_raw:
        return None
    return units_map.get(unit_raw.lower().strip(), unit_raw.lower().strip())

def infer_unit_from_text(text):
    """Guess missing unit from text content."""
    if "%" in text or "percent" in text.lower():
        return "percent"
    if "tco2e" in text.lower():
        return "tonnes_co2e"
    if "tonne" in text.lower() or "tons" in text.lower():
        return "tonnes"
    if "kg" in text.lower():
        return "kg"
    return None

def map_metric_from_text(text, metric_aliases):
    txt = text.lower()
    for metric, aliases in metric_aliases.items():
        for a in aliases:
            if a in txt:
                return metric
    return None

def main():
    mappings = load_json(MAPPINGS_PATH)
    units_map = mappings.get("units", {})
    metric_aliases = mappings.get("metric_aliases", {})

    claim_files = sorted(list(CLAIMS_DIR.glob("*.json")))
    print(f"Found {len(claim_files)} claim files to normalize.")

    updated = 0
    for cf in claim_files:
        data = json.load(open(cf, "r", encoding="utf-8"))
        changed = False

        # Backup original
        shutil.copy2(cf, BACKUP_DIR / cf.name)

        # 1. Fill missing unit
        if not data.get("unit"):
            inferred = infer_unit_from_text(data.get("claim_text", ""))
            if inferred:
                data["unit"] = normalize_unit(inferred, units_map)
                changed = True

        # 2. Normalize unit if present
        if data.get("unit"):
            newu = normalize_unit(data["unit"], units_map)
            if newu != data["unit"]:
                data["unit"] = newu
                changed = True

        # 3. Map metric again (in case ontology improved)
        if data.get("metric") in (None, "unknown", ""):
            mapped_metric = map_metric_from_text(data.get("claim_text", ""), metric_aliases)
            if mapped_metric:
                data["metric"] = mapped_metric
                changed = True

        if changed:
            json.dump(data, open(cf, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
            updated += 1

    print(f"Normalization complete. Updated {updated}/{len(claim_files)} claim files.")
    print(f"Backups stored in {BACKUP_DIR.resolve()}")

if __name__ == "__main__":
    main()
