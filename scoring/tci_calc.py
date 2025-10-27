"""
TCI Calculator – aggregates claim verification results into per-pillar and total company scores.
"""

import json, os, glob
import numpy as np
from datetime import datetime

# Helper: load mapping metric→pillar
def load_metric_mapping(path="mappings/metrics_map.json"):
    if not os.path.exists(path):
        # fallback simple map
        return {"emissions": "E", "renewable": "E", "diversity": "S", "audit": "G"}
    with open(path) as f:
        return json.load(f)

def aggregate_company_scores(claims_dir, verif_dir, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    metric_map = load_metric_mapping()
    company_scores = {}

    for claim_path in glob.glob(os.path.join(claims_dir, "*.json")):
        claim = json.load(open(claim_path))
        cid = claim["company_id"]
        metric = claim.get("metric", "").lower()
        pillar = metric_map.get(metric, "E")

        verif_path = os.path.join(verif_dir, f"{claim['claim_id']}_evidence.json")
        if not os.path.exists(verif_path):
            continue
        verif = json.load(open(verif_path))
        support = verif.get("support_score", 0.0)
        contradict = verif.get("contradict_score", 0.0)
        consistency = support * (1 - contradict)

        company_scores.setdefault(cid, {"E": [], "S": [], "G": []})
        company_scores[cid][pillar].append(consistency)

    results = []
    for cid, pillars in company_scores.items():
        subscores = {p: round(np.mean(v), 3) if v else 0.0 for p, v in pillars.items()}
        TCI = round(0.4 * subscores["E"] + 0.3 * subscores["S"] + 0.3 * subscores["G"], 3)
        results.append({
            "company_id": cid,
            **subscores,
            "TCI": TCI,
            "updated_at": datetime.utcnow().isoformat()
        })

    out_path = os.path.join(out_dir, "companies_tci.json")
    json.dump(results, open(out_path, "w"), indent=2)
    print(f"[✓] Saved {out_path}")
    return results

if __name__ == "__main__":
    aggregate_company_scores("claims", "verification", "outputs/scores")
