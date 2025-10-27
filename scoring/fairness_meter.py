"""
Fairness Meter – checks if E/S/G pillars are proportionally represented.
"""

import json, os, glob

def compute_fairness(claims_dir, metric_map_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    metric_map = json.load(open(metric_map_path))
    per_company = {}

    for path in glob.glob(os.path.join(claims_dir, "*.json")):
        claim = json.load(open(path))
        cid = claim["company_id"]
        metric = claim.get("metric", "").lower()
        pillar = metric_map.get(metric, "E")
        per_company.setdefault(cid, {"E":0,"S":0,"G":0})
        per_company[cid][pillar]+=1

    fairness = []
    for cid, counts in per_company.items():
        vals = list(counts.values())
        fairness_ratio = min(vals)/max(vals) if max(vals)>0 else 0
        fairness.append({
            "company_id": cid,
            **counts,
            "fairness_ratio": round(fairness_ratio,2),
            "flag": "biased" if fairness_ratio<0.5 else "balanced"
        })

    out_path = os.path.join(out_dir, "fairness_meter.json")
    json.dump(fairness, open(out_path,"w"), indent=2)
    print(f"[✓] Saved {out_path}")
    return fairness

if __name__=="__main__":
    compute_fairness("claims","mappings/metrics_map.json","outputs/scores")
