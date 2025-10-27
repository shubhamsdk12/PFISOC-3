#!/usr/bin/env python3
"""
nlp/build_graph.py

Builds a lightweight graph per company linking Company -> Claim -> Snippet (evidence).
Writes graph/{company_id}_graph.json which is a node/edge export friendly to Plotly or D3.

Usage:
  python nlp/build_graph.py --claims_dir claims/ --verification_dir verification/ --snippets data/cleaned/snippets.jsonl --out_dir graph/
"""

import argparse
import json
from pathlib import Path
import networkx as nx

def load_claims(claims_dir):
    claims = {}
    for p in Path(claims_dir).glob("*.json"):
        with open(p, "r", encoding="utf-8") as f:
            c = json.load(f)
            claims[c['claim_id']] = c
    return claims

def load_verifications(verification_dir):
    ver = {}
    for p in Path(verification_dir).glob("*.json"):
        with open(p, "r", encoding="utf-8") as f:
            v = json.load(f)
            ver[v['claim_id']] = v
    return ver

def load_snippets(snippets_path):
    snippets = {}
    with open(snippets_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            s = json.loads(line)
            snippets[s['snippet_id']] = s
    return snippets

def build_graph_for_company(company_id, claims, verifications, snippets):
    G = nx.DiGraph()
    # add company node
    G.add_node(f"Company:{company_id}", label=company_id, type="company")

    # iterate claims for this company
    for claim_id, claim in claims.items():
        if claim.get("company_id") != company_id:
            continue
        G.add_node(f"Claim:{claim_id}", label=claim.get("claim_text")[:120], type="claim", metric=claim.get("metric"))
        G.add_edge(f"Company:{company_id}", f"Claim:{claim_id}", relation="claims_from")

        v = verifications.get(claim_id)
        if not v:
            continue
        for ev in v.get("top_evidence", []):
            sid = ev.get("snippet_id")
            snippet = snippets.get(sid, {"text": ev.get("snippet_text", "")})
            node_id = f"Snippet:{sid}"
            if node_id not in G:
                G.add_node(node_id, label=snippet.get("text","")[:120], type="snippet", source_id=ev.get("source_id"))
            G.add_edge(f"Claim:{claim_id}", node_id, relation=ev.get("label"), score=ev.get("score"))

    return G

def export_graph_json(G, out_path):
    data = nx.node_link_data(G)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main(args):
    claims = load_claims(args.claims_dir)
    verifications = load_verifications(args.verification_dir)
    snippets = load_snippets(args.snippets)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # compute set of companies
    companies = set(c.get("company_id") for c in claims.values())
    for comp in companies:
        G = build_graph_for_company(comp, claims, verifications, snippets)
        out_file = out_dir / f"{comp}_graph.json"
        export_graph_json(G, out_file)
        print("Wrote graph for", comp, "->", out_file)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--claims_dir", default="claims/", help="claims directory")
    parser.add_argument("--verification_dir", default="verification/", help="verification dir")
    parser.add_argument("--snippets", default="data/cleaned/snippets.jsonl", help="snippets jsonl")
    parser.add_argument("--out_dir", default="graph/", help="output graph dir")
    args = parser.parse_args()
    main(args)
