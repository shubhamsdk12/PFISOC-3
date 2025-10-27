#!/usr/bin/env python3
"""
nlp/claim_extractor.py

Reads: data/cleaned/snippets.jsonl
Writes: claims/{company_id}_claim{n}.json  (one file per claim)

Usage:
  python nlp/claim_extractor.py --snippets data/cleaned/snippets.jsonl --mappings mappings/metrics_map.json --ontology mappings/ontology_map.json --out_dir claims/

Notes:
- Requires spaCy en_core_web_sm installed.
- This is rule-first extractor (regex + light spaCy signals). It's intentionally conservative.
- Improvements: Prioritizes percent/unit-aware numeric extraction, and supports ontology aliases inside mappings file.
"""

import argparse
import json
import os
import re
import hashlib
from collections import defaultdict
from pathlib import Path

import spacy
nlp_spacy = spacy.load("en_core_web_sm")

# Default regex patterns for ESG-like claims (percentages, "net zero", renewables, emissions)
PATTERN_STRS = [
    r"(?:reduce|reduced|reducing|cut|cutting|decrease|decreased)\s+(?:.*?)(\d+(?:\.\d+)?)\s*(%|percent|percentage|pp)\b",
    r"(?:reduction of|reduced by)\s+(\d+(?:\.\d+)?)\s*(%|percent|percentage|pp)\b",
    r"net[-\s]?zero\s*(?:by|in)?\s*(\d{4})",
    r"(?:renewable|renewables|renewable energy).{0,40}(\d+(?:\.\d+)?)\s*(%|percent|percentage|pp)\b",
    r"(?:emissions|ghg|co2|co₂).{0,40}(\d+(?:\.\d+)?)\s*(t(?:onnes)?|tons?|tco2e|tonnes|kg|g|%|percent)?"
]
PATTERNS = [re.compile(p, re.I) for p in PATTERN_STRS]

# Priority numeric/unit regexes: percent first, then mass units, then any number
NUM_UNIT_RE_PRIORITY = [
    re.compile(r"(\d+(?:\.\d+)?)\s*(%|percent|percentage|pp)\b", re.I),
    re.compile(r"(\d+(?:\.\d+)?)\s*(tco2e|tonnes?|tons?|kg|g)\b", re.I),
    re.compile(r"(\d+(?:\.\d+)?)\b", re.I)
]


def load_jsonl(path):
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except Exception:
                continue


def id_from(seed: str, salt: str = ""):
    h = hashlib.sha1((seed + salt).encode("utf-8")).hexdigest()[:8]
    return h


def normalize_unit(raw_unit: str, units_map: dict):
    if not raw_unit:
        return None
    key = raw_unit.strip().lower()
    return units_map.get(key, key)


def load_json(p: str):
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def map_metric_from_text(text: str, ontology_map: dict):
    txt = text.lower()
    for metric, keys in ontology_map.items():
        for k in keys:
            if k in txt:
                return metric
    return None


def extract_numeric_and_unit(text: str):
    """
    Try percent/unit-aware regexes in priority order, then fallback to any number.
    Returns (value: float|None, unit_raw: str|None)
    """
    for pattern in NUM_UNIT_RE_PRIORITY:
        m = pattern.search(text)
        if m:
            try:
                val = float(m.group(1))
            except:
                continue
            unit = m.group(2) if len(m.groups()) >= 2 else None
            return val, (unit.lower() if unit else None)
    return None, None


def heuristic_confidence(doc, regex_matched: bool):
    conf = 0.25
    # if spaCy recognized PERCENT or CARDINAL boost
    ents = {ent.label_ for ent in doc.ents}
    if "PERCENT" in ents or "CARDINAL" in ents or "QUANTITY" in ents:
        conf += 0.35
    if regex_matched:
        conf += 0.35
    return min(conf, 0.99)


def extract_claims_from_snippet(snippet, metrics_map_obj, ontology_map_obj):
    """
    Returns list of claim dicts extracted from snippet.
    - metrics_map_obj: full mappings JSON (contains 'units' and maybe 'metric_aliases')
    - ontology_map_obj: explicit ontology mapping dict (optional)
    """
    text = snippet.get("text", "")
    doc = nlp_spacy(text)
    claims = []

    # Determine units map and ontology map
    units_map = metrics_map_obj.get("units", {}) if isinstance(metrics_map_obj, dict) else {}
    # ontology_map_obj may be provided separately; otherwise fall back to metric_aliases inside metrics_map_obj
    ontology_map = ontology_map_obj if ontology_map_obj else metrics_map_obj.get("metric_aliases", {})

    # Apply regex patterns
    matched_any = False
    for pat in PATTERNS:
        m = pat.search(text)
        if not m:
            continue
        matched_any = True
        # numeric extraction - prefer percent/unit-aware extractor
        num = None
        unit = None

        # first try prioritized extractor (percent first)
        parsed_val, parsed_unit = extract_numeric_and_unit(text)
        if parsed_val is not None:
            num = parsed_val
            unit = parsed_unit

        # fallback: try to pull numeric from regex groups if not captured yet
        if num is None and m.groups():
            for g in m.groups():
                if not g:
                    continue
                if re.match(r"^\d+(\.\d+)?$", str(g)):
                    try:
                        num = float(g)
                        break
                    except:
                        continue

        # map metric via ontology keywords
        metric = map_metric_from_text(text, ontology_map)

        # if claim contains "net zero" handle as year-based claim
        netzero = re.search(r"net[-\s]?zero\s*(?:by|in)?\s*(\d{4})", text, re.I)
        if netzero:
            metric = metric or "net_zero_commitment"
            try:
                num = int(netzero.group(1))
                unit = "year"
            except:
                pass

        # create claim dict
        claim = {
            "company_id": snippet.get("company_id"),
            "claim_text": text.strip(),
            "numeric_value": num,
            "unit": normalize_unit(unit, units_map) if unit else None,
            "metric": metric or "unknown",
            "baseline": None,
            "reporting_period": snippet.get("date"),
            "extracted_from": snippet.get("snippet_id"),
            "sources": [snippet.get("source_id")] if snippet.get("source_id") else [],
            # confidence will be set below
        }
        claim["confidence"] = heuristic_confidence(doc, regex_matched=True)
        # deterministic id
        claim_id = f"claim_{claim['company_id']}_{id_from(snippet.get('snippet_id',''), claim['metric'] or '')}"
        claim["claim_id"] = claim_id
        claims.append(claim)

    # fallback: short heuristic if no regex matched but contains keywords and numbers
    if not matched_any:
        text_l = text.lower()
        # determine ontology map fallback if not already set
        ontology_map = ontology_map if ontology_map else metrics_map_obj.get("metric_aliases", {})
        has_keyword = any(k in text_l for klist in ontology_map.values() for k in klist) if ontology_map else False
        parsed_val, parsed_unit = extract_numeric_and_unit(text)
        if has_keyword and parsed_val is not None:
            claim = {
                "company_id": snippet.get("company_id"),
                "claim_text": text.strip(),
                "numeric_value": parsed_val,
                "unit": normalize_unit(parsed_unit, units_map) if parsed_unit else None,
                "metric": map_metric_from_text(text, ontology_map) or "unknown",
                "baseline": None,
                "reporting_period": snippet.get("date"),
                "extracted_from": snippet.get("snippet_id"),
                "sources": [snippet.get("source_id")] if snippet.get("source_id") else [],
            }
            claim["confidence"] = heuristic_confidence(doc, regex_matched=False)
            claim_id = f"claim_{claim['company_id']}_{id_from(snippet.get('snippet_id',''), claim['metric'] or '')}"
            claim["claim_id"] = claim_id
            claims.append(claim)

    return claims


def main(args):
    snippets_path = Path(args.snippets)
    if not snippets_path.exists():
        raise FileNotFoundError(f"{snippets_path} not found.")
    # load mappings
    metrics_map = load_json(args.mappings) if args.mappings and Path(args.mappings).exists() else {}
    # load ontology if provided, else will fallback inside the extractor
    ontology_map = load_json(args.ontology) if args.ontology and Path(args.ontology).exists() else None

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # keep counts per company
    company_counts = defaultdict(int)

    for snippet in load_jsonl(str(snippets_path)):
        # sanity: require company_id and snippet_id
        if not snippet.get("company_id") or not snippet.get("snippet_id"):
            continue
        claims = extract_claims_from_snippet(snippet, metrics_map, ontology_map)
        for claim in claims:
            company = claim["company_id"]
            company_counts[company] += 1
            filename = out_dir / f"{company}_claim{company_counts[company]:03d}.json"
            with open(filename, "w", encoding="utf-8") as fw:
                json.dump(claim, fw, indent=2, ensure_ascii=False)

    print("Extraction finished. Claims per company:", dict(company_counts))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--snippets", required=True, help="Path to data/cleaned/snippets.jsonl")
    parser.add_argument("--mappings", default="mappings/metrics_map.json", help="unit/metric mapping JSON")
    parser.add_argument("--ontology", default="mappings/ontology_map.json", help="ontology keyword mapping JSON (optional)")
    parser.add_argument("--out_dir", default="claims", help="output claims directory")
    args = parser.parse_args()
    main(args)
