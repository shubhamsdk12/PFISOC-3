#!/usr/bin/env python3
"""
explain/llm_wrapper.py

Reads: claims/, verification/
Writes: explain/explanations/*.json

Usage:
  python explain/llm_wrapper.py --task summarize
  python explain/llm_wrapper.py --task inspect --claim_id claim_tatapower_739e418c

If OpenAI key available, uncomment API section; else it uses mock summaries.
"""

import argparse, json, os
from pathlib import Path
from datetime import datetime

# Optional: uncomment if you want to use real OpenAI calls
# from openai import OpenAI
# client = OpenAI()

CLAIMS_DIR = Path("claims")
VERIF_DIR = Path("verification")
OUT_DIR = Path("explain/explanations")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def load_claims():
    claims = []
    for f in sorted(CLAIMS_DIR.glob("*.json")):
        with open(f, "r", encoding="utf-8") as fp:
            claims.append(json.load(fp))
    return claims

def load_verifications():
    verifs = {}
    for f in VERIF_DIR.glob("*_evidence.json"):
        with open(f, "r", encoding="utf-8") as fp:
            verifs[Path(f).stem.split("_evidence")[0]] = json.load(fp)
    return verifs

def build_prompt_for_claim(claim, verifs):
    evidences = verifs.get(claim["claim_id"], [])
    ev_texts = [ev["text"] for ev in evidences[:5]] if isinstance(evidences, list) else []
    text = f"""
Claim: {claim['claim_text']}
Metric: {claim.get('metric')}
Value: {claim.get('numeric_value')} {claim.get('unit')}
Evidence snippets:
- {'\n- '.join(ev_texts) if ev_texts else 'None'}

Task: Summarize the claim’s credibility, explain which evidence supports or contradicts it,
assign a confidence (0-1), and a risk_flag = low/medium/high.
Output JSON with keys: summary, confidence, risk_flag.
"""
    return text.strip()

def mock_llm_response(prompt: str):
    # Simple heuristic fallback
    confidence = 0.85 if "reduce" in prompt.lower() else 0.65
    risk_flag = "low" if confidence > 0.8 else "medium"
    summary = "This claim appears credible with supporting evidence." if confidence > 0.8 else "Some evidence gaps detected; moderate reliability."
    return {"summary": summary, "confidence": confidence, "risk_flag": risk_flag}

def summarize_all():
    claims = load_claims()
    verifs = load_verifications()
    for claim in claims:
        cid = claim["claim_id"]
        prompt = build_prompt_for_claim(claim, verifs)
        # For offline hackathon demo, skip actual LLM call:
        result = mock_llm_response(prompt)
        out_path = OUT_DIR / f"{cid}.json"
        result.update({
            "claim_id": cid,
            "timestamp": datetime.utcnow().isoformat()
        })
        with open(out_path, "w", encoding="utf-8") as fp:
            json.dump(result, fp, indent=2)
        print(f"✅ Wrote explanation: {out_path.name}")
    print("\nAll claims summarized.")

def inspect_one(claim_id: str):
    claims = {c["claim_id"]: c for c in load_claims()}
    if claim_id not in claims:
        print(f"❌ Claim {claim_id} not found.")
        return
    verifs = load_verifications()
    prompt = build_prompt_for_claim(claims[claim_id], verifs)
    print("\n--- PROMPT PREVIEW ---\n")
    print(prompt[:1000])
    print("\n--- MOCK LLM OUTPUT ---\n")
    print(json.dumps(mock_llm_response(prompt), indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", required=True, choices=["summarize", "inspect"], help="Task to run.")
    parser.add_argument("--claim_id", help="Claim ID for inspection.")
    args = parser.parse_args()

    if args.task == "summarize":
        summarize_all()
    elif args.task == "inspect":
        if not args.claim_id:
            print("❌ Please provide --claim_id for inspect mode.")
        else:
            inspect_one(args.claim_id)

