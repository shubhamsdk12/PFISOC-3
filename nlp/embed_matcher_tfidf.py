#!/usr/bin/env python3
"""
TF-IDF fallback embed matcher for demo (no sentence-transformers required).

Usage:
 python nlp/embed_matcher_tfidf.py --claims_dir claims/ --snippets data/cleaned/snippets.jsonl --out_dir verification/ --top_k 10

Produces verification/{claim_id}_evidence.json files with same schema as embed_matcher.py
"""

import argparse, json, math, re
from pathlib import Path
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from tqdm import tqdm

NUM_UNIT_RE = re.compile(r"(\d+(?:\.\d+)?)\s*(%|percent|percentage|tco2e|tonnes?|tons?|kg)\b", re.I)

def load_snippets(path):
    out = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line=line.strip()
            if not line: continue
            try:
                out.append(json.loads(line))
            except:
                continue
    return out

def load_claims_from_dir(claims_dir):
    claims=[]
    for p in Path(claims_dir).glob("*.json"):
        with open(p,"r",encoding="utf-8") as f:
            claims.append(json.load(f))
    return claims

def parse_numeric_from_text(text):
    m = NUM_UNIT_RE.search(text)
    if not m: return None, None
    try:
        return float(m.group(1)), m.group(2).lower()
    except:
        return None, None

def label_snippet_for_claim(claim, snippet, sim_score, tolerances):
    claim_val = claim.get("numeric_value")
    claim_unit = claim.get("unit")
    sn_text = snippet.get("text","")
    sn_val, sn_unit = parse_numeric_from_text(sn_text)
    # Numeric comparison when possible
    if claim_val is not None and sn_val is not None:
        # handle percent specially
        if claim_unit and "percent" in str(claim_unit).lower():
            # absolute diff in percentage points
            if abs(claim_val - sn_val) <= tolerances.get("percent_abs_tolerance", 2.0):
                return "support", float(sim_score)
            else:
                if abs(claim_val - sn_val) / max(abs(claim_val),1.0) > 0.1 and sim_score>0.5:
                    return "contradict", float(sim_score)
                return "insufficient", float(sim_score)
        else:
            # relative tolerance
            rel = abs(claim_val - sn_val) / max(abs(claim_val), 1.0)
            if rel <= tolerances.get("abs_frac_tolerance", 0.05):
                return "support", float(sim_score)
            elif rel > tolerances.get("abs_frac_tolerance",0.05)*3 and sim_score>0.55:
                return "contradict", float(sim_score)
            else:
                return "insufficient", float(sim_score)
    # fallback semantic-only
    txt = sn_text.lower()
    if any(w in txt for w in ["increase", "increased", "rising"]) and "reduce" in claim.get("claim_text","").lower():
        return "contradict", float(sim_score)
    if sim_score >= 0.75:
        return "support", float(sim_score)
    if sim_score >= 0.60:
        return "insufficient", float(sim_score)
    return "insufficient", float(sim_score)

def aggregate_scores(evidence_items):
    sup=0.0; con=0.0
    for it in evidence_items:
        if it["label"]=="support":
            sup = max(sup, it["score"])
        elif it["label"]=="contradict":
            con = max(con, it["score"])
    return sup, con

def main(args):
    claims = load_claims_from_dir(args.claims_dir)
    if not claims:
        print("No claims found in", args.claims_dir); return
    snippets = load_snippets(args.snippets)
    # Build corpus for TF-IDF (snippets texts)
    all_texts = [s.get("text","") for s in snippets]
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    if len(all_texts)==0:
        print("No snippets"); return
    tfidf_snips = vectorizer.fit_transform(all_texts)  # shape (n_snips, n_feats)

    # For quick company grouping, create index list
    snippet_ids = [s.get("snippet_id") for s in snippets]
    snippet_by_company = {}
    for idx, s in enumerate(snippets):
        snippet_by_company.setdefault(s.get("company_id","unknown"), []).append((idx, s))

    out_dir = Path(args.out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    tolerances = {"percent_abs_tolerance": args.percent_abs_tolerance, "abs_frac_tolerance": args.abs_frac_tolerance}

    for claim in tqdm(claims, desc="Claims"):
        cid = claim.get("company_id") or "unknown"
        # candidate snippets: same company + news/ngo (we'll use all snippets but prefer same-company ones first)
        cand_indices = list(range(len(snippets)))
        # embed claim via tfidf using same vectorizer
        claim_vec = vectorizer.transform([claim.get("claim_text","")])
        sims = cosine_similarity(claim_vec, tfidf_snips)[0]  # length n_snips
        # sort top_k
        top_idx = np.argsort(-sims)[:args.top_k]
        evidence_list=[]
        for idx in top_idx:
            s = snippets[idx]
            sim_score = float(sims[idx])
            label, lbl_score = label_snippet_for_claim(claim, s, sim_score, tolerances)
            ev = {
                "snippet_id": s.get("snippet_id"),
                "score": sim_score,
                "label": label,
                "source_id": s.get("source_id", s.get("snippet_id")),
                "source_type": s.get("type", s.get("source_type", "unknown")),
                "snippet_text": s.get("text","")[:1000]
            }
            evidence_list.append(ev)
        support_score, contradict_score = aggregate_scores(evidence_list)
        final_verdict = "insufficient"
        if contradict_score > support_score and contradict_score > args.verdict_threshold:
            final_verdict = "contradicted"
        elif support_score >= contradict_score and support_score > args.verdict_threshold:
            final_verdict = "supported"
        else:
            final_verdict = "insufficient"
        out = {
            "claim_id": claim.get("claim_id"),
            "company_id": cid,
            "top_evidence": evidence_list,
            "support_score": support_score,
            "contradict_score": contradict_score,
            "final_verdict": final_verdict
        }
        out_file = out_dir / f"{claim.get('claim_id')}_evidence.json"
        with open(out_file, "w", encoding="utf-8") as fw:
            json.dump(out, fw, indent=2, ensure_ascii=False)
    print("TF-IDF verification complete. Files written to", out_dir)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--claims_dir", default="claims/")
    parser.add_argument("--snippets", required=True)
    parser.add_argument("--out_dir", default="verification/")
    parser.add_argument("--top_k", type=int, default=10)
    parser.add_argument("--percent_abs_tolerance", type=float, default=2.0)
    parser.add_argument("--abs_frac_tolerance", type=float, default=0.05)
    parser.add_argument("--verdict_threshold", type=float, default=0.55)
    args = parser.parse_args()
    main(args)
