#!/usr/bin/env python3
import json
from pathlib import Path
claims_dir = Path("claims")
ver_dir = Path("verification")
out = []
for cf in sorted(claims_dir.glob("*.json")):
    c = json.load(open(cf,"r",encoding="utf-8"))
    claim_id = c.get("claim_id")
    ver_file = ver_dir / f"{claim_id}_evidence.json"
    ver = json.load(open(ver_file,"r",encoding="utf-8")) if ver_file.exists() else {}
    out.append({
        "claim_id": claim_id,
        "company_id": c.get("company_id"),
        "metric": c.get("metric"),
        "numeric_value": c.get("numeric_value"),
        "unit": c.get("unit"),
        "confidence": c.get("confidence"),
        "final_verdict": ver.get("final_verdict"),
        "support_score": ver.get("support_score"),
        "contradict_score": ver.get("contradict_score"),
        "top_evidence_count": len(ver.get("top_evidence", []))
    })
with open("claims_index.json","w",encoding="utf-8") as fw:
    json.dump(out, fw, indent=2, ensure_ascii=False)
print("Wrote claims_index.json with", len(out), "records.")
