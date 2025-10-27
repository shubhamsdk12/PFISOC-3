"""
Confidence Timeline – builds simple chronological trend of TCI per company.
"""

import json, os, glob
from datetime import datetime
from collections import defaultdict

def build_timeline(scores_dir, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    tci_path = os.path.join(scores_dir, "companies_tci.json")
    if not os.path.exists(tci_path):
        print("No TCI data found yet.")
        return
    data = json.load(open(tci_path))
    timeline = defaultdict(list)
    for entry in data:
        timeline[entry["company_id"]].append({
            "date": entry.get("updated_at", datetime.utcnow().isoformat()),
            "TCI": entry["TCI"]
        })
    for cid, series in timeline.items():
        series.sort(key=lambda x:x["date"])
        json.dump(series, open(os.path.join(out_dir, f"timeline_{cid}.json"),"w"), indent=2)
    print(f"[✓] Saved timelines to {out_dir}")

if __name__=="__main__":
    build_timeline("outputs/scores","outputs/scores")
