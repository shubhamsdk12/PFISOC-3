#!/usr/bin/env python3
"""
Quick sanity check: prints number of claims, and for the first claim prints its claim_text and top evidence (if any).
Usage:
  python scripts/check_sample_claim.py
"""
import json
from pathlib import Path
claims_dir = Path("claims")
ver_dir = Path("verification")

claim_files = sorted(list(claims_dir.glob("*.json")))
print("Number of claim files:", len(claim_files))
if not claim_files:
    print("No claims found.")
    exit(0)

sample = json.load(open(claim_files[0], "r", encoding="utf-8"))
print("\nSample claim_id:", sample.get("claim_id"))
print("Company:", sample.get("company_id"))
print("Metric:", sample.get("metric"))
print("Numeric:", sample.get("numeric_value"), sample.get("unit"))
print("Claim text (truncated):", sample.get("claim_text")[:400])

ver_file = ver_dir / f"{sample.get('claim_id')}_evidence.json"
if ver_file.exists():
    ver = json.load(open(ver_file, "r", encoding="utf-8"))
    print("\nTop evidence found:", len(ver.get("top_evidence", [])))
    for i, ev in enumerate(ver.get("top_evidence", [])[:5]):
        print(f"\nEvidence {i+1}: id={ev.get('snippet_id')}, label={ev.get('label')}, score={ev.get('score')}")
        print(ev.get("snippet_text")[:400])
else:
    print("\nNo verification file found for this claim yet. Run embed_matcher.py first.")
    